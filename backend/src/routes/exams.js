const express = require('express');
const Exam = require('../models/Exam');
const Chapter = require('../models/Chapter');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/languages', (req, res) => {
  res.json({ languages: [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }] });
});

router.get('/', async (req, res) => {
  try {
    const lang = req.query.language || 'en';
    const exams = await Exam.find({ isActive: true, language: lang }).sort('order').lean();
    res.json({ exams });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:examId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find({ examId: req.params.examId, isActive: true }).sort('order').lean();
    res.json({ chapters });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
