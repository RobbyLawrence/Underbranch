
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// In-memory room state (for demo; use a DB for production)
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
    let userData = null;

    // Check if a room exists
    socket.on("check-room", ({ roomId }) => {
        const exists = !!rooms[roomId];
        const isPasswordProtected = exists && !!rooms[roomId].password;
        socket.emit("room-check-result", { exists, isPasswordProtected, roomId });
    });

    // Join or create a room
    socket.on("join-room", ({ roomId, userData: user, password, createRoom }) => {
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
            socket.emit("room-join-error", { error: "invalid-password", message: "Invalid password." });
            return;
        }
        // Add user to room
        currentRoom = roomId;
        userData = { ...user, userId: socket.id };
        socket.join(roomId);
        // Remove user if already present
        rooms[roomId].users = rooms[roomId].users.filter((u) => u.userId !== socket.id);
        rooms[roomId].users.push(userData);
        // Send current doc content and user list
        socket.emit("room-joined", {
            roomId,
            content: rooms[roomId].content,
            users: rooms[roomId].users,
            isPasswordProtected: !!rooms[roomId].password,
        });
        // Notify others
        io.to(roomId).emit("users-update", rooms[roomId].users);
    });

    // Handle document changes
    socket.on("document-change", (data) => {
        if (!currentRoom) return;
        rooms[currentRoom].content = data.content;
        socket.to(currentRoom).emit("document-update", { ...data, userId: socket.id });
    });

    // Handle cursor updates
    socket.on("cursor-update", (data) => {
        if (!currentRoom) return;
        socket.to(currentRoom).emit("cursor-update", { ...data, user: userData, userId: socket.id });
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
    console.log(`\n✅ LaTeX Editor Server Running!`);
    console.log(`\n📝 Open your browser to: http://localhost:${PORT}`);
    console.log(
        `\n📦 Serving bundle.js from: ${path.join(__dirname, "dist", "bundle.js")}`,
    );
    console.log(`\n🔧 Press Ctrl+C to stop the server\n`);
});
