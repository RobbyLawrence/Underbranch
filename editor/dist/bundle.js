/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/App.js":
/*!********************!*\
  !*** ./src/App.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Pull React hooks off the global React object. This file assumes React is
// available globally (e.g. via a <script> tag or bundler that provides it).
const {
  useState,
  useEffect
} = React;

// Main application component. This is a small, non-JSX React component that
// uses React.createElement to build the UI. It wires together three pieces:
// - Toolbar: lets the user switch view modes and perform actions
// - LaTeXEditor: an editor component for editing LaTeX source
// - PreviewPane: renders the LaTeX source as HTML or a preview
const App = () => {
  // latexCode holds the current LaTeX source the user is editing. We
  // initialize it with a small sample document so the preview shows
  // something on first load.
  const [latexCode, setLatexCode] = useState(`\\documentclass{article}
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

\\end{document}`);

  // viewMode controls which panes are visible. Possible values:
  // - 'editor'  -> only the editor is shown
  // - 'preview' -> only the preview is shown
  // - 'split'   -> both are shown side-by-side
  const [viewMode, setViewMode] = useState('split'); // 'editor', 'preview', 'split'

  // handleCodeChange is passed to the editor component. It receives the
  // new text value and updates the latexCode state. We guard against
  // undefined/null by falling back to an empty string.
  const handleCodeChange = value => {
    setLatexCode(value || '');
  };

  // Debug: log viewMode transitions so we can trace state changes while
  // reproducing the issue in the browser console.
  useEffect(() => {
    console.log('[App] viewMode changed ->', viewMode);
    // Also update the document title so the current mode is visible
    // in the browser tab (easy to spot without opening devtools).
    try {
      document.title = `LaTeX Editor — ${viewMode}`;
    } catch (e) {
      // ignore (server side or non-browser env)
    }
    // Trigger a resize event to nudge layout systems (Monaco, CSS)
    // to recompute sizes when the view mode changes.
    try {
      window.dispatchEvent(new Event('resize'));
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [viewMode]);

  // The UI layout is built with React.createElement calls instead of JSX.
  // To avoid layout glitches when switching modes we render both panes
  // consistently and toggle their visibility/size using explicit CSS
  // class names: 'split', 'full', or 'hidden'. This prevents frequent
  // unmount/remount of the editor which can cause Monaco/DOM layout issues.
  const editorClass = viewMode === 'split' ? 'split' : viewMode === 'editor' ? 'full' : 'hidden';
  const previewClass = viewMode === 'split' ? 'split' : viewMode === 'preview' ? 'full' : 'hidden';
  const editorVisible = viewMode === 'split' || viewMode === 'editor';
  const previewVisible = viewMode === 'split' || viewMode === 'preview';
  return React.createElement('div', {
    className: 'app'
  }, React.createElement(Toolbar, {
    viewMode: viewMode,
    onViewModeChange: setViewMode,
    latexCode: latexCode
  }), React.createElement('div', {
    className: `editor-container mode-${viewMode}`
  },
  // Editor pane is always present but may be hidden via the
  // 'hidden' class. This keeps Monaco mounted and stable.
  React.createElement('div', {
    className: `editor-pane ${editorClass}`
  }, React.createElement(LaTeXEditor, {
    value: latexCode,
    onChange: handleCodeChange,
    isVisible: editorVisible
  })),
  // Preview pane is always present as well; it will be hidden
  // when not in 'preview' or 'split' modes.
  React.createElement('div', {
    className: `preview-pane ${previewClass}`
  }, React.createElement(PreviewPane, {
    latexCode: latexCode
  }))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

/***/ }),

/***/ "./src/Collaborative.js":
/*!******************************!*\
  !*** ./src/Collaborative.js ***!
  \******************************/
/***/ (() => {

// Collaborative features integration for the LaTeX Editor
// This module handles real-time collaboration via Socket.IO

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
    return new Promise(resolve => {
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
    this.socket = io();
    this.socket.on("connect", () => {
      console.log("Connected to collaboration server");
    });
    this.socket.on("disconnect", () => {
      console.log("Disconnected from collaboration server");
    });
    this.socket.on("document-update", data => {
      console.log("Received document update from", data.userId);
      this.handleRemoteUpdate(data);
    });
    this.socket.on("users-update", users => {
      console.log("Users list updated:", users.length, "users");
      this.users = users;
      this.updateUsersList();
    });
    this.socket.on("cursor-update", data => {
      this.handleCursorUpdate(data);
    });
    this.socket.on("room-joined", data => {
      console.log("Successfully joined room:", data.roomId);
      this.currentRoom = data.roomId;
      this.updateDocumentContent(data.content);
      this.users = data.users;
      this.updateUsersList();

      // Show success message
      this.showMessage(`Joined room: ${data.roomId}${data.isPasswordProtected ? " (password protected)" : ""}`, "success");
    });
    this.socket.on("room-join-error", data => {
      console.error("❌ Failed to join room:", data.message);
      if (data.error === "invalid-password") {
        alert(`❌ ${data.message}\n\nPlease try again.`);
        setTimeout(() => this.promptForRoom(), 100);
      } else if (data.error === "room-not-found") {
        const createRoom = confirm(`❌ Room does not exist.\n\nWould you like to create it?`);
        if (createRoom) {
          const password = prompt(`Set a password for the new room (or leave empty for no password):`);
          this.joinRoom(this.currentRoom, password, true);
        } else {
          setTimeout(() => this.promptForRoom(), 100);
        }
      } else if (data.error === "room-already-exists") {
        alert(`❌ ${data.message}`);
        setTimeout(() => this.promptForRoom(), 100);
      }
    });
    this.socket.on("room-check-result", data => {
      if (data.exists) {
        if (data.isPasswordProtected) {
          // Room exists and is password protected
          const password = prompt(`Room "${data.roomId}" exists and is password protected.\nEnter password:`);
          this.joinRoom(data.roomId, password, false);
        } else {
          // Room exists and is public
          this.joinRoom(data.roomId, null, false);
        }
      } else {
        // Room doesn't exist - ask if they want to create it
        const createRoom = confirm(`Room "${data.roomId}" doesn't exist.\nWould you like to create it?`);
        if (createRoom) {
          const password = prompt(`Set a password for the new room "${data.roomId}" (or leave empty for no password):`);
          this.joinRoom(data.roomId, password, true);
        } else {
          setTimeout(() => this.promptForRoom(), 100);
        }
      }
    });
  }
  async getUserInfo() {
    // Check if user info is stored in localStorage
    let userName = localStorage.getItem("collaborativeUserName");
    let userColor = localStorage.getItem("collaborativeUserColor");
    if (!userName) {
      userName = prompt("Enter your name for collaborative editing:") || `User ${Date.now()}`;
      localStorage.setItem("collaborativeUserName", userName);
    }
    if (!userColor) {
      userColor = this.getRandomColor();
      localStorage.setItem("collaborativeUserColor", userColor);
    }
    this.currentUser = {
      name: userName,
      color: userColor
    };

    // Prompt for room
    await this.promptForRoom();
  }
  async promptForRoom() {
    const roomId = prompt('Enter room name to join (or leave empty for "general"):') || "general";
    if (roomId === "general") {
      // General room is always accessible without password
      this.joinRoom(roomId, null, true); // Always "create" general room to ensure it exists
      return;
    }

    // Check if room exists first
    this.checkRoomExists(roomId);
  }
  checkRoomExists(roomId) {
    console.log(`Checking if room "${roomId}" exists...`);
    this.socket.emit("check-room", {
      roomId
    });
  }
  joinRoom(roomId, password, createRoom) {
    this.currentRoom = roomId;
    this.socket.emit("join-room", {
      roomId: roomId,
      userData: this.currentUser,
      password: password,
      createRoom: createRoom
    });
  }
  waitForEditor() {
    return new Promise(resolve => {
      const checkEditor = () => {
        console.log("Looking for Monaco editor...");

        // Look for Monaco editor in multiple ways
        const editorElement = document.getElementById("monaco-editor");
        console.log("Editor element found:", !!editorElement);
        if (window.monaco) {
          console.log("Monaco global available");

          // Try to get editor from the element
          if (editorElement && editorElement._monacoEditor) {
            console.log("Found editor on element._monacoEditor");
            this.editor = editorElement._monacoEditor;
            resolve();
            return;
          }

          // Try to get all editors from Monaco
          const editors = window.monaco.editor.getEditors();
          if (editors.length > 0) {
            console.log("Found editor via monaco.editor.getEditors():", editors.length);
            this.editor = editors[0];
            resolve();
            return;
          }
        } else {
          console.log(" Monaco global not available yet");
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

    // Listen for local changes
    this.editor.onDidChangeModelContent(e => {
      if (!this.isUpdatingFromRemote) {
        const content = this.editor.getValue();
        console.log("Local change detected, broadcasting...", content.length, "characters");
        this.socket.emit("document-change", {
          content: content,
          changes: e.changes
        });
      } else {
        console.log("Skipping broadcast - change from remote");
      }
    });

    // Listen for cursor position changes
    this.editor.onDidChangeCursorPosition(e => {
      this.socket.emit("cursor-update", {
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
    console.log("Editor event listeners setup complete");
  }
  updateDocumentContent(content) {
    if (this.editor && this.editor.getValue() !== content) {
      console.log("Updating editor content from remote...", content.length, "characters");
      this.isUpdatingFromRemote = true;
      const position = this.editor.getPosition();
      this.editor.setValue(content);
      if (position) {
        this.editor.setPosition(position);
      }
      this.isUpdatingFromRemote = false;
      console.log("Editor content updated successfully");
    } else {
      console.log("Content already up to date, skipping update");
    }
  }
  handleRemoteUpdate(data) {
    console.log("Received remote update from", data.userId);
    this.updateDocumentContent(data.content);
  }
  handleCursorUpdate(data) {
    if (!this.editor) return;

    // Remove old decorations for this user
    const oldDecorations = this.decorations.filter(d => d.userId === data.userId);
    if (oldDecorations.length > 0) {
      this.editor.deltaDecorations(oldDecorations.map(d => d.id), []);
    }

    // Add new cursor decoration
    const decoration = {
      range: new monaco.Range(data.cursor.lineNumber, data.cursor.column, data.cursor.lineNumber, data.cursor.column + 1),
      options: {
        className: "collaborative-cursor",
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        hoverMessage: {
          value: `${data.user.name}'s cursor`
        },
        after: {
          content: `${data.user.name}`,
          inlineClassName: "collaborative-cursor-label",
          color: data.user.color
        }
      }
    };
    const decorationIds = this.editor.deltaDecorations([], [decoration]);

    // Store decoration info
    this.decorations = this.decorations.filter(d => d.userId !== data.userId);
    this.decorations.push({
      userId: data.userId,
      id: decorationIds[0]
    });
  }
  updateUsersList() {
    // Create or update users list UI
    this.createUsersListUI();
  }
  createUsersListUI() {
    // Remove existing users list
    const existingList = document.getElementById("collaborative-users");
    if (existingList) {
      existingList.remove();
    }

    // Create new users list
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

    // Room info
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

    // Users title
    const title = document.createElement("div");
    title.textContent = `Online Users (${this.users.length})`;
    title.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            font-size: 14px;
        `;
    usersList.appendChild(title);

    // Users list
    this.users.forEach(user => {
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
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  showMessage(message, type = "info") {
    // Create message element
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

    // Remove after 4 seconds
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
        border-left: 2px solid !important;
        background-color: rgba(255, 107, 107, 0.2) !important;
    }

    .collaborative-cursor-label {
        background-color: #FF6B6B;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        position: relative;
        top: -20px;
        white-space: nowrap;
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

// Make Collaborative available globally
window.Collaborative = Collaborative;

/***/ }),

/***/ "./src/LaTeXEditor.js":
/*!****************************!*\
  !*** ./src/LaTeXEditor.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const {
  useEffect,
  useRef
} = React;
const LaTeXEditor = ({
  value,
  onChange,
  isVisible = true
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const layoutTimeout = useRef(null);
  useEffect(() => {
    // Initialize Monaco Editor
    if (window.require && !monacoRef.current) {
      window.require.config({
        paths: {
          vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs"
        }
      });
      window.require(["vs/editor/editor.main"], () => {
        if (editorRef.current && !monacoRef.current) {
          // Configure LaTeX language
          monaco.languages.register({
            id: "latex"
          });

          // Define custom theme
          monaco.editor.defineTheme("underbranch-theme", {
            base: "vs",
            inherit: true,
            rules: [{
              token: "keyword",
              foreground: "B5632D"
            }, {
              token: "string",
              foreground: "218721"
            }, {
              token: "comment",
              foreground: "737373",
              fontStyle: "italic"
            }, {
              token: "bracket",
              foreground: "505050"
            }],
            colors: {
              "editor.background": "#FFFFFF",
              "editor.foreground": "#333333",
              "editor.lineHighlightBackground": "#F5F5F5",
              "editorCursor.foreground": "#B5632D",
              "editor.selectionBackground": "#E8D3C7",
              "editorLineNumber.foreground": "#999999"
            }
          });

          // Syntax highlighting
          monaco.languages.setMonarchTokensProvider("latex", {
            tokenizer: {
              root: [[/\\[a-zA-Z@]+/, "keyword"], [/\\begin\{[^}]+\}/, "keyword"], [/\\end\{[^}]+\}/, "keyword"], [/\$.*?\$/, "string"], [/\\\(.*?\\\)/, "string"], [/\\\[.*?\\\]/, "string"], [/%.*$/, "comment"], [/\{/, "bracket"], [/\}/, "bracket"]]
            }
          });

          // LaTeX command definitions
          const latexCommands = [{
            command: "begin",
            insertText: "begin{$0}",
            documentation: "Begin environment"
          }, {
            command: "end",
            insertText: "end{$0}",
            documentation: "End environment"
          }, {
            command: "textbf",
            insertText: "textbf{$0}",
            documentation: "Bold text"
          }, {
            command: "textit",
            insertText: "textit{$0}",
            documentation: "Italic text"
          }, {
            command: "underline",
            insertText: "underline{$0}",
            documentation: "Underline text"
          }, {
            command: "section",
            insertText: "section{$0}",
            documentation: "Section"
          }, {
            command: "subsection",
            insertText: "subsection{$0}",
            documentation: "Subsection"
          }, {
            command: "subsubsection",
            insertText: "subsubsection{$0}",
            documentation: "Subsubsection"
          }, {
            command: "chapter",
            insertText: "chapter{$0}",
            documentation: "Chapter"
          }, {
            command: "title",
            insertText: "title{$0}",
            documentation: "Document title"
          }, {
            command: "author",
            insertText: "author{$0}",
            documentation: "Document author"
          }, {
            command: "date",
            insertText: "date{$0}",
            documentation: "Document date"
          }, {
            command: "emph",
            insertText: "emph{$0}",
            documentation: "Emphasize text"
          }, {
            command: "frac",
            insertText: "frac{$1}{$2}",
            documentation: "Fraction"
          }, {
            command: "sqrt",
            insertText: "sqrt{$0}",
            documentation: "Square root"
          }];
          const latexEnvironments = ["document", "equation", "align", "itemize", "enumerate", "figure", "table", "center", "abstract"];

          // Register completion provider for LaTeX commands
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["\\", "{"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(0, position.column - 1);

              // Command completions (after \)
              const commandMatch = textBeforeCursor.match(/\\([a-zA-Z]*)$/);
              if (commandMatch) {
                const partialCommand = commandMatch[1];
                const textAfterCursor = lineContent.substring(position.column - 1);
                const suggestions = latexCommands.filter(cmd => cmd.command.startsWith(partialCommand)).map(cmd => {
                  // Check if cursor is inside braces and there's a closing brace
                  const hasOpenBrace = textBeforeCursor.match(/\{[^}]*$/);
                  const hasClosingBrace = hasOpenBrace && textAfterCursor.startsWith('}');

                  // If we're inside braces with a closing brace, don't include it in insertText
                  let insertText = cmd.insertText;
                  let endColumn = position.column;
                  if (hasClosingBrace && insertText.includes('{')) {
                    // Remove the closing brace from commands like "textbf{$0}"
                    insertText = insertText.replace(/\{([^}]*)\}/, '{$1');
                    endColumn = position.column + 1; // Include the closing brace in replacement
                  }
                  return {
                    label: cmd.command,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: cmd.documentation,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column - partialCommand.length,
                      endLineNumber: position.lineNumber,
                      endColumn: endColumn
                    }
                  };
                });
                return {
                  suggestions
                };
              }

              // Environment completions (after \begin{)
              const beginMatch = textBeforeCursor.match(/\\begin\{([^}]*)$/);
              if (beginMatch) {
                const partialEnv = beginMatch[1];
                const textAfterCursor = lineContent.substring(position.column - 1);

                // Check if there's already a closing brace after the cursor
                const hasClosingBrace = textAfterCursor.startsWith('}');
                const suggestions = latexEnvironments.filter(env => env.startsWith(partialEnv)).map(env => {
                  // If there's already a closing brace, we need to handle it carefully
                  let insertText, endColumn;
                  if (hasClosingBrace) {
                    // Include the environment content but skip past the existing closing brace
                    insertText = `${env}}\n\t$0\n\\end{${env}}`;
                    endColumn = position.column + 1; // Replace up to and including the }
                  } else {
                    // No closing brace, add everything including the brace
                    insertText = `${env}}\n\t$0\n\\end{${env}}`;
                    endColumn = position.column;
                  }
                  return {
                    label: env,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Insert ${env} environment`,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column - partialEnv.length,
                      endLineNumber: position.lineNumber,
                      endColumn: endColumn
                    }
                  };
                });
                return {
                  suggestions
                };
              }
              return {
                suggestions: []
              };
            }
          });

          // Auto-close \begin{} with \end{}
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["}"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(0, position.column - 1);
              const textAfterCursor = lineContent.substring(position.column - 1);
              const beginMatch = textBeforeCursor.match(/\\begin\{([^}]+)\}$/);

              // Only suggest auto-close if there's not already an \end{} on the same line
              // or if we haven't already inserted the environment completion
              if (beginMatch && !textAfterCursor.match(/^\s*\n\s*\\end\{/)) {
                const environmentName = beginMatch[1];

                // Check if this is one of our predefined environments
                // If so, don't auto-close as it was already handled by the environment completion
                if (latexEnvironments.includes(environmentName)) {
                  return {
                    suggestions: []
                  };
                }
                return {
                  suggestions: [{
                    label: `Auto-close \\end{${environmentName}}`,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `\n\t$0\n\\end{${environmentName}}`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Auto-close with \\end{${environmentName}}`,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column
                    }
                  }]
                };
              }
              return {
                suggestions: []
              };
            }
          });

          // Create the editor
          monacoRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: "latex",
            theme: "underbranch-theme",
            fontSize: 15,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: {
              enabled: false
            },
            wordWrap: "on",
            lineHeight: 24,
            padding: {
              top: 16,
              bottom: 16
            },
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorWidth: 2,
            fontFamily: "'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace",
            fontLigatures: true,
            smoothScrolling: true,
            guides: {
              indentation: true,
              bracketPairs: true
            }
          });

          // Listen for content changes
          monacoRef.current.onDidChangeModelContent(() => {
            const currentValue = monacoRef.current.getValue();
            if (onChange) {
              onChange(currentValue);
            }
          });
        }
      });
    }

    // Listen for clear editor event
    const handleClearEditor = () => {
      if (monacoRef.current) {
        monacoRef.current.setValue("");
      }
    };
    window.addEventListener("clearEditor", handleClearEditor);
    return () => {
      window.removeEventListener("clearEditor", handleClearEditor);
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  // Recalculate layout when editor becomes visible
  useEffect(() => {
    if (!monacoRef.current) return;
    if (isVisible) {
      if (layoutTimeout.current) clearTimeout(layoutTimeout.current);
      layoutTimeout.current = setTimeout(() => {
        try {
          monacoRef.current.layout();
        } catch (e) {
          console.warn("monaco.layout failed", e);
        }
      }, 50);
    }
    return () => {
      if (layoutTimeout.current) {
        clearTimeout(layoutTimeout.current);
        layoutTimeout.current = null;
      }
    };
  }, [isVisible]);
  return React.createElement("div", {
    ref: editorRef,
    id: "monaco-editor"
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LaTeXEditor);

/***/ }),

/***/ "./src/PreviewPane.js":
/*!****************************!*\
  !*** ./src/PreviewPane.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const PreviewPane = ({
  latexCode
}) => {
  const {
    useState,
    useEffect
  } = React;
  const [processedContent, setProcessedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simple LaTeX to HTML converter for basic preview
  const processLaTeX = latex => {
    setIsLoading(true);

    // Basic LaTeX processing - this is a simplified version
    let html = latex;

    // Document structure
    html = html.replace(/\\documentclass\{[^}]+\}/, '');
    html = html.replace(/\\usepackage(?:\[[^\]]*\])?\{[^}]+\}/g, '');
    html = html.replace(/\\title\{([^}]+)\}/, '<h1 class="title">$1</h1>');
    html = html.replace(/\\author\{([^}]+)\}/, '<p class="author">By: $1</p>');
    html = html.replace(/\\date\{([^}]+)\}/, '<p class="date">$1</p>');
    html = html.replace(/\\maketitle/, '<div class="titlepage"></div>');

    // Sections
    html = html.replace(/\\section\{([^}]+)\}/g, '<h2>$1</h2>');
    html = html.replace(/\\subsection\{([^}]+)\}/g, '<h3>$1</h3>');
    html = html.replace(/\\subsubsection\{([^}]+)\}/g, '<h4>$1</h4>');

    // Math environments
    html = html.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, '<div class="equation">$$1$</div>');
    html = html.replace(/\$([^$]+)\$/g, '<span class="math">$1</span>');

    // Lists
    html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
      const items = content.replace(/\\item\s+/g, '<li>').split('<li>').filter(item => item.trim());
      return '<ul>' + items.map(item => '<li>' + item.trim() + '</li>').join('') + '</ul>';
    });
    html = html.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
      const items = content.replace(/\\item\s+/g, '<li>').split('<li>').filter(item => item.trim());
      return '<ol>' + items.map(item => '<li>' + item.trim() + '</li>').join('') + '</ol>';
    });

    // Text formatting
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');

    // Clean up LaTeX commands and environments
    html = html.replace(/\\begin\{document\}/, '');
    html = html.replace(/\\end\{document\}/, '');
    html = html.replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?\{[^}]*\}/g, '');
    html = html.replace(/\\[a-zA-Z]+/g, '');

    // Convert line breaks
    html = html.replace(/\n\s*\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p>\s*<\/p>/g, '');
    setProcessedContent(html);
    setIsLoading(false);
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processLaTeX(latexCode);
    }, 500); // Debounce processing

    return () => clearTimeout(timeoutId);
  }, [latexCode]);
  if (isLoading) {
    return React.createElement('div', {
      className: 'loading'
    }, 'Processing LaTeX...');
  }
  return React.createElement('div', {
    className: 'preview-content'
  }, React.createElement('div', {
    dangerouslySetInnerHTML: {
      __html: processedContent
    }
  }), React.createElement('style', null, `
            .preview-content h1.title {
                text-align: center;
                margin-bottom: 10px;
                font-size: 24px;
            }
            .preview-content .author, .preview-content .date {
                text-align: center;
                margin: 5px 0;
                color: #666;
            }
            .preview-content h2 {
                margin: 20px 0 10px 0;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            .preview-content h3 {
                margin: 15px 0 8px 0;
                color: #444;
            }
            .preview-content h4 {
                margin: 12px 0 6px 0;
                color: #555;
            }
            .preview-content p {
                margin: 10px 0;
                line-height: 1.6;
            }
            .preview-content .equation {
                text-align: center;
                margin: 20px 0;
                padding: 10px;
                background: #f8f9fa;
                border-left: 4px solid #007bff;
                font-family: 'Times New Roman', serif;
                font-style: italic;
            }
            .preview-content .math {
                font-family: 'Times New Roman', serif;
                font-style: italic;
                background: #f0f0f0;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .preview-content ul, .preview-content ol {
                margin: 10px 0 10px 20px;
            }
            .preview-content li {
                margin: 5px 0;
            }
        `));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PreviewPane);

/***/ }),

/***/ "./src/Toolbar.js":
/*!************************!*\
  !*** ./src/Toolbar.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const Toolbar = ({
  viewMode,
  onViewModeChange,
  latexCode
}) => {
  const handleDownload = () => {
    const blob = new Blob([latexCode], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      onViewModeChange('editor');
      // This will be handled by the parent component
      const event = new CustomEvent('clearEditor');
      window.dispatchEvent(event);
    }
  };

  // Debug helpers - log button clicks
  const handleViewClick = mode => {
    console.log('[Toolbar] button click ->', mode);
    onViewModeChange(mode);
  };
  return React.createElement('div', {
    className: 'toolbar'
  }, React.createElement('h1', null, 'LaTeX Editor'), React.createElement('div', {
    className: 'toolbar-buttons'
  }, React.createElement('button', {
    className: `btn ${viewMode === 'editor' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => handleViewClick('editor')
  }, 'Editor'), React.createElement('button', {
    className: `btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => handleViewClick('split')
  }, 'Split'), React.createElement('button', {
    className: `btn ${viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => handleViewClick('preview')
  }, 'Preview'), React.createElement('button', {
    className: 'btn btn-secondary',
    onClick: handleDownload
  }, 'Download'), React.createElement('button', {
    className: 'btn btn-secondary',
    onClick: handleClear
  }, 'Clear')));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Toolbar);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Toolbar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Toolbar.js */ "./src/Toolbar.js");
/* harmony import */ var _LaTeXEditor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LaTeXEditor.js */ "./src/LaTeXEditor.js");
/* harmony import */ var _PreviewPane_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PreviewPane.js */ "./src/PreviewPane.js");
/* harmony import */ var _App_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./App.js */ "./src/App.js");
/* harmony import */ var _Collaborative_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Collaborative.js */ "./src/Collaborative.js");
/* harmony import */ var _Collaborative_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_Collaborative_js__WEBPACK_IMPORTED_MODULE_4__);




// Import Collaborative features


// Make components available globally for backward compatibility
window.Toolbar = _Toolbar_js__WEBPACK_IMPORTED_MODULE_0__["default"];
window.LaTeXEditor = _LaTeXEditor_js__WEBPACK_IMPORTED_MODULE_1__["default"];
window.PreviewPane = _PreviewPane_js__WEBPACK_IMPORTED_MODULE_2__["default"];
window.App = _App_js__WEBPACK_IMPORTED_MODULE_3__["default"];

// Function to initialize the app
const initializeApp = () => {
  try {
    // Wait for React to be available
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(_App_js__WEBPACK_IMPORTED_MODULE_3__["default"]));
    } else {
      console.error('React or ReactDOM not loaded');
    }
  } catch (error) {
    console.error('Error loading app:', error);
    document.getElementById('root').innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                <h2>Error Loading Editor</h2>
                <p>There was an error loading the LaTeX editor. Please check the console for details.</p>
            </div>
        `;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map