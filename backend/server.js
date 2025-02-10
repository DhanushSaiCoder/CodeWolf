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
  let userId; // Variable to store the user's ID
  
  // Retrieve the token from the handshake auth data
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      userId = decoded._id; // Store the user's ID
      // Map the user ID to their socket ID
      userSocketMap.set(userId, socket.id);
      // Join a room identified by the user ID
      socket.join(userId);
      updateUserStatus(userId, 'online');
    } catch (err) {
      console.log('Invalid token on connection:', err.message);
      // Optionally disconnect the socket if the token is invalid
      socket.disconnect();
      return;
    }
  } else {
    console.log('No token provided');
    socket.disconnect();
    return;
  }

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('User disconnected');
    if (userId) {
      await updateUserStatus(userId, 'offline');
      userSocketMap.delete(userId);
      socket.leave(userId);
    }
  });

  // Listen for match request events and forward them to the appropriate room
  socket.on('requestMatch', (data) => {
    const { userId, message, requesteeId } = data;
    console.log(`Forwarding match request to user ID ${userId}`);
    io.to(userId).emit('customEvent', { message, userId, requesteeId });
  });
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
