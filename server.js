const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/traffic_guard')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Error:', err));

// --- SCHEMAS ---

// 1. Temporary Logs (The Rate Limiter)
const requestSchema = new mongoose.Schema({
    ip: String,
    createdAt: { type: Date, default: Date.now, expires: 60 } 
});
const RequestLog = mongoose.model('RequestLog', requestSchema);

// 2. Permanent Blacklist (The Ban Hammer) // <<< NEW >>>
const blacklistSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    reason: String,
    bannedAt: { type: Date, default: Date.now }
});
const Blacklist = mongoose.model('Blacklist', blacklistSchema);


// --- MIDDLEWARE ---

const rateLimiter = async (req, res, next) => {
    const ip = req.ip;

    // STEP 1: Check Blacklist FIRST (High Priority Security) // <<< NEW >>>
    // If they are banned, stop them right here. Don't even let them count.
    const isBanned = await Blacklist.findOne({ ip: ip });
    if (isBanned) {
        console.log(`⛔ REJECTED BANNED IP: ${ip}`);
        return res.status(403).json({ error: "ACCESS DENIED: You have been permanently banned." });
    }

    // STEP 2: Rate Limiting (Standard Logic)
    const requestCount = await RequestLog.countDocuments({ ip: ip });
    const LIMIT = 5; 
    
    if (requestCount >= LIMIT) {
        console.log(`⚠️ THRESHOLD EXCEEDED: ${ip}`);
        return res.status(429).json({ error: "Too many requests. Cool down." });
    }

    // STEP 3: Log & Proceed
    await RequestLog.create({ ip: ip });
    next();
};


// --- ROUTES ---

// Protected Route
app.get('/api/resource', rateLimiter, (req, res) => {
    res.json({ message: "Sensitive Data Accessed", timestamp: new Date() });
});

// Analytics Route
app.get('/api/analytics', async (req, res) => {
    const stats = await RequestLog.aggregate([
        { $group: { _id: "$ip", count: { $sum: 1 } } }
    ]);
    res.json(stats);
});

// Ban Route (The Hammer) // <<< NEW >>>
app.post('/api/ban', async (req, res) => {
    const { ip } = req.body;
    try {
        await Blacklist.create({ ip, reason: "Manual Ban from Dashboard" });
        console.log(`🔨 HAMMER DROPPED on ${ip}`);
        res.json({ message: "User Banned Successfully" });
    } catch (e) {
        res.status(500).json({ error: "Failed to ban user (maybe already banned?)" });
    }
});

app.listen(5000, () => console.log(`🛡️ Guard Server Running on Port 5000`));