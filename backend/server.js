// Server.js
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

const port = process.env.PORT || 3001; // Changed to 3001 for the server port
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
    origin: 'http://localhost:3000', // Frontend URL
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
  let userId; // Variable to store the user's ID

  // Listen for token from client
  socket.on('sendToken', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      userId = decoded._id; // Store the user's ID

      // Map the user ID to their socket ID
      userSocketMap.set(userId, socket.id);

      await updateUserStatus(userId, 'online');
    } catch (err) {
      console.log('Invalid token:', err.message);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected');
    if (userId) {
      await updateUserStatus(userId, 'offline');

      // Remove the user from the socket map
      userSocketMap.delete(userId);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
