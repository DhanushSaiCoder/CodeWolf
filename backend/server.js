// Server.js
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { User } = require('./models/User'); // Corrected path for User model
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

const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST'],
  },
});

// Functions to handle online and offline users
const onlineUser = async (token, socket) => {
  try {
    console.log('User making online:', token);
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (user) {
      user.status = 'online';
      const result = await user.save();
      console.log('Online result:', result.username, result.status);

      // Broadcast to all clients that a user is online
      io.emit('onlineUser', result.username);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.log('Invalid token:', err.message);
  }
};

const offlineUser = async (token, socket) => {
  try {
    console.log('User making offline:', token);
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (user) {
      user.status = 'offline';
      const result = await user.save();
      console.log('Offline result:', result.username, result.status);

      // Broadcast to all clients that a user is offline
      io.emit('offlineUser', result.username);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.log('Invalid token:', err.message);
  }
};

io.on('connection', (socket) => {
  console.log('A user connected');

  let token; // Variable to store the user's token

  // Listen for token from client
  socket.on('sendToken', async (receivedToken) => {
    token = receivedToken; // Store the token
    await onlineUser(token, socket); // Pass socket to onlineUser
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected');
    await offlineUser(token, socket); // Use the stored token
  });

  // Example event
  socket.on('exampleEvent', (data) => {
    console.log(data);
    io.emit('exampleEventResponse', { msg: 'Hello from server!' });
  });
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
