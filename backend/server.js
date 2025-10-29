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
const submitRoutes = require('./routes/submit.routes')

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
app.use('/submit', submitRoutes)

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
      socket.disconnect();
      return;
    }
  } else {
    socket.disconnect();
    return;
  }

  // Listen for match request events and forward them to the target user
  socket.on('requestMatch', (data) => {
    const { userId: targetUserId } = data;
    io.to(targetUserId).emit('sendMatchRequest', data);
  });

  // Listen for request rejection events
  socket.on('requestRejected', (data) => {
    const { requesterId } = data;
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
      io.to(players).emit('beginMatch', payload);
    }
  }
  );

  socket.on('endMatch', async (payload) => {
    const { match, winner_id } = payload
    const loser_id = match.players[0].id == winner_id ? match.players[1].id : match.players[0].id

    let updatedMatch = match;

    if (match.status != "completed") {
      // STEP 1: update the Match doc in the db - update status, winner & loser
      updatedMatch = await Match.findByIdAndUpdate(
        match._id,
        { status: "completed", winner: winner_id, loser: loser_id },
        { new: true }
      );
    }

    if (!updatedMatch) return res.status(404).json({ message: "Match not found (or) Match not found in the payload of the socket event ''endMatch''." });

    //STEP 2: Send "matchEnded" event to the other player(get loserSocketId using loser_id from userSocketMap)
    const loserSocketId = userSocketMap.get(loser_id)
    socket.to(loserSocketId).emit('matchEnded', {
      match: updatedMatch
    })
  })

  socket.on("drawMatch",async (matchDoc) => {
    // update the match doc in db- set status to "completed"
    const match = await Match.findById(matchDoc._id)
    if(!match) return
    match.status = "completed"
    await match.save()
  })

  socket.on('disconnect', async () => {
    if (userId) {
      await updateUserStatus(userId, 'offline');
      userSocketMap.delete(userId);
      socket.leave(userId);
      console.log(`[USER_CONN_UPT] User ${userId} disconnected`)

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
