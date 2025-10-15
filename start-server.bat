@echo off
echo Starting Collaborative LaTeX Editor Server...
echo.
cd /d "%~dp0"
cd frontend\editor
node dev-server.js
pause