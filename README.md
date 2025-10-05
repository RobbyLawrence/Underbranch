# Underbranch
A web-based collaborative LaTeX editor and compiler

![Underbranch Logo](underbranch.png)

## Project Structure

```
Underbranch/
├── .claude/                 # Claude Code configuration files
├── .git/                    # Git version control directory
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation (this file)
├── nginx-reload.sh         # Nginx server reload script
├── underbranch.png         # Project logo/banner image
├── index.html              # Root landing page
├── frontend/               # Frontend application directory
│   ├── dist/              # Built distribution files
│   │   ├── bundle.js      # Compiled frontend bundle
│   │   └── bundle.js.map  # Source map for debugging
│   └── editor/            # LaTeX editor application
│       ├── .claude/       # Claude Code local settings
│       ├── node_modules/  # NPM dependencies
│       ├── public/        # Public assets
│       │   └── dist/      # Public distribution files
│       ├── src/           # React source components
│       │   ├── App.js     # Main application component
│       │   ├── LaTeXEditor.js # Monaco editor integration
│       │   ├── PreviewPane.js # LaTeX to HTML converter
│       │   ├── Toolbar.js # Application toolbar component
│       │   └── index.js   # Application entry point
│       ├── package.json   # Frontend dependencies and scripts
│       ├── package-lock.json # Locked dependency versions
│       ├── webpack.config.js # Webpack build configuration
│       └── index.html     # Main editor HTML template
└── helloplus/             # Backend server components
    ├── node_modules/      # Backend NPM dependencies
    ├── public/            # Public server assets
    ├── dwp393/           # User directory (Ferrari's work)
    │   ├── src/          # Earlier editor components
    │   ├── editor.html   # Previous editor version
    │   └── simple-server.js # Development server
    ├── abrow326/         # User directory
    ├── rlawren9/         # User directory (Robby's work)
    ├── webpack.config.js # Backend webpack configuration
    └── [various other backend files]
```

## Directory Explanations

### `/frontend/`
Contains the main LaTeX editor application built with React and modern web technologies.

- **`/frontend/dist/`**: Production-ready built files that are served to users
- **`/frontend/editor/`**: Development source code and configuration
  - **`/src/`**: React components and application logic
  - **`package.json`**: Defines dependencies (React, Monaco Editor, Webpack, etc.)
  - **`webpack.config.js`**: Build configuration for bundling JavaScript
  - **`index.html`**: Main HTML template with styling and CDN imports

### `/helloplus/`
Backend server components and user-specific directories for development work.

- Contains Express.js server setup and user workspaces
- Individual user directories (`dwp393`, `abrow326`, `rlawren9`) for collaborative development
- Earlier versions and experimental implementations

### Root Level Files
- **`index.html`**: Simple landing page for the main site
- **`nginx-reload.sh`**: Server management script
- **`underbranch.png`**: Project branding image
- **`.gitignore`**: Specifies files to exclude from version control

## Technology Stack

### Frontend (`/frontend/editor/`)
- **React 19.1.1**: UI framework
- **Monaco Editor**: Code editor (VS Code's editor)
- **Webpack 5**: Module bundler
- **Babel**: JavaScript transpiler

### Backend (`/helloplus/`)
- **Express.js**: Web server framework
- **MySQL2**: Database connectivity
- **Google Auth Library**: Authentication
- **CORS**: Cross-origin resource sharing

## Development Workflow

1. **Frontend Development**: Work in `/frontend/editor/src/`
2. **Build Process**: Run `npm run build` in `/frontend/editor/`
3. **Distribution**: Built files go to `/frontend/dist/`
4. **Backend**: Server components in `/helloplus/`

## Getting Started

Navigate to `/frontend/editor/` and run:
```bash
npm install
npm run build    # For production build
npm run dev      # For development with watch mode
```

## Running the Development Server

To serve the LaTeX Editor locally on port 8080:

```bash
node frontend\editor\dev-server.js
```

Then access the editor at: **http://localhost:8080/**

This development server serves the built React application and all necessary static assets from the correct paths.