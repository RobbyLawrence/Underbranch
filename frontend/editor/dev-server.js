#!/usr/bin/env node
// Simple static file server (no dependencies) to serve the repository root.
// Usage: node dev-server.js
// Then open: http://localhost:8080/frontend/editor/index.html

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = process.cwd(); // serve files relative to repo root

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.map': 'application/json',
  '.txt': 'text/plain'
};

function send404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send404(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', type + (type.startsWith('text/') ? '; charset=utf-8' : ''));
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    // Decode URL and prevent directory traversal
    const decoded = decodeURIComponent(req.url.split('?')[0]);
    let safePath = decoded.replace(/^\/+/, ''); // remove leading /
    if (!safePath) safePath = 'frontend/editor/index.html';

    const filePath = path.join(ROOT, safePath);

    // If the path maps to a directory, try to serve index.html inside it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        sendFile(indexPath, res);
        return;
      }
      send404(res);
      return;
    }

    if (fs.existsSync(filePath)) {
      sendFile(filePath, res);
      return;
    }

    // If not found, fallback to root index for convenience
    const fallback = path.join(ROOT, 'frontend', 'editor', 'index.html');
    if (fs.existsSync(fallback)) {
      sendFile(fallback, res);
      return;
    }

    send404(res);
  } catch (err) {
    console.error('Server error', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}/`);
  console.log('Open /frontend/editor/index.html to view the editor.');
});

process.on('SIGINT', () => {
  console.log('Shutting down dev server');
  server.close(() => process.exit(0));
});
