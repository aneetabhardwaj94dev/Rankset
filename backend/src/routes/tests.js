const express = require('express');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/questions', auth, async (req, res) => {
  try {
    const { examId, chapterId, medium = 'en', limit = 20 } = req.query;
    if (!examId || !chapterId) return res.status(400).json({ error: 'examId and chapterId required' });
    const questions = await Question.find({
      examId,
      chapterId,
      medium,
      isActive: true,
    })
      .sort('order')
      .limit(Number(limit) || 20)
      .lean();
    const withoutCorrect = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      questionImage: q.questionImage,
      options: q.options.map((o) => ({ text: o.text, image: o.image })),
      hasLatex: q.hasLatex,
    }));
    res.json({ questions: withoutCorrect });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { examId, chapterId, answers, timeSpentSeconds } = req.body;
    if (!examId || !chapterId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'examId, chapterId and answers required' });
    }
    const questions = await Question.find({
      _id: { $in: answers.map((a) => a.questionId) },
      isActive: true,
    }).lean();
    let correctCount = 0;
    const results = answers.map((a) => {
      const q = questions.find((x) => x._id.toString() === a.questionId?.toString());
      const correct = q && q.correctOptionIndex === a.selectedIndex;
      if (correct) correctCount++;
      return {
        questionId: a.questionId,
        selectedIndex: a.selectedIndex,
        correctOptionIndex: q ? q.correctOptionIndex : -1,
        correct,
        explanation: q ? q.explanation : null,
      };
    });
    const totalQuestions = questions.length;
    const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
    await Attempt.create({
      userId: req.user._id,
      examId,
      chapterId,
      answers: answers.map((a) => ({ questionId: a.questionId, selectedIndex: a.selectedIndex })),
      score,
      totalQuestions,
      correctCount,
      timeSpentSeconds: timeSpentSeconds || 0,
    });
    res.json({
      score,
      totalQuestions,
      correctCount,
      results,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
