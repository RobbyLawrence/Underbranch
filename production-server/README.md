# Underbranch minimal production server

This folder contains a minimal Express + Socket.IO server to serve the built frontend and provide a simple collaborative editing socket room.

How it works
- Serves static files from `../frontend/editor/public/dist` (webpack output path)
- Provides a small Socket.IO interface:
  - `join` (room) — join a document room, server responds with current `doc` state
  - `update` ({room, content}) — broadcast content to other clients in the room

## Complete Setup Instructions

### Prerequisites
- Node.js installed (check with `node --version`)

### Step-by-Step Setup

**1. Build the frontend editor:**
```powershell
cd ../frontend/editor
npm install
npm run build
```

**2. Set up the authentication server:**
```powershell
cd ../signin
npm install
```

**3. Set up and start the production server:**
```powershell
cd ../production-server
npm install
npm start
```

**4. Start the auth server (in a separate terminal):**
```powershell
cd signin
npm start
```

### Quick Commands Summary
From the root directory (`Underbranch-main`):

```powershell
# Terminal 1 - Build frontend and start production server
cd frontend\editor && npm install && npm run build && cd ..\..\production-server && npm install && npm start

# Terminal 2 - Start authentication server
cd signin && npm install && npm start
```

### Access Points
- Main Application: http://localhost:3001
- Auth Server: Check the signin terminal for port information

Default production server port: 3001 (set `PORT` env var to change)

Notes
- This server stores documents in memory (process memory). For production you should add persistence (database or Redis) if you want durable collaboration sessions.
- In front of this server you can add Nginx for TLS termination and better static-file performance.
