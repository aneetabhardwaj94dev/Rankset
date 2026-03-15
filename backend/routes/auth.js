const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, fatherName, examName, email, phone, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ name, fatherName, examName, email, phone, password });
        await user.save();

        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        res.json({ message: "Login Success", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;