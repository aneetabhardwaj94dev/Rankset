const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameHindi: { type: String, trim: true },
  slug: { type: String, required: true, unique: true },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// slug: unique index already from schema option
examSchema.index({ language: 1, isActive: 1 });

module.exports = mongoose.model('Exam', examSchema);
