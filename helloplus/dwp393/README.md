# Underbranch Project Structure

## Overview
Underbranch is a web-based collaborative LaTeX editor and compiler currently in development for CS340. The project is organized with a main project structure and subdirectories for different components and user workspaces.

## Git Branches

### Active Branches
- **main** - Primary branch with stable code
- **ferrari** - Current working branch (active)
- **aaron** - Developer branch for Aaron's work
- **update-README** - Branch for documentation updates

### Current Status
- Working on `ferrari` branch
- Recent commits include MySQL integration, server configuration, and sprint 1 preparation

## Directory Structure

```
Underbranch/
├── index.html              # Main landing page with "It works!" message
├── README.md               # Project overview and setup instructions
├── nginx-reload.sh         # Server reload script
├── underbranch.png         # Project logo/banner image
└── helloplus/              # Main application directory
    ├── package.json        # Node.js dependencies and scripts
    ├── package-lock.json   # Locked dependency versions
    ├── server.js           # Express server with Google Auth + MySQL
    ├── .env                # Environment variables (database config)
    ├── .gitignore          # Git ignore rules
    ├── README.md           # Google Sign-In setup instructions
    ├── public/             # Static frontend files
    └── dwp393/             # User workspace directory
        ├── edit_pane.html  # Interactive edit pane with popup functionality
        └── .claude/        # Claude Code configuration
```

## Key Files and Their Purpose

### Root Level (`/Underbranch/`)
- **index.html** - Landing page that displays "Getting ready for sprint 1!" with a button linking to the edit pane
- **README.md** - High-level project description as "A web-based collaborative LaTeX editor and compiler"
- **underbranch.png** - Project branding image
- **nginx-reload.sh** - Utility script for server management

### Application Level (`/helloplus/`)
- **server.js** - Node.js/Express backend server handling:
  - Google OAuth authentication
  - MySQL database integration for user login tracking
  - CORS configuration
  - Static file serving
- **package.json** - Defines the project as "Google Sign-In authentication with database logging"
- **.env** - Contains database connection settings (password, host, etc.)
- **public/** - Frontend static assets directory

### User Workspace (`/dwp393/`)
- **edit_pane.html** - Interactive HTML page with:
  - Clean, centered UI design
  - JavaScript popup functionality
  - Button that triggers "have you ever heard of the ADL??" alert

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express.js
- **Authentication**: Google OAuth (google-auth-library)
- **Database**: MySQL2
- **Development**: Nodemon for auto-restart

## Current Development Phase
The project appears to be in Sprint 1 preparation phase, focusing on:
1. Basic web interface setup
2. Google authentication integration
3. MySQL database connectivity for user tracking
4. Individual user workspace functionality (dwp393 directory represents a user workspace)

## Recent Development Activity
- MySQL integration with Google Sign-In
- Server port configuration updates
- Sprint 1 content preparation
- User workspace edit pane development