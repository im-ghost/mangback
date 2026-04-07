const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const dns = require("node:dns/promises");
const http = require('http');
const { Server } = require('socket.io');

dns.setServers(["1.1.1.1", "1.0.0.1"]);


// 1. Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" } // Your React frontend
});

// Real-time logic
io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  // User joins a private room based on their ID
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  // Sending a message
  socket.on('send_message', (data) => {
    // Emit the message only to the receiver's room
    socket.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

server.listen(5000, () => console.log('Server running with Sockets on port 5000'));
// Import Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/jobs', require('./routes/jobsRoute'));

app.listen(process.env.PORT, () => console.log('Server is running!'));