require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve collaborative demo from production-server/public at /collab
const collabPublic = path.join(__dirname, 'public');
app.use('/collab', express.static(collabPublic));
app.get('/collab', (req, res) => {
  res.sendFile(path.join(collabPublic, 'index.html'));
});

// Serve built frontend (existing) if present
// Webpack writes frontend bundle to frontend/editor/public/dist/bundle.js
const frontendDist = path.join(__dirname, '..', 'frontend', 'editor', 'public', 'dist');
if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // fallback to the editor index if a non-api route is requested
  app.get('*', (req, res, next) => {
    const indexFile = path.join(__dirname, '..', 'frontend', 'editor', 'index.html');
    res.sendFile(indexFile, (err) => {
      if (err) next(err);
    });
  });
}

const server = http.createServer(app);

// Socket.IO for collaborative editing with presence and cursor positions
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory stores (not durable)
const docs = new Map(); // room -> content string
const usersByRoom = new Map(); // room -> Map(socketId -> {id,name,color})

function randomColor() {
  // pastel palette
  const hues = [200, 220, 260, 30, 10, 140, 340, 60];
  const h = hues[Math.floor(Math.random() * hues.length)];
  return `hsl(${h} 70% 60%)`;
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', (room = 'default', userInfo = {}) => {
    socket.join(room);
    socket.room = room;
    socket.user = {
      id: socket.id,
      name: userInfo.name || `User-${socket.id.slice(0, 4)}`,
      color: userInfo.color || randomColor(),
    };

    if (!usersByRoom.has(room)) usersByRoom.set(room, new Map());
    usersByRoom.get(room).set(socket.id, socket.user);

    // send current doc state
    const state = docs.get(room) || '';
    socket.emit('doc', state);

    // broadcast updated presence list to room
    const users = Array.from(usersByRoom.get(room).values());
    io.to(room).emit('presence', users);
  });

  socket.on('content', ({ room = socket.room, content }) => {
    if (!room) return;
    docs.set(room, content);
    socket.to(room).emit('content', content);
  });

  socket.on('cursor', ({ room = socket.room, rect }) => {
    if (!room) return;
    // rect should be {x,y,height,width} relative to viewport
    const payload = { id: socket.id, user: socket.user, rect };
    socket.to(room).emit('cursor', payload);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
    const room = socket.room;
    if (room && usersByRoom.has(room)) {
      usersByRoom.get(room).delete(socket.id);
      const users = Array.from(usersByRoom.get(room).values());
      io.to(room).emit('presence', users);
      io.to(room).emit('leave', socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Underbranch production server listening on port ${PORT}`);
  console.log(`Serving frontend from: ${frontendDist}`);
});
