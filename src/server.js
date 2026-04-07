const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/jobs', require('./routes/jobsRoute'));
app.use('/api/messages', require('./routes/messageRoute'));
app.use('/api/admin', require('./routes/adminRoute'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    if (userId) socket.join(userId);
  });

  socket.on('send_message', (data) => {
    if (!data || !data.receiverId) return;
    socket.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running with sockets on port ${PORT}`);
});