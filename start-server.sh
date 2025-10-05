#!/bin/bash
echo "Starting Collaborative LaTeX Editor Server..."
echo
cd "$(dirname "$0")"
cd frontend/editor
node dev-server.js