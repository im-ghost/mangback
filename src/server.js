const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const dns = require("node:dns/promises");

dns.setServers(["1.1.1.1", "1.0.0.1"]);


// 1. Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/jobs', require('./routes/jobsRoute'));

app.listen(process.env.PORT, () => console.log('Server is running!'));