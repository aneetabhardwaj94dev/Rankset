const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    examName: String,
    subject: String,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    wrongAnswers: Number,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);