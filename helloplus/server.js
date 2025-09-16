// server.js - Backend server for Google authentication and database logging
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "auth_test",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files

// Initialize database
async function initializeDatabase() {
    try {
        // First connection without database to create it
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        });

        // Create database if it doesn't exist
        await tempConnection.execute(
            `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`,
        );
        await tempConnection.end();

        // Now connect to the specific database and create table
        const connection = await pool.getConnection();

        // Create users table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                google_id VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                picture_url TEXT,
                first_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                login_count INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        await connection.execute(createTableQuery);
        console.log("Database and table initialized successfully");

        connection.release();
    } catch (error) {
        console.error("Database initialization error:", error);
        throw error;
    }
}

// Verify Google token
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return payload;
    } catch (error) {
        throw new Error("Invalid Google token");
    }
}

// Save user to database
async function saveUserToDatabase(userPayload) {
    try {
        const connection = await pool.getConnection();

        // Check if user already exists
        const [existingUsers] = await connection.execute(
            "SELECT * FROM users WHERE google_id = ?",
            [userPayload.sub],
        );

        if (existingUsers.length > 0) {
            // Update existing user's last login and increment login count
            await connection.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE google_id = ?",
                [userPayload.sub],
            );

            console.log(`Updated existing user: ${userPayload.email}`);
            connection.release();
            return { isNewUser: false, user: existingUsers[0] };
        } else {
            // Insert new user
            const insertQuery = `
                INSERT INTO users (google_id, email, name, picture_url)
                VALUES (?, ?, ?, ?)
            `;

            const [result] = await connection.execute(insertQuery, [
                userPayload.sub,
                userPayload.email,
                userPayload.name,
                userPayload.picture,
            ]);

            console.log(`New user saved: ${userPayload.email}`);
            connection.release();
            return { isNewUser: true, userId: result.insertId };
        }
    } catch (error) {
        console.error("Database save error:", error);
        throw new Error("Failed to save user to database");
    }
}

// Routes

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Google authentication endpoint
app.post("/api/auth/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: "No credential provided" });
        }

        // Verify the Google token
        const userPayload = await verifyGoogleToken(credential);

        // Save user to database
        const saveResult = await saveUserToDatabase(userPayload);

        // Send response
        res.json({
            success: true,
            message: saveResult.isNewUser
                ? "New user created"
                : "User logged in",
            user: {
                id: userPayload.sub,
                email: userPayload.email,
                name: userPayload.name,
                picture: userPayload.picture,
                isNewUser: saveResult.isNewUser,
            },
        });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ error: error.message });
    }
});

// Get all users (for testing purposes)
app.get("/api/users", async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.execute(
            "SELECT id, google_id, email, name, first_login, last_login, login_count FROM users ORDER BY created_at DESC",
        );
        connection.release();

        res.json({ users });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [users] = await connection.execute(
            "SELECT * FROM users WHERE google_id = ? OR id = ?",
            [id, id],
        );

        connection.release();

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await pool.end();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await pool.end();
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Frontend: http://localhost:${PORT}`);
            console.log(`API Health: http://localhost:${PORT}/api/health`);
            console.log(`API Users: http://localhost:${PORT}/api/users`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
