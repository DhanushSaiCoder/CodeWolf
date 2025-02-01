const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config()
//7Y2XdJtpsmwmE2Be
//mongodb+srv://dhanushsai1467:<db_password>@maincluster.uu0jc.mongodb.net/?retryWrites=true&w=majority&appName=MainCluster

const port = process.env.PORT || 3000;
const authRoutes = require('./routes/auth')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json())
app.use('/auth', authRoutes)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})