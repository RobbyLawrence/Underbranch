const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const PORT = process.env.PORT || 3000;

// this is where we store the rooms
const rooms = {};

// request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} -> ${req.method} ${req.url}`);
    next();
});

// serve /dist since that's where npm builds to
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use(express.static(__dirname));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// function to apply changes to content
function applyChangesToContent(content, changes) {
    let lines = content.split("\n");

    // sort changes by position in reverse order
    const sortedChanges = [...changes].sort((a, b) => {
        if (b.range.startLineNumber !== a.range.startLineNumber) {
            return b.range.startLineNumber - a.range.startLineNumber;
        }
        return b.range.startColumn - a.range.startColumn;
    });

    // apply each change
    for (const change of sortedChanges) {
        const startLine = change.range.startLineNumber - 1;
        const startCol = change.range.startColumn - 1;
        const endLine = change.range.endLineNumber - 1;
        const endCol = change.range.endColumn - 1;

        if (startLine === endLine) {
            // single line change
            const line = lines[startLine] || "";
            lines[startLine] =
                line.substring(0, startCol) +
                change.text +
                line.substring(endCol);
        } else {
            // otherwise we have a multi-line change
            const firstLine = (lines[startLine] || "").substring(0, startCol);
            const lastLine = (lines[endLine] || "").substring(endCol);
            const newLines = change.text.split("\n");

            // replace the affected lines
            lines.splice(
                startLine,
                endLine - startLine + 1,
                firstLine + newLines[0],
                ...newLines.slice(1, -1),
                newLines[newLines.length - 1] + lastLine,
            );
        }
    }

    return lines.join("\n");
}

// connection logic
io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // check if a room exists
    socket.on("check-room", ({ roomId }) => {
        const exists = !!rooms[roomId];
        const isPasswordProtected = exists && !!rooms[roomId].password;
        socket.emit("room-check-result", {
            exists,
            isPasswordProtected,
            roomId,
        });
    });

    // give the user the option to join or create a room
    socket.on("join-room", ({ roomId, userData, password, createRoom }) => {
        if (!roomId) {
            socket.emit("room-join-error", {
                error: "room-not-found",
                message: "Room name required.",
            });
            return;
        }
        // create a room if needed
        if (!rooms[roomId]) {
            if (createRoom) {
                rooms[roomId] = {
                    users: [],
                    content: "",
                    password: password || null,
                };
                console.log(`Created new room: ${roomId}`);
            } else {
                socket.emit("room-join-error", {
                    error: "room-not-found",
                    message: "Room does not exist.",
                });
                return;
            }
        }
        // Password check
        if (rooms[roomId].password && rooms[roomId].password !== password) {
            socket.emit("room-join-error", {
                error: "invalid-password",
                message: "Incorrect password.",
            });
            return;
        }
        // Add user to room
        currentRoom = roomId;
        currentUser = { ...userData, userId: socket.id };
        socket.join(roomId);
        // Remove user from any previous room
        Object.keys(rooms).forEach((rid) => {
            rooms[rid].users = rooms[rid].users.filter(
                (u) => u.userId !== socket.id,
            );
        });
        rooms[roomId].users.push(currentUser);

        console.log(
            `${currentUser.name} joined room: ${roomId} (${rooms[roomId].users.length} users)`,
        );

        // send current document and users
        socket.emit("room-joined", {
            roomId,
            content: rooms[roomId].content,
            users: rooms[roomId].users,
            isPasswordProtected: !!rooms[roomId].password,
        });
        // notify others
        io.to(roomId).emit("users-update", rooms[roomId].users);
    });

    // document now uses delta syncing instead of full document updates
    socket.on("document-change", ({ changes, timestamp }) => {
        if (
            currentRoom &&
            rooms[currentRoom] &&
            changes &&
            changes.length > 0
        ) {
            console.log(
                `Received ${changes.length} changes from ${currentUser?.name || socket.id} in room ${currentRoom}`,
            );

            try {
                // apply changes to server's copy of the content
                rooms[currentRoom].content = applyChangesToContent(
                    rooms[currentRoom].content,
                    changes,
                );

                // broadcast the changes to other users in the room
                socket.to(currentRoom).emit("document-update", {
                    changes,
                    userId: socket.id,
                    timestamp,
                });

                console.log(`Broadcasted changes to room ${currentRoom}`);
            } catch (error) {
                console.error(`Error applying changes:`, error);
                // if we get an error, we request a full sync. this might mess with the user experience
                // but we hope to get very few errors
                io.to(currentRoom).emit("full-sync-required", {
                    content: rooms[currentRoom].content,
                });
            }
        }
    });

    // cursor update
    socket.on("cursor-update", (data) => {
        if (currentRoom && rooms[currentRoom]) {
            socket.to(currentRoom).emit("cursor-update", {
                ...data,
                user: currentUser,
                userId: socket.id,
            });
        }
    });

    // handle full-sync request
    socket.on("request-full-sync", ({ roomId }) => {
        if (rooms[roomId]) {
            socket.emit("full-sync", {
                content: rooms[roomId].content,
            });
        }
    });

    // handle disconnect
    socket.on("disconnect", () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].users = rooms[currentRoom].users.filter(
                (u) => u.userId !== socket.id,
            );
            console.log(
                `${currentUser?.name || socket.id} left room: ${currentRoom} (${rooms[currentRoom].users.length} users remaining)`,
            );
            io.to(currentRoom).emit("users-update", rooms[currentRoom].users);

            if (
                rooms[currentRoom].users.length === 0 &&
                currentRoom !== "general"
            ) {
                console.log(`Deleting empty room: ${currentRoom}`);
                delete rooms[currentRoom];
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(
        `\nServing bundle.js from: ${path.join(__dirname, "dist", "bundle.js")}`,
    );
    console.log(`\nPress Ctrl+C to stop the server\n`);
});
