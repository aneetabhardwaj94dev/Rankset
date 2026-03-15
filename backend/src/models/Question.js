const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  medium: { type: String, enum: ['en', 'hi'], default: 'en' },
  questionText: { type: String, required: true },
  questionImage: { type: String },
  options: [{
    text: { type: String, required: true },
    image: { type: String },
    isCorrect: { type: Boolean, default: false },
  }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String },
  hasLatex: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

questionSchema.index({ examId: 1, chapterId: 1 });
questionSchema.index({ chapterId: 1, isActive: 1 });

module.exports = mongoose.model('Question', questionSchema);
