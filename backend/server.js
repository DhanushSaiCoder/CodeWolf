const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors'); // Import cors
dotenv.config()

const port = process.env.PORT || 3000;
const authRoutes = require('./routes/auth')
const matchRoutes = require('./routes/matches')
const friendsRoutes = require('./routes/friends')
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
    app.use(cors());
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/matches', matchRoutes)
app.use('/friends', friendsRoutes)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})