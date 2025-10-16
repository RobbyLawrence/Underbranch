# Underbranch
A web-based collaborative LaTeX editor and compiler

![Underbranch Logo](underbranch.png)

## Project Structure

```
Underbranch/
├── .git/                    # Git version control directory
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation (this file)
├── nginx-reload.sh         # Nginx server reload script
├── underbranch.png         # Project logo/banner image
├── index.html              # Root landing page
|-- dist              # Built distribution files
│   └── bundle.js      # compiled frontend bundle
│   └── bundle.js.map  # source map for debugging
│── editor/            # latex editor application
│       ├── node_modules/  # npm dependencies
│       ├── public/        # public assets
│       │   └── dist/      # public distribution files
│       ├── src/           # react source components
│       │   ├── app.js     # main application component
│       │   ├── latexeditor.js # monaco editor integration
│       │   ├── previewpane.js # latex to html converter
│       │   ├── toolbar.js # application toolbar component
│       │   └── index.js   # application entry point
│       ├── package.json   # frontend dependencies and scripts
│       ├── package-lock.json # locked dependency versions
│       ├── webpack.config.js # webpack build configuration
│       └── index.html     # main editor html template
└── helloplus/             # backend server components
    ├── node_modules/      # backend npm dependencies
    ├── public/            # public server assets
    ├── dwp393/           # user directory (ferrari's work)
    │   ├── src/          # earlier editor components
    │   ├── editor.html   # previous editor version
    │   └── simple-server.js # development server
    ├── abrow326/         # user directory
    ├── rlawren9/         # user directory (robby's work)
    ├── webpack.config.js # backend webpack configuration
    └── [various other backend files]
```

## directory explanations


- **`/frontend/dist/`**: production-ready built files that are served to users
- **`/frontend/editor/`**: development source code and configuration
  - **`/src/`**: react components and application logic
  - **`package.json`**: defines dependencies (react, monaco editor, webpack, etc.)
  - **`webpack.config.js`**: build configuration for bundling javascript
  - **`index.html`**: main html template with styling and cdn imports

### `/helloplus/`
backend server components and user-specific directories for development work.

- contains express.js server setup and user workspaces
- individual user directories (`dwp393`, `abrow326`, `rlawren9`) for collaborative development
- earlier versions and experimental implementations

### root level files
- **`index.html`**: simple landing page for the main site
- **`nginx-reload.sh`**: server management script
- **`underbranch.png`**: project branding image
- **`.gitignore`**: specifies files to exclude from version control

## technology stack

### frontend (`/frontend/editor/`)
- **react 19.1.1**: ui framework
- **monaco editor**: code editor (vs code's editor)
- **webpack 5**: module bundler
- **babel**: javascript transpiler

### backend (`/helloplus/`)
- **express.js**: web server framework
- **mysql2**: database connectivity
- **google auth library**: authentication
- **cors**: cross-origin resource sharing

## development workflow

1. **frontend development**: work in `/frontend/editor/src/`
2. **build process**: run `npm run build` in `/frontend/editor/`
3. **distribution**: built files go to `/frontend/dist/`
4. **backend**: server components in `/helloplus/`

## getting started

navigate to `/frontend/editor/` and run:
```bash
npm install
npm run build    # for production build
npm run dev      # for development with watch mode
```
