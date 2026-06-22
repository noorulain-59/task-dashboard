// server.js
// Entry point for the backend. Sets up Express, connects to MongoDB,
// mounts the /api/tasks routes, and serves the frontend as static files.

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_dashboard';

// ---------- Middleware ----------
app.use(cors());            // allow the frontend to call this API from another origin
app.use(express.json());    // parse incoming JSON request bodies (req.body)

// ---------- API routes ----------
app.use('/api/tasks', taskRoutes);

// Simple health check endpoint, useful for confirming deployment is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', dbState: mongoose.connection.readyState });
});

// ---------- Serve the frontend ----------
// In production we serve the static frontend folder from the same Express app,
// so only ONE service needs to be deployed.
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // let unmatched API routes 404 properly
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ---------- Connect to MongoDB, then start the server ----------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
