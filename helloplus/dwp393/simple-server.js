// Simple server just for testing the editor
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/dwp393', express.static(__dirname));

// Serve the editor page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'editor.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'editor.html'));
});

app.listen(PORT, () => {
    console.log(`Simple editor server running on http://localhost:${PORT}`);
    console.log(`Editor available at: http://localhost:${PORT}/editor`);
});