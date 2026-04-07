const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // Import the function
// Source - https://stackoverflow.com/a/79875907
// Posted by Sudarsan Sarkar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-06, License - CC BY-SA 4.0

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