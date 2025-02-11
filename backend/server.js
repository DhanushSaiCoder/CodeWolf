const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { User } = require('./models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

const port = process.env.PORT || 3001;
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const friendsRoutes = require('./routes/friends');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/matches', matchRoutes);
app.use('/friends', friendsRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Create an HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Map to store userId and their socket IDs
const userSocketMap = new Map();

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
  socket.on('beginMatch', async ({ requesterId, receiverId }) => {
    console.log(`Match started between ${requesterId} and ${receiverId}`);

    const requesterSocketId = userSocketMap.get(requesterId);
    const receiverSocketId = userSocketMap.get(receiverId);

    // Replace these placeholder values with the actual data
    const requesterUserName = "Requester'sUsername"; // Replace with actual value
    const requesterRating = 1500;                  // Replace with actual value
    const receiverUserName = "Receiver'sUsername"; // Replace with actual value
    const receiverRating = 1500;                   // Replace with actual value

    // Build the match object according to the server's schema
    const matchObj = {
      players: [
        {
          id: requesterId,
          username: requesterUserName,
          rating: requesterRating
        },
        {
          id: receiverId,
          username: receiverUserName,
          rating: receiverRating
        }
      ]
      // Add any additional required fields here
    };

    // Declare createdMatch in the outer scope so it can be accessed later
    let createdMatch;

    try {
      const response = await fetch('http://localhost:5000/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchObj)
      });

      if (!response.ok) {
        // Optionally, read the error details returned by the server
        const errorDetails = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorDetails}`);
      }

      // If the request was successful, parse the created match document
      createdMatch = await response.json();
      console.log('Match created with ID:', createdMatch._id);
    } catch (error) {
      console.error('Error creating match:', error);
    }

    // Deduplicate socket IDs in case they are the same
    const players = [...new Set([requesterSocketId, receiverSocketId])].filter(id => id);

    // Optionally, emit createdMatch only if it was successfully created
    const payload = { requesterId, receiverId };
    if (createdMatch) {
      payload.createdMatch = createdMatch;
    }

    if (players.length > 0) {
      console.log('sending to players: ', payload)
      io.to(players).emit('beginMatch', payload);
    }
  });


  socket.on('disconnect', async () => {
    console.log('User disconnected');
    if (userId) {
      await updateUserStatus(userId, 'offline');
      userSocketMap.delete(userId);
      socket.leave(userId);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
