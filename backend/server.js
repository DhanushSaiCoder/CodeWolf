const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const port = process.env.PORT || 3000;
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const friendsRoutes = require('./routes/friends');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

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
        origin: "*", // Update this with your frontend URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
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
