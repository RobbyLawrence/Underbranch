require('dotenv').config();
const path = require('path');
const fs = require('fs');
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

// Simple request logger to help debug frontend loading issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.url}`);
  next();
});

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
  // support legacy index paths that reference frontend/dist/bundle.js
  app.use('/frontend/dist', express.static(frontendDist));
  // fallback to the editor index for non-API routes (avoid swallowing /api/*)
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    const indexFile = path.join(__dirname, '..', 'frontend', 'editor', 'index.html');
    res.sendFile(indexFile, (err) => {
      if (err) next(err);
    });
  });
}

else {
  // If no built frontend exists, serve the collab demo at root so testing is easier
  app.get('/', (req, res) => {
    const collabIndex = path.join(collabPublic, 'index.html');
    if (fs.existsSync(collabIndex)) return res.sendFile(collabIndex);
    return res.status(404).send('No frontend available - collab demo missing');
  });
}

// Log static file 404s (helpful to see missing bundles)
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 404) {
      console.warn(`STATIC_MISS: ${req.method} ${req.originalUrl} -> 404`);
    }
  });
  next();
});

// Debug endpoints to inspect in-memory state when the frontend is stuck
app.get('/api/status', (req, res) => {
  res.json({
    port: PORT,
    frontendDistExists: fs.existsSync(frontendDist),
    collabPublicExists: fs.existsSync(path.join(__dirname, 'public')),
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/docs', (req, res) => {
  const rooms = [];
  for (const [room, content] of docs.entries()) {
    const users = usersByRoom.has(room) ? Array.from(usersByRoom.get(room).values()) : [];
    rooms.push({ room, length: content.length, users });
  }
  res.json({ rooms });
});

const server = http.createServer(app);

// Socket.IO for collaborative editing with presence and cursor positions
const io = new Server(server, {
  cors: {
    // allow local test origin (python http.server) and the node server itself
    origin: ['http://localhost:8000', 'http://localhost:3001', '*'],
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
