# Collaborative LaTeX Editor

A real-time collaborative LaTeX editor with room-based collaboration, password protection, and live preview.

## 🚀 Quick Start

### Windows
Double-click `../../start-server.bat` or run:
```cmd
cd frontend\editor
node dev-server.js
```

### Linux/Mac
```bash
chmod +x ../../start-server.sh
./../../start-server.sh
   ```

2. **Open in browser:**
   ```
   http://localhost:8080/
   ```

3. **Start collaborating:**
   - Enter your name when prompted
   - Choose a room (or use "general" for public access)
   - Start editing - changes sync in real-time!

## 🏠 Room System

### Room Types
- **General Room**: Public room with no password required
- **Custom Rooms**: Password-protected private rooms

### Room Operations
- **Join Existing Room**: Enter room name and password (if required)
- **Create New Room**: Set up a new room with optional password protection
- **Switch Rooms**: Use the "Switch Room" button in the user panel

### Room Security
- Rooms can be password-protected during creation
- Cannot bypass password by trying to "create" existing rooms
- General room is always password-free and accessible

## 🛠 Technical Architecture

### Server Components
- **HTTP Server**: Serves static files and handles routing
- **WebSocket Server**: Real-time communication via Socket.IO  
- **Room Management**: In-memory storage of rooms and user states
- **Password Security**: Secure room access control

### Client Components
- **React LaTeX Editor**: Monaco-based editor with LaTeX syntax
- **Collaborative Integration**: Real-time synchronization layer
- **User Interface**: Live user list and room management
- **Socket Client**: WebSocket connection handling

## 📁 File Structure

```
frontend/editor/
├── dev-server.js           # Main server with collaboration
├── index.html              # Main editor interface  
├── src/
│   ├── Collaborative.js    # Client-side collaboration
│   ├── App.js              # React app component
│   ├── LaTeXEditor.js      # Monaco editor integration
│   ├── PreviewPane.js      # LaTeX preview rendering
│   └── Toolbar.js          # Editor toolbar
├── package.json            # Dependencies
└── webpack.config.js       # Build configuration
```

## 🔧 Configuration

### Server Configuration
- **Port**: 8080 (configurable via PORT environment variable)
- **CORS**: Enabled for all origins
- **Room Cleanup**: Automatic cleanup of empty rooms

### Client Configuration  
- **Auto-reconnect**: Automatic reconnection on disconnect
- **User Colors**: Random color assignment for user identification
- **Cursor Sync**: Real-time cursor position sharing

## 🧪 Development

### Prerequisites
- Node.js 14+
- npm or yarn

### Setup
```bash
cd frontend/editor
npm install
npm run build  # Build the React components
node dev-server.js  # Start the server
```

### Build Commands
```bash
npm run build    # Production build
npm run dev      # Development build with watch
```

## 🚢 Deployment

### Production Setup
1. Build the client assets: `npm run build`
2. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
3. Start the server: `node dev-server.js`

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/editor/ .
RUN npm install && npm run build
EXPOSE 8080
CMD ["node", "dev-server.js"]
```

## 🔐 Security Features

- Password-protected rooms
- Input sanitization and validation
- CORS protection
- Room access control
- Automatic session cleanup

## 🎯 Usage Tips

- Use meaningful room names for better organization
- Set strong passwords for sensitive documents  
- The "general" room is always available for quick collaboration
- Users can switch rooms without refreshing the page
- Document changes are automatically saved in memory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multiple users
5. Submit a pull request

## 📝 License

This project is part of the Underbranch collaborative editing platform.

---

**Happy Collaborating! 🎉**