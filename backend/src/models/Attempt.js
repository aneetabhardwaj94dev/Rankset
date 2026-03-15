const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedIndex: Number }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  timeSpentSeconds: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

attemptSchema.index({ userId: 1, examId: 1, chapterId: 1 });
attemptSchema.index({ examId: 1, chapterId: 1, score: -1 });
attemptSchema.index({ examId: 1, score: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
