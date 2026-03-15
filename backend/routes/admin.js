const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');

// Bulk Upload Questions
router.post('/bulk-upload', async (req, res) => {
    try {
        const questions = req.body; // CSV se convert kiya hua JSON data
        await Question.insertMany(questions);
        res.status(200).json({ message: "Questions Uploaded Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Users for Admin Report
router.get('/users-report', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;