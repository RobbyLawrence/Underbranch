// server.js

const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID ||
    "679589263803-d9nhrtmnor1m4l3a96revqfb4q09oe5v.apps.googleusercontent.com";
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

const pool = mysql.createPool(dbConfig);

// Session + Security
const SESSION_SECRET = process.env.SESSION_SECRET || "default";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(
    session({
        name: "underbranch.sid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ensure HTTPS in prod
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
    }),
);

const WHITELIST = new Set([
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:8080",
    "https://underbranch.org",
    "http://underbranch.org",
]);

const corsOptions = {
    origin: function (origin, callback) {
        // allow when no origin (curl/postman/server-to-server)
        if (!origin) return callback(null, true);
        if (WHITELIST.has(origin)) return callback(null, true);
        callback(
            new Error("CORS policy: Origin not allowed: " + origin),
            false,
        );
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/signin", express.static(path.join(__dirname)));

// Database initialization
async function initializeDatabase() {
    try {
        // Create database if missing
        const tempConn = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        });
        await tempConn.execute(
            `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``,
        );
        await tempConn.end();

        const conn = await pool.getConnection();

        // Create users table with support for local accounts (password_hash) and optional google_id
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                google_id VARCHAR(255) UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255),
                password_hash VARCHAR(255),
                picture_url TEXT,
                first_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                login_count INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `;

        const createPasswordResetsQuery = `
          CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(128) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX (expires_at)
          ) ENGINE=InnoDB;
        `;

        await conn.execute(createTableQuery);
        await conn.execute(createPasswordResetsQuery);
        conn.release();
        console.log("Database and users table are ready");
    } catch (err) {
        console.error("Database initialization error:", err);
        throw err;
    }
}

// Helper functions for db
async function getUserById(id) {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT * FROM users WHERE id = ?", [id]);
    conn.release();
    return rows[0];
}

async function getUserByEmail(email) {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [
        email,
    ]);
    conn.release();
    return rows[0];
}

async function getUserByGoogleId(gid) {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
        "SELECT * FROM users WHERE google_id = ?",
        [gid],
    );
    conn.release();
    return rows[0];
}

async function createLocalUser({ name, email, password_hash }) {
    const conn = await pool.getConnection();
    const [result] = await conn.execute(
        "INSERT INTO users (google_id, email, name, password_hash) VALUES (NULL, ?, ?, ?)",
        [email, name, password_hash],
    );
    const [rows] = await conn.execute("SELECT * FROM users WHERE id = ?", [
        result.insertId,
    ]);
    conn.release();
    return rows[0];
}

async function upsertGoogleUserFromPayload(payload) {
    const conn = await pool.getConnection();

    // Try find by google_id
    const [byGid] = await conn.execute(
        "SELECT * FROM users WHERE google_id = ?",
        [payload.sub],
    );
    if (byGid.length > 0) {
        // update last_login + increment count
        await conn.execute(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1, name = COALESCE(?, name), picture_url = COALESCE(?, picture_url) WHERE google_id = ?",
            [payload.name, payload.picture, payload.sub],
        );
        const [rows] = await conn.execute(
            "SELECT * FROM users WHERE google_id = ?",
            [payload.sub],
        );
        conn.release();
        return rows[0];
    }

    // If no google_id match, check if an account with same email exists.
    const [byEmail] = await conn.execute(
        "SELECT * FROM users WHERE email = ?",
        [payload.email],
    );
    if (byEmail.length > 0) {
        // Link accounts: set google_id and update profile fields
        await conn.execute(
            "UPDATE users SET google_id = ?, last_login = CURRENT_TIMESTAMP, login_count = login_count + 1, name = COALESCE(?, name), picture_url = COALESCE(?, picture_url) WHERE email = ?",
            [payload.sub, payload.name, payload.picture, payload.email],
        );
        const [rows] = await conn.execute(
            "SELECT * FROM users WHERE email = ?",
            [payload.email],
        );
        conn.release();
        return rows[0];
    }

    // Otherwise insert a new user
    const [insertResult] = await conn.execute(
        "INSERT INTO users (google_id, email, name, picture_url) VALUES (?, ?, ?, ?)",
        [payload.sub, payload.email, payload.name, payload.picture],
    );

    const [newRows] = await conn.execute("SELECT * FROM users WHERE id = ?", [
        insertResult.insertId,
    ]);
    conn.release();
    return newRows[0];
}

async function incrementLoginStatsById(id) {
    const conn = await pool.getConnection();
    await conn.execute(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = ?",
        [id],
    );
    conn.release();
}

function sanitizeUser(row) {
    if (!row) return null;
    return {
        id: row.id,
        google_id: row.google_id || null,
        email: row.email,
        name: row.name,
        picture: row.picture_url || null,
        first_login: row.first_login,
        last_login: row.last_login,
        login_count: row.login_count,
        created_at: row.created_at,
    };
}

// Google token verification
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (err) {
        console.error("Invalid Google token", err);
        throw new Error("Invalid Google token");
    }
}

// Routes

// Serve sign-in page
app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Health
app.get("/signin/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Google authentication endpoint
app.post("/signin/api/auth/google", async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential)
            return res.status(400).json({ error: "No credential provided" });

        const userPayload = await verifyGoogleToken(credential);
        const savedUser = await upsertGoogleUserFromPayload(userPayload);

        // set session
        req.session.userId = savedUser.id;

        res.json({
            success: true,
            message: savedUser ? "User logged in" : "New user created",
            user: sanitizeUser(savedUser),
        });
    } catch (err) {
        console.error("Authentication error:", err);
        res.status(401).json({ error: err.message || "Authentication failed" });
    }
});

// Sign up (local)
app.post("/signin/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Missing email or password" });

        // See if email already exists
        const existing = await getUserByEmail(email);
        if (existing)
            return res.status(400).json({ error: "Email already exists" });

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await createLocalUser({ name, email, password_hash });

        // Set session
        req.session.userId = newUser.id;

        res.json({
            success: true,
            message: "Account created",
            user: sanitizeUser(newUser),
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
    }
});

// Login (local)
app.post("/signin/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Missing email or password" });

        const user = await getUserByEmail(email);
        if (!user || !user.password_hash) {
            // user not found or only has Google account
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)
            return res.status(401).json({ error: "Invalid email or password" });

        // update stats
        await incrementLoginStatsById(user.id);
        const updated = await getUserById(user.id);

        // Set session
        req.session.userId = updated.id;

        res.json({
            success: true,
            message: "Login successful",
            user: sanitizeUser(updated),
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

// Logout
app.post("/signin/api/auth/logout", (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
                return res.status(500).json({ error: "Logout failed" });
            }
            // clear cookie in response
            res.clearCookie("underbranch.sid");
            return res.json({ success: true, message: "Logged out" });
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Logout failed" });
    }
});

// Auth status - used by frontend on page load
app.get("/signin/api/auth/status", async (req, res) => {
    try {
        if (!req.session?.userId) return res.json({ authenticated: false });
        const user = await getUserById(req.session.userId);
        if (!user) return res.json({ authenticated: false });
        res.json({ authenticated: true, user: sanitizeUser(user) });
    } catch (err) {
        console.error("Status error:", err);
        res.status(500).json({ authenticated: false });
    }
});

// Get all users (for testing purposes)
//
// I need to remove this soon
app.get("/signin/api/users", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [users] = await conn.execute(
            "SELECT id, google_id, email, name, first_login, last_login, login_count FROM users ORDER BY created_at DESC",
        );
        conn.release();
        res.json({ users });
    } catch (err) {
        console.error("Get users error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get user by ID or google_id
app.get("/signin/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await pool.getConnection();

        const [users] = await conn.execute(
            "SELECT * FROM users WHERE google_id = ? OR id = ?",
            [id, id],
        );
        conn.release();

        if (users.length === 0)
            return res.status(404).json({ error: "User not found" });
        res.json({ user: sanitizeUser(users[0]) });
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

app.post("/signin/api/auth/forgot", async (req, res) => {
    const { email } = req.body;

    try {
        // Try to find the user
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
            email,
        ]);

        // If no user or user has no password, we still return success to avoid enumeration.
        if (rows.length === 0 || !rows[0].password_hash) {
            console.warn(
                `Password reset requested for non-existing or google-only account: ${email}`,
            );
            // Respond with a generic success
            return res.json({ success: true });
        }

        const user = rows[0];

        // generate random token, should last for 15 minutes
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        // store token
        await pool.query(
            "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
            [user.id, token, expires],
        );

        // Send reset email
        const resetLink = `https://underbranch.org/signin/reset.html?token=${token}`;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // or use OAuth2
            },
        });

        // Attempt to send email, but still return generic success even if mail fails
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Password Reset",
                text: `Click here to reset your password: ${resetLink}`,
            });
        } catch (mailErr) {
            console.error("Failed to send reset email:", mailErr);
            // fall through and return success to the client; investigate server logs for details
        }

        return res.json({ success: true });
    } catch (err) {
        console.error("Failed to process reset request:", err);
        // Return generic success to avoid giving attackers useful info (optionally: res.status(500)...)
        return res
            .status(500)
            .json({ error: "Failed to process reset request" });
    }
});

// Reset password
app.post("/signin/api/auth/reset", async (req, res) => {
    const { token, password } = req.body;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM password_resets WHERE token = ?",
            [token],
        );
        if (rows.length === 0)
            return res.status(400).json({ error: "Invalid or expired token" });

        const reset = rows[0];
        if (new Date(reset.expires_at) < new Date()) {
            return res.status(400).json({ error: "Token expired" });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
            hash,
            reset.user_id,
        ]);
        await pool.query("DELETE FROM password_resets WHERE id = ?", [
            reset.id,
        ]); // invalidate

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to reset password" });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
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
            console.log(`Frontend: http://localhost:${PORT}/signin`);
            console.log(
                `API Health: http://localhost:${PORT}/signin/api/health`,
            );
            console.log(`API Users: http://localhost:${PORT}/signin/api/users`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
