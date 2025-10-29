const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

// In-memory room and document state
const rooms = {};

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} -> ${req.method} ${req.url}`);
    next();
});

// Serve static files from dist directory (where webpack outputs bundle.js)
app.use("/dist", express.static(path.join(__dirname, "dist")));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// --- Socket.IO Collaboration Logic ---
io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // Check if a room exists
    socket.on("check-room", ({ roomId }) => {
        const exists = !!rooms[roomId];
        const isPasswordProtected = exists && !!rooms[roomId].password;
        socket.emit("room-check-result", { exists, isPasswordProtected, roomId });
    });

    // Join or create a room
    socket.on("join-room", ({ roomId, userData, password, createRoom }) => {
        if (!roomId) {
            socket.emit("room-join-error", { error: "room-not-found", message: "Room name required." });
            return;
        }
        // Create room if needed
        if (!rooms[roomId]) {
            if (createRoom) {
                rooms[roomId] = {
                    users: [],
                    content: "",
                    password: password || null,
                };
            } else {
                socket.emit("room-join-error", { error: "room-not-found", message: "Room does not exist." });
                return;
            }
        }
        // Password check
        if (rooms[roomId].password && rooms[roomId].password !== password) {
            socket.emit("room-join-error", { error: "invalid-password", message: "Incorrect password." });
            return;
        }
        // Add user to room
        currentRoom = roomId;
        currentUser = { ...userData, userId: socket.id };
        socket.join(roomId);
        // Remove user from any previous room
        Object.keys(rooms).forEach((rid) => {
            rooms[rid].users = rooms[rid].users.filter((u) => u.userId !== socket.id);
        });
        rooms[roomId].users.push(currentUser);
        // Send current document and users
        socket.emit("room-joined", {
            roomId,
            content: rooms[roomId].content,
            users: rooms[roomId].users,
            isPasswordProtected: !!rooms[roomId].password,
        });
        // Notify others
        io.to(roomId).emit("users-update", rooms[roomId].users);
    });

    // Document change
    socket.on("document-change", ({ content }) => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].content = content;
            socket.to(currentRoom).emit("document-update", {
                content,
                userId: socket.id,
            });
        }
    });

    // Cursor update
    socket.on("cursor-update", (data) => {
        if (currentRoom && rooms[currentRoom]) {
            socket.to(currentRoom).emit("cursor-update", {
                ...data,
                user: currentUser,
                userId: socket.id,
            });
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].users = rooms[currentRoom].users.filter((u) => u.userId !== socket.id);
            io.to(currentRoom).emit("users-update", rooms[currentRoom].users);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ LaTeX Editor Server with Collaboration Running!`);
    console.log(`\n📝 Open your browser to: http://localhost:${PORT}`);
    console.log(
        `\n📦 Serving bundle.js from: ${path.join(__dirname, "dist", "bundle.js")}`,
    );
    console.log(`\n🔧 Press Ctrl+C to stop the server\n`);
});
