const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Allow only the React frontend
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow only the React frontend
    methods: ["GET", "POST"],
    credentials: true
  }
});

let text = "";

io.on('connection', (socket) => {
  socket.emit('text-update', text);

  socket.on('text-changed', (newText) => {
    text = newText;
    socket.broadcast.emit('text-update', newText);
  });
});

server.listen(3001, () => console.log('Server listening on port 3001'));
