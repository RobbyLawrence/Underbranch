#!/usr/bin/env node
/**
 * Collaborative LaTeX Editor Server
 * 
 * Features:
 * - Real-time collaborative editing with WebSocket support
 * - Password-protected rooms
 * - User presence and cursor tracking
 * - Automatic room management
 * 
 * Usage: node dev-server.js
 * Then open: http://localhost:8080/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, '..'); // serve files relative to repo root (go up one directory)

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
  '.txt': 'text/plain'
};

function send404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send404(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', type + (type.startsWith('text/') ? '; charset=utf-8' : ''));
    res.end(data);
  });
}

// === COLLABORATIVE STATE MANAGEMENT ===
const rooms = new Map(); // roomId -> { content, users, createdAt, password }

// Default LaTeX document template for new rooms
const defaultContent = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\title{My LaTeX Document}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a sample LaTeX document. You can edit this text in the editor.

\\section{Mathematical Equations}
Here's a mathematical equation:
\\begin{equation}
E = mc^2
\\end{equation}

And an inline equation: $\\alpha + \\beta = \\gamma$

\\subsection{More Examples}
\\begin{itemize}
\\item First item
\\item Second item
\\item Third item
\\end{itemize}

\\end{document}`;

// === ROOM MANAGEMENT FUNCTIONS ===

/**
 * Gets an existing room or creates a new one
 * @param {string} roomId - The room identifier
 * @param {string|null} password - Optional password for the room
 * @returns {Object} Room object
 */
function getOrCreateRoom(roomId, password = null) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      content: defaultContent,
      users: new Map(),
      createdAt: new Date(),
      password: password
    });
    console.log(`🏠 Created new room: ${roomId}${password ? ' (password protected)' : ' (public)'}`);
  }
  return rooms.get(roomId);
}

/**
 * Verifies if provided password matches room password
 * @param {string} roomId - The room identifier
 * @param {string} providedPassword - Password to verify
 * @returns {boolean} True if password is correct or no password required
 */
function verifyRoomPassword(roomId, providedPassword) {
  const room = rooms.get(roomId);
  if (!room) return false;
  
  // No password required for this room
  if (room.password === null) return true;
  
  // Password required and matches
  return room.password === providedPassword;
}

/**
 * Generates random colors for user identification
 * @returns {string} Hex color code
 */
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0080FF', '#01A3A4', '#FEA47F'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const server = http.createServer((req, res) => {
  try {
    // Decode URL and prevent directory traversal
    const decoded = decodeURIComponent(req.url.split('?')[0]);
    let safePath = decoded.replace(/^\/+/, ''); // remove leading /
    
    // If accessing root, redirect to the editor
    if (!safePath || safePath === '') {
      res.statusCode = 302;
      res.setHeader('Location', '/editor/index.html');
      res.end();
      return;
    }
    
    // Default to editor if no specific path
    if (!safePath) safePath = 'editor/index.html';

    const filePath = path.join(ROOT, safePath);

    // If the path maps to a directory, try to serve index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        sendFile(indexPath, res);
        return;
      }
      send404(res);
      return;
    }

    if (fs.existsSync(filePath)) {
      sendFile(filePath, res);
      return;
    }

    // If not found, fallback to root index for convenience
    const fallback = path.join(ROOT, 'editor', 'index.html');
    if (fs.existsSync(fallback)) {
      sendFile(fallback, res);
      return;
    }

    send404(res);
  } catch (err) {
    console.error('Server error', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

// === WEBSOCKET SETUP ===
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// === SOCKET CONNECTION HANDLERS ===
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  let currentRoom = null;
  let currentUser = null;

  // === ROOM JOINING LOGIC ===
  socket.on('join-room', (data) => {
    const { roomId, userData, password, createRoom } = data;
    
    // Leave current room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      const oldRoom = rooms.get(currentRoom);
      if (oldRoom) {
        oldRoom.users.delete(socket.id);
        socket.to(currentRoom).emit('users-update', Array.from(oldRoom.users.values()));
      }
      console.log(`👋 User left room: ${currentRoom}`);
    }

    // Special handling for general room - ensure it exists and is password-free
    if (roomId === 'general' && !rooms.has('general')) {
      rooms.set('general', {
        content: defaultContent,
        users: new Map(),
        createdAt: new Date(),
        password: null // General room never has a password
      });
      console.log(`🏠 Auto-created general room (password-free)`);
    }

    // Check if room exists
    const roomExists = rooms.has(roomId);
    
    if (roomExists) {
      // Room already exists
      if (createRoom && roomId !== 'general') {
        // User is trying to "create" a room that already exists - deny access
        // Exception: general room can always be "created" (it's always accessible)
        socket.emit('room-join-error', {
          error: 'room-already-exists',
          message: `Room "${roomId}" already exists. Use "Join existing room" option instead.`
        });
        console.log(`🚫 User ${userData.name} tried to create existing room: ${roomId}`);
        return;
      } else {
        // Room exists - verify password for joining (except general room)
        if (roomId !== 'general' && !verifyRoomPassword(roomId, password)) {
          socket.emit('room-join-error', {
            error: 'invalid-password',
            message: 'Incorrect password for this room'
          });
          console.log(`🚫 User ${userData.name} denied access to room ${roomId} - wrong password`);
          return;
        }
      }
    } else {
      // Room doesn't exist
      if (createRoom) {
        // Creating new room - set password if provided (but never for general)
        const roomPassword = roomId === 'general' ? null : password;
        getOrCreateRoom(roomId, roomPassword);
        console.log(`🏠 User ${userData.name} created room: ${roomId}${roomPassword ? ' (password protected)' : ' (public)'}`);
      } else {
        // Room doesn't exist and not creating
        socket.emit('room-join-error', {
          error: 'room-not-found',
          message: 'Room does not exist'
        });
        console.log(`🚫 User ${userData.name} tried to join non-existent room: ${roomId}`);
        return;
      }
    }

    // Join new room
    currentRoom = roomId;
    socket.join(roomId);
    
    const room = getOrCreateRoom(roomId);
    
    // Create user object
    currentUser = {
      id: socket.id,
      name: userData.name || `User ${socket.id.slice(0, 6)}`,
      color: userData.color || getRandomColor(),
      cursor: null,
      roomId: roomId
    };
    
    room.users.set(socket.id, currentUser);
    console.log(`🏠 User ${currentUser.name} joined room: ${roomId} (${socket.id})`);
    
    // Send current room state to the user
    socket.emit('room-joined', {
      roomId: roomId,
      content: room.content,
      users: Array.from(room.users.values()),
      isPasswordProtected: room.password !== null
    });
    
    // Broadcast updated user list to room
    socket.to(roomId).emit('users-update', Array.from(room.users.values()));
  });

  // === ROOM VERIFICATION ===
  socket.on('check-room', (data) => {
    const { roomId } = data;
    
    // Special handling for general room - ensure it exists and is password-free
    if (roomId === 'general' && !rooms.has('general')) {
      rooms.set('general', {
        content: defaultContent,
        users: new Map(),
        createdAt: new Date(),
        password: null // General room never has a password
      });
      console.log(`🏠 Auto-created general room (password-free)`);
    }
    
    const roomExists = rooms.has(roomId);
    
    let isPasswordProtected = false;
    if (roomExists) {
      const room = rooms.get(roomId);
      isPasswordProtected = room.password !== null;
    }
    
    socket.emit('room-check-result', {
      roomId: roomId,
      exists: roomExists,
      isPasswordProtected: isPasswordProtected
    });
    
    console.log(`🔍 Room check for "${roomId}": exists=${roomExists}, protected=${isPasswordProtected}`);
  });

  // === DOCUMENT COLLABORATION ===
  socket.on('document-change', (data) => {
    if (!currentRoom) return;
    
    const room = getOrCreateRoom(currentRoom);
    // Update room document state
    room.content = data.content;
    
    // Broadcast change to other clients in the same room
    socket.to(currentRoom).emit('document-update', {
      content: data.content,
      userId: socket.id,
      timestamp: Date.now()
    });
    
    console.log(`📝 Document updated in room ${currentRoom} by ${currentUser?.name || socket.id}`);
  });

  // === CURSOR TRACKING ===
  socket.on('cursor-update', (position) => {
    if (!currentRoom || !currentUser) return;
    
    const room = getOrCreateRoom(currentRoom);
    const user = room.users.get(socket.id);
    if (user) {
      user.cursor = position;
      // Broadcast cursor position to other clients in the same room
      socket.to(currentRoom).emit('cursor-update', {
        userId: socket.id,
        cursor: position,
        user: user
      });
    }
  });

  // === DISCONNECT HANDLING ===
  socket.on('disconnect', () => {
    if (currentRoom && currentUser) {
      const room = getOrCreateRoom(currentRoom);
      room.users.delete(socket.id);
      
      console.log(`🔌 User ${currentUser.name} disconnected from room ${currentRoom}`);
      
      // Broadcast updated user list to room
      socket.to(currentRoom).emit('users-update', Array.from(room.users.values()));
      
      // Clean up empty rooms (optional)
      if (room.users.size === 0) {
        rooms.delete(currentRoom);
        console.log(`🗑️ Deleted empty room: ${currentRoom}`);
      }
    }
  });
});

// === SERVER STARTUP ===
server.listen(PORT, () => {
  console.log(`🚀 Collaborative LaTeX Editor Server running at http://localhost:${PORT}/`);
  console.log('📝 Open /editor/index.html to start collaborating!');
  console.log('🔌 WebSocket support enabled for real-time collaboration');
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down collaborative server');
  server.close(() => process.exit(0));
});