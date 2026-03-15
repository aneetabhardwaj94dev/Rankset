/**
 * One-time seed: creates one sample exam and one chapter.
 * Run: node scripts/seed.js (from backend folder, with MONGODB_URI in .env or env)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Exam = require('../src/models/Exam');
const Chapter = require('../src/models/Chapter');

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Exam.findOne({ slug: 'sample-exam' });
  if (existing) {
    console.log('Sample exam already exists. Skipping seed.');
    process.exit(0);
  }
  const exam = await Exam.create({
    name: 'Sample Competitive Exam',
    slug: 'sample-exam',
    language: 'en',
    isActive: true,
    order: 0,
  });
  await Chapter.create({
    examId: exam._id,
    name: 'Sample Chapter',
    slug: 'sample-chapter',
    isActive: true,
    order: 0,
  });
  console.log('Created sample exam and chapter. You can add questions from Admin → Upload questions.');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
