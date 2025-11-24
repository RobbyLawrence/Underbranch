// Collaborative features integration for the LaTeX Editor
// This module handles real-time collaboration via Socket

class Collaborative {
    constructor() {
        this.socket = null;
        this.editor = null;
        this.app = null;
        this.users = [];
        this.currentUser = null;
        this.currentRoom = null;
        this.isUpdatingFromRemote = false;
        this.decorations = [];
        this.pendingChanges = [];
        this.localVersion = 0;
        this.remoteVersion = 0;

        this.init();
    }

    async init() {
        console.log("Starting collaborative initialization...");

        // Wait for Socket.IO to be available
        console.log("Waiting for Socket.IO...");
        await this.waitForSocketIO();
        console.log("Socket.IO ready");

        // Initialize socket connection
        console.log("Initializing socket connection...");
        this.initSocket();

        // Get user info and join
        console.log("Getting user info...");
        await this.getUserInfo();

        // Wait for the React app and Monaco editor
        console.log("Waiting for Monaco editor...");
        await this.waitForEditor();
        console.log("Monaco editor found!");

        // Setup collaborative features
        console.log("Setting up collaboration...");
        this.setupCollaboration();

        console.log("Collaborative features initialized!");
    }

    waitForSocketIO() {
        return new Promise((resolve) => {
            const checkSocketIO = () => {
                if (window.io) {
                    resolve();
                } else {
                    setTimeout(checkSocketIO, 100);
                }
            };
            checkSocketIO();
        });
    }

    initSocket() {
        this.socket = io("https://underbranch.org");

        this.socket.on("connect", () => {
            console.log("Connected to collaboration server");
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from collaboration server");
        });

        // CHANGED: Now handles delta updates
        this.socket.on("document-update", (data) => {
            console.log("Received document update from", data.userId);
            this.handleRemoteUpdate(data);
        });

        this.socket.on("users-update", (users) => {
            console.log("Users list updated:", users.length, "users");
            this.users = users;
            this.updateUsersList();
        });

        this.socket.on("cursor-update", (data) => {
            this.handleCursorUpdate(data);
        });

        this.socket.on("room-joined", (data) => {
            console.log("Successfully joined room:", data.roomId);
            this.currentRoom = data.roomId;

            // Only do full content update when first joining
            this.isUpdatingFromRemote = true;
            if (this.editor) {
                this.editor.setValue(data.content);
            }
            this.isUpdatingFromRemote = false;

            this.users = data.users;
            this.updateUsersList();

            // Show success message
            this.showMessage(
                `Joined room: ${data.roomId}${data.isPasswordProtected ? " (password protected)" : ""}`,
                "success",
            );
        });

        this.socket.on("room-join-error", (data) => {
            console.error("❌ Failed to join room:", data.message);

            if (data.error === "invalid-password") {
                alert(`❌ ${data.message}\n\nPlease try again.`);
                setTimeout(() => this.promptForRoom(), 100);
            } else if (data.error === "room-not-found") {
                const createRoom = confirm(
                    `❌ Room does not exist.\n\nWould you like to create it?`,
                );
                if (createRoom) {
                    const password = prompt(
                        `Set a password for the new room (or leave empty for no password):`,
                    );
                    this.joinRoom(this.currentRoom, password, true);
                } else {
                    setTimeout(() => this.promptForRoom(), 100);
                }
            } else if (data.error === "room-already-exists") {
                alert(`❌ ${data.message}`);
                setTimeout(() => this.promptForRoom(), 100);
            }
        });

        this.socket.on("room-check-result", (data) => {
            if (data.exists) {
                if (data.isPasswordProtected) {
                    const password = prompt(
                        `Room "${data.roomId}" exists and is password protected.\nEnter password:`,
                    );
                    this.joinRoom(data.roomId, password, false);
                } else {
                    this.joinRoom(data.roomId, null, false);
                }
            } else {
                const createRoom = confirm(
                    `Room "${data.roomId}" doesn't exist.\nWould you like to create it?`,
                );
                if (createRoom) {
                    const password = prompt(
                        `Set a password for the new room "${data.roomId}" (or leave empty for no password):`,
                    );
                    this.joinRoom(data.roomId, password, true);
                } else {
                    setTimeout(() => this.promptForRoom(), 100);
                }
            }
        });
    }

    async getUserInfo() {
        let userName = localStorage.getItem("collaborativeUserName");
        let userColor = localStorage.getItem("collaborativeUserColor");

        if (!userName) {
            userName =
                prompt("Enter your name for collaborative editing:") ||
                `User ${Date.now()}`;
            localStorage.setItem("collaborativeUserName", userName);
        }

        if (!userColor) {
            userColor = this.getRandomColor();
            localStorage.setItem("collaborativeUserColor", userColor);
        }

        this.currentUser = {
            name: userName,
            color: userColor,
        };

        await this.promptForRoom();
    }

    async promptForRoom() {
        const roomId =
            prompt('Enter room name to join (or leave empty for "general"):') ||
            "general";

        if (roomId === "general") {
            this.joinRoom(roomId, null, true);
            return;
        }

        this.checkRoomExists(roomId);
    }

    checkRoomExists(roomId) {
        console.log(`Checking if room "${roomId}" exists...`);
        this.socket.emit("check-room", { roomId });
    }

    joinRoom(roomId, password, createRoom) {
        this.currentRoom = roomId;

        this.socket.emit("join-room", {
            roomId: roomId,
            userData: this.currentUser,
            password: password,
            createRoom: createRoom,
        });
    }

    waitForEditor() {
        return new Promise((resolve) => {
            const checkEditor = () => {
                console.log("Looking for Monaco editor...");

                const editorElement = document.getElementById("monaco-editor");
                console.log("Editor element found:", !!editorElement);

                if (window.monaco) {
                    console.log("Monaco global available");

                    if (editorElement && editorElement._monacoEditor) {
                        console.log("Found editor on element._monacoEditor");
                        this.editor = editorElement._monacoEditor;
                        resolve();
                        return;
                    }

                    const editors = window.monaco.editor.getEditors();
                    if (editors.length > 0) {
                        console.log(
                            "Found editor via monaco.editor.getEditors():",
                            editors.length,
                        );
                        this.editor = editors[0];
                        resolve();
                        return;
                    }
                } else {
                    console.log("Monaco global not available yet");
                }

                console.log("Editor not ready yet, retrying...");
                setTimeout(checkEditor, 500);
            };
            checkEditor();
        });
    }

    setupCollaboration() {
        if (!this.editor) {
            console.error("Monaco editor not found");
            return;
        }

        // broadcasts changes instead of full content now
        this.editor.onDidChangeModelContent((e) => {
            if (!this.isUpdatingFromRemote && e.changes.length > 0) {
                console.log("Local change detected, broadcasting deltas...");

                // Convert Monaco changes to a serializable format
                const changes = e.changes.map((change) => ({
                    range: {
                        startLineNumber: change.range.startLineNumber,
                        startColumn: change.range.startColumn,
                        endLineNumber: change.range.endLineNumber,
                        endColumn: change.range.endColumn,
                    },
                    rangeLength: change.rangeLength,
                    text: change.text,
                }));

                this.socket.emit("document-change", {
                    changes: changes,
                    timestamp: Date.now(),
                });
            } else if (this.isUpdatingFromRemote) {
                console.log("Skipping broadcast - change from remote");
            }
        });

        // listen for cursor position changes
        this.editor.onDidChangeCursorPosition((e) => {
            this.socket.emit("cursor-update", {
                lineNumber: e.position.lineNumber,
                column: e.position.column,
            });
        });

        console.log("Editor event listeners setup complete");
    }

    // apply the delta changes instead of replacing the entire document
    handleRemoteUpdate(data) {
        if (!this.editor || !data.changes || data.changes.length === 0) {
            return;
        }

        console.log("Applying remote changes:", data.changes.length, "edits");

        this.isUpdatingFromRemote = true;

        try {
            const model = this.editor.getModel();

            // save cursor position
            const currentPosition = this.editor.getPosition();
            const currentSelection = this.editor.getSelection();

            // apply changes as edit operations
            const edits = data.changes.map((change) => ({
                range: new monaco.Range(
                    change.range.startLineNumber,
                    change.range.startColumn,
                    change.range.endLineNumber,
                    change.range.endColumn,
                ),
                text: change.text,
                forceMoveMarkers: true,
            }));

            // apply all edits in a single operation
            model.pushEditOperations(
                [currentSelection],
                edits,
                // if the user has something selected, try to keep it selected
                () => [currentSelection],
            );

            console.log("Remote changes applied successfully");
        } catch (error) {
            console.error("Error applying remote changes:", error);
            // if we can't do delta changes, request full sync
            this.socket.emit("request-full-sync", { roomId: this.currentRoom });
        } finally {
            this.isUpdatingFromRemote = false;
        }
    }

    handleCursorUpdate(data) {
        if (!this.editor || !data.lineNumber || !data.column) return;

        // Remove old decorations for this user
        const oldDecorations = this.decorations.filter(
            (d) => d.userId === data.userId,
        );
        if (oldDecorations.length > 0) {
            this.editor.deltaDecorations(
                oldDecorations.map((d) => d.id),
                [],
            );
        }

        // Add new cursor decoration
        const decoration = {
            range: new monaco.Range(
                data.lineNumber,
                data.column,
                data.lineNumber,
                data.column,
            ),
            options: {
                className: "collaborative-cursor",
                stickiness:
                    monaco.editor.TrackedRangeStickiness
                        .NeverGrowsWhenTypingAtEdges,
                beforeContentClassName: "collaborative-cursor-marker",
                glyphMarginClassName: "collaborative-cursor-glyph",
                afterContentClassName: "collaborative-cursor-label",
                after: {
                    content: ` ${data.user.name} `,
                    inlineClassName: "collaborative-cursor-label",
                    inlineClassNameAffectsLetterSpacing: true,
                },
            },
        };

        const decorationIds = this.editor.deltaDecorations([], [decoration]);

        // Store decoration info
        this.decorations = this.decorations.filter(
            (d) => d.userId !== data.userId,
        );
        this.decorations.push({
            userId: data.userId,
            id: decorationIds[0],
            color: data.user.color,
        });
    }

    updateUsersList() {
        this.createUsersListUI();
    }

    createUsersListUI() {
        const existingList = document.getElementById("collaborative-users");
        if (existingList) {
            existingList.remove();
        }

        const usersList = document.createElement("div");
        usersList.id = "collaborative-users";
        usersList.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 220px;
        `;

        const roomInfo = document.createElement("div");
        roomInfo.style.cssText = `
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 12px;
            border-left: 3px solid #4834D4;
        `;

        const roomTitle = document.createElement("div");
        roomTitle.textContent = `Room: ${this.currentRoom || "Not connected"}`;
        roomTitle.style.cssText = `
            font-weight: bold;
            color: #333;
            font-size: 13px;
            margin-bottom: 4px;
        `;

        const switchButton = document.createElement("button");
        switchButton.textContent = "Switch Room";
        switchButton.style.cssText = `
            background: #4834D4;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            cursor: pointer;
        `;
        switchButton.onclick = () => this.promptForRoom();

        roomInfo.appendChild(roomTitle);
        roomInfo.appendChild(switchButton);
        usersList.appendChild(roomInfo);

        const title = document.createElement("div");
        title.textContent = `Online Users (${this.users.length})`;
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            font-size: 14px;
        `;
        usersList.appendChild(title);

        this.users.forEach((user) => {
            const userElement = document.createElement("div");
            userElement.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                font-size: 13px;
            `;

            const colorDot = document.createElement("div");
            colorDot.style.cssText = `
                width: 12px;
                height: 12px;
                background-color: ${user.color};
                border-radius: 50%;
                margin-right: 8px;
            `;

            const nameElement = document.createElement("span");
            nameElement.textContent = user.name;
            nameElement.style.color = "#555";

            userElement.appendChild(colorDot);
            userElement.appendChild(nameElement);
            usersList.appendChild(userElement);
        });

        document.body.appendChild(usersList);
    }

    getRandomColor() {
        const colors = [
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#96CEB4",
            "#FECA57",
            "#FF9FF3",
            "#54A0FF",
            "#5F27CD",
            "#00D2D3",
            "#FF9F43",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showMessage(message, type = "info") {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background-color: ${type === "success" ? "#10AC84" : type === "error" ? "#EE5A24" : "#4834D4"};
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 4000);
    }
}

// CSS for collaborative cursors
const style = document.createElement("style");
style.textContent = `
    .collaborative-cursor {
        border-left: 2px solid rgba(255, 107, 107, 0.8) !important;
    }

    .collaborative-cursor-marker::before {
        content: "";
        position: absolute;
        width: 2px;
        height: 1.2em;
        background-color: rgba(255, 107, 107, 0.8);
    }

    .collaborative-cursor-label {
        background-color: rgba(255, 107, 107, 0.9);
        color: white;
        padding: 1px 4px;
        border-radius: 2px;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
        margin-left: 2px;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        window.collaborative = new Collaborative();
    });
} else {
    window.collaborative = new Collaborative();
}

window.Collaborative = Collaborative;
