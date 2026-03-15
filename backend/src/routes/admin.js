const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Chapter = require('../models/Chapter');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + (file.originalname || 'file').replace(/\s/g, '_')),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(auth);
router.use(requireRole('admin'));

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, exam, search } = req.query;
    const filter = {};
    if (exam) filter.competitiveExam = exam;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/export', async (req, res) => {
  try {
    const { exam, fromDate, toDate } = req.query;
    const filter = {};
    if (exam) filter.competitiveExam = exam;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const users = await User.find(filter).select('name fatherName competitiveExam email phone createdAt').sort({ createdAt: -1 }).lean();
    const csv = [
      ['Name', 'Father Name', 'Exam', 'Email', 'Phone', 'Joined'].join(','),
      ...users.map((u) => [u.name, u.fatherName, u.competitiveExam, u.email, u.phone, u.createdAt].join(',')),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-report.csv');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, block } = req.body;
    const update = {};
    if (role) update.role = role;
    if (typeof block === 'boolean') update.blocked = block;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/exams', async (req, res) => {
  const exams = await Exam.find().sort('order').lean();
  res.json({ exams });
});

router.get('/chapters', async (req, res) => {
  const chapters = await Chapter.find().populate('examId', 'name').sort('order').lean();
  res.json({ chapters });
});

router.post('/questions', upload.fields([{ name: 'questionImage', maxCount: 1 }, { name: 'optionImages', maxCount: 6 }]), async (req, res) => {
  try {
    const { examId, chapterId, medium, questionText, options, correctOptionIndex, explanation, hasLatex } = req.body;
    if (!examId || !chapterId || !questionText) return res.status(400).json({ error: 'examId, chapterId, questionText required' });
    const opts = Array.isArray(options) ? options : (typeof options === 'string' ? JSON.parse(options) : []);
    const qImg = req.files?.questionImage?.[0];
    const oImgs = req.files?.optionImages || [];
    const optionImages = oImgs.map((f) => '/uploads/' + f.filename);
    const optionList = opts.map((o, i) => ({
      text: typeof o === 'string' ? o : o.text,
      image: optionImages[i] || (o.image || ''),
      isCorrect: Number(correctOptionIndex) === i,
    }));
    const question = await Question.create({
      examId,
      chapterId,
      medium: medium || 'en',
      questionText,
      questionImage: qImg ? '/uploads/' + qImg.filename : undefined,
      options: optionList,
      correctOptionIndex: Number(correctOptionIndex),
      explanation: explanation || '',
      hasLatex: hasLatex === true || hasLatex === 'true',
    });
    res.status(201).json({ question });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/questions/bulk', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file required' });
    const buf = fs.readFileSync(req.file.path);
    const rows = parse(buf, { columns: true, skip_empty_lines: true });
    const inserted = [];
    for (const row of rows) {
      const examId = row.examId || row.exam_id;
      const chapterId = row.chapterId || row.chapter_id;
      const medium = (row.medium || 'en').toLowerCase();
      const questionText = row.questionText || row.question_text || row.question;
      const correctIndex = parseInt(row.correctOptionIndex ?? row.correct_index ?? 0, 10);
      const options = [
        row.option1 || row.optionA,
        row.option2 || row.optionB,
        row.option3 || row.optionC,
        row.option4 || row.optionD,
      ].filter(Boolean).map((text, i) => ({ text, isCorrect: i === correctIndex }));
      if (!examId || !chapterId || !questionText || options.length === 0) continue;
      const q = await Question.create({
        examId,
        chapterId,
        medium,
        questionText,
        options,
        correctOptionIndex: correctIndex,
        explanation: row.explanation || '',
        hasLatex: /latex|math|\\\(|\\\[/.test(questionText),
      });
      inserted.push(q._id);
    }
    fs.unlinkSync(req.file.path);
    res.json({ inserted: inserted.length, ids: inserted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/reports/ranks', async (req, res) => {
  try {
    const { examId, chapterId, format } = req.query;
    if (!examId) return res.status(400).json({ error: 'examId required' });
    let data;
    if (chapterId) {
      const attempts = await Attempt.find({ examId, chapterId }).populate('userId', 'name email phone').sort({ score: -1 }).lean();
      data = attempts.map((a, i) => ({ rank: i + 1, name: a.userId?.name, email: a.userId?.email, phone: a.userId?.phone, score: a.score }));
    } else {
      const agg = await Attempt.aggregate([
        { $match: { examId: new mongoose.Types.ObjectId(examId) } },
        { $group: { _id: '$userId', totalScore: { $sum: '$score' }, count: { $sum: 1 } } },
        { $sort: { totalScore: -1 } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $unwind: '$u' },
        { $project: { name: '$u.name', email: '$u.email', phone: '$u.phone', totalScore: 1, attempts: '$count' } },
      ]);
      data = agg.map((r, i) => ({ rank: i + 1, ...r }));
    }
    if (format === 'csv') {
      const csv = [Object.keys(data[0] || {}).join(','), ...data.map((r) => Object.values(r).join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ranks-report.csv');
      return res.send(csv);
    }
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
