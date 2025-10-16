const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} -> ${req.method} ${req.url}`);
    next();
});

// Serve static files from public/dist directory (where webpack outputs bundle.js)
app.use(
    "/frontend/dist",
    express.static(path.join(__dirname, "public", "dist")),
);

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`\n✅ LaTeX Editor Server Running!`);
    console.log(`\n📝 Open your browser to: http://localhost:${PORT}`);
    console.log(
        `\n📦 Serving bundle.js from: ${path.join(__dirname, "public", "dist", "bundle.js")}`,
    );
    console.log(`\n🔧 Press Ctrl+C to stop the server\n`);
});
