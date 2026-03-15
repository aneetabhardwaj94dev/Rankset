const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  name: { type: String, required: true, trim: true },
  nameHindi: { type: String, trim: true },
  slug: { type: String, required: true },
  subject: { type: String, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

chapterSchema.index({ examId: 1, slug: 1 }, { unique: true });
chapterSchema.index({ examId: 1, isActive: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
