const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { User } = require('./models/User');
const { Match } = require('./models/Match')
const jwt = require('jsonwebtoken');

dotenv.config();

const port = process.env.PORT || 3001;
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const friendsRoutes = require('./routes/friends');
const questionsRoutes = require('./routes/questions.route');
const runRoutes = require("./routes/run.routes")

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/matches', matchRoutes);
app.use('/friends', friendsRoutes);
app.use('/questions', questionsRoutes);
app.use('/run', runRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Create an HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Map to store userId and their socket IDs
const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');
  let userId; // Will store the user's ID

  // Retrieve the token from the handshake auth data
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      userId = decoded._id; // Store the user's ID
      // Map the user ID to their socket ID and join a room for that user
      userSocketMap.set(userId, socket.id);
      socket.join(userId);
      updateUserStatus(userId, 'online');
    } catch (err) {
      console.log('Invalid token on connection:', err.message);
      socket.disconnect();
      return;
    }
  } else {
    console.log('No token provided');
    socket.disconnect();
    return;
  }

  // Listen for match request events and forward them to the target user
  socket.on('requestMatch', (data) => {
    const { userId: targetUserId } = data;
    console.log(`Forwarding match request to user ID ${targetUserId}`);
    io.to(targetUserId).emit('sendMatchRequest', data);
  });

  // Listen for request rejection events
  socket.on('requestRejected', (data) => {
    const { requesterId } = data;
    console.log(`Match request rejected by ${userId} for request from ${requesterId}`);
    // Forward the rejection to the requester
    io.to(requesterId).emit('requestRejected', {
      ...data,
      receiverId: userId,
      receiverUsername: data.receiverUsername || "Opponent" // Optionally include more info
    });
  });

  // Listen for request acceptance events
  socket.on('requestAccepted', (data) => {
    const { requesterId } = data;
    console.log(`Match request accepted by ${userId} for request from ${requesterId}`);
    io.to(requesterId).emit('requestAccepted', {
      ...data,
      receiverId: userId,
      receiverUsername: data.receiverUsername || "Opponent"
    });
  });

  // Handle the beginMatch event
  // At the top of your file, import the Match model
  socket.on('beginMatch', async (
    {
      requesterId,
      receiverId,
      playersDocs,
      mode,
      programmingLanguage,
      difficulty,
    }) => {
      // Log the match start
      console.log(`Match started between ${requesterId} and ${receiverId}`);
      console.log('playersDocs:', playersDocs);

      // Get socket IDs for the players
      const requesterSocketId = userSocketMap.get(requesterId);
      const receiverSocketId = userSocketMap.get(receiverId);

      // Helper function to extract player info from playersDocs
      const getPlayerInfo = (id, key) => {
        if (Array.isArray(playersDocs)) {
          return playersDocs.find((player) => player._id === id) || {};
        } else if (playersDocs && typeof playersDocs === 'object') {
          return playersDocs[key] || {};
        }
        return {};
      };

      const requesterInfo = getPlayerInfo(requesterId, 'requester');
      const receiverInfo = getPlayerInfo(receiverId, 'receiver');

      // Build the match object
      const matchObj = {
        players: [
          {
            id: requesterId,
            username: requesterInfo.username,
            rating: requesterInfo.rating,
          },
          {
            id: receiverId,
            username: receiverInfo.username,
            rating: receiverInfo.rating,
          },
        ],
        difficulty,
        mode,
        language: programmingLanguage,
        status: 'pending',
      };

      // Create a new match
      let createdMatch;
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/matches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchObj),
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(
            `HTTP error! Status: ${response.status}. Details: ${errorDetails}`
          );
        }

        createdMatch = await response.json();
        console.log('Match created with ID:', createdMatch._id);
      } catch (error) {
        console.error('Error creating match:', error);
      }

      // Prepare the list of players to notify
      const players = [...new Set([requesterSocketId, receiverSocketId])].filter(Boolean);

      // Build the payload with the new match details
      const payload = {
        requesterId,
        receiverId,
        ...(createdMatch && { createdMatch }),
      };

      // Notify the players if there are valid socket IDs
      if (players.length > 0) {
        console.log('Sending to players:', payload);
        io.to(players).emit('beginMatch', payload);
      }
    }
  );

  socket.on('disconnect', async () => {
    console.log('User disconnected');
    if (userId) {
      await updateUserStatus(userId, 'offline');
      userSocketMap.delete(userId);
      socket.leave(userId);

      // Calculate the date/time for 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Update only pending matches older than 30 minutes to "canceled"
      try {
        const result = await Match.updateMany(
          {
            'players.id': userId,
            status: 'pending',
            createdAt: { $lte: thirtyMinutesAgo }
          },
          { $set: { status: 'canceled' } }
        );
        console.log(`Canceled pending matches for user ${userId} older than 30 minutes:`, result);
      } catch (error) {
        console.error(`Error canceling pending matches for user ${userId}:`, error);
      }
    }
  });

});


// Unified function to handle online and offline status updates
const updateUserStatus = async (userId, status) => {
  try {
    // Update the user's own status
    const user = await User.findById(userId);
    if (user) {
      user.status = status;
      await user.save();

      // Update the status in the friends arrays of other users
      await User.updateMany(
        {
          'friends.id': userId, // Users who have this user in their friends array
        },
        {
          $set: { 'friends.$[elem].status': status }, // Update the status field of the matching friend
        },
        {
          arrayFilters: [{ 'elem.id': userId }], // Filter to match the specific friend in the array
        }
      );

      console.log(`User ${user.username} is now ${status}`);

      // Emit status update to all connected clients
      io.emit('statusUpdate', { userId, status });
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.log('Error updating user status:', err.message);
  }
};



server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
