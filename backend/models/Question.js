const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    subject: String,
    chapter: String,
    examName: String,
    language: { type: String, enum: ['Hindi', 'English'], default: 'English' },
    questionText: String, // Yahan LaTeX code bhi dal sakte hain like $x^2$
    options: [String],
    correctAnswer: Number, // 0, 1, 2, 3 (Index)
    imageUrl: String, // Question image link
    optionImages: [String] // Options images links
});

module.exports = mongoose.model('Question', QuestionSchema);