const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

require('dotenv').config();
const { PORT } = require('./config')

const adminRouter = require('./Routes/admin');
const userRouter = require('./Routes/user');
const limitter = require('./rateLimitter');

app.use(limitter);

app.use(express.json());
app.use('/admin', adminRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => {
    console.log('Welcome to the API.');
})

app.use('/', (req, res) => {
    res.status(400).json({message: "Wrong route."});
})

app.listen(PORT, ()=> {
    console.log("App is listening on port: " +PORT);
});