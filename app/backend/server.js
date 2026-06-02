// ============================================================
// server.js — THE ENTRY POINT (like Main.java in Java)
// ============================================================
// This is the FIRST file that runs when you do: npm start
// or: pm2 start server.js
//
// What it does:
// 1. Loads configuration from .env file
// 2. Creates a web server (Express)
// 3. Connects to MongoDB database
// 4. Starts listening for requests on a port
// ============================================================

// ---------- STEP 1: Import libraries ----------
// "require" = Java's "import" statement
// These libraries were downloaded by "npm install" (listed in package.json)

const express = require('express');     // Web framework (like Spring Boot)
const mongoose = require('mongoose');   // MongoDB library (like Hibernate)
const cors = require('cors');           // Allows frontend to call this API
require('dotenv').config();             // Loads .env file into process.env

// ---------- STEP 2: Create the web server ----------
// "app" is your web server. All requests go through it.
// Think of it as: new Tomcat() in Java

const app = express();

// ---------- STEP 3: Middleware (runs BEFORE every request) ----------
// Middleware = Java's Servlet Filters
// They process the request before it reaches your route handler

app.use(cors());            // Allow requests from frontend (different port/domain)
app.use(express.json());    // Parse JSON body in requests (like @RequestBody in Spring)

// ---------- STEP 4: Routes (URL handlers) ----------
// "Use the tasks router for any URL starting with /api/tasks"
// Like @RequestMapping("/api/tasks") on a controller class

app.use('/api/tasks', require('./routes/tasks'));

// ---------- STEP 5: Health check route ----------
// A simple route to check if the server is alive
// Used by monitoring tools and load balancers

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- STEP 6: Connect to MongoDB and start server ----------
// process.env.MONGODB_URI = reads from .env file
// process.env.PORT = reads from .env file (default 5000)

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);  // Stop the app if DB connection fails
    });
