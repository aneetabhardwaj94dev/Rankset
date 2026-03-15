const express = require('express');
const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function getChapterRanks(examId, chapterId, limit = 100) {
  const agg = await Attempt.aggregate([
    { $match: { examId: new mongoose.Types.ObjectId(examId), chapterId: new mongoose.Types.ObjectId(chapterId) } },
    { $sort: { score: -1, submittedAt: -1 } },
    { $group: { _id: '$userId', bestScore: { $max: '$score' }, lastAttempt: { $last: '$$ROOT' } } },
    { $sort: { bestScore: -1 } },
    { $limit: limit },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' },
    },
    { $unwind: '$user' },
    {
      $project: {
        rank: { $literal: 0 },
        userId: '$_id',
        name: '$user.name',
        score: '$bestScore',
      },
    },
  ]);
  agg.forEach((r, i) => { r.rank = i + 1; });
  return agg;
}

async function getOverallRanks(examId, limit = 100) {
  const agg = await Attempt.aggregate([
    { $match: { examId: new mongoose.Types.ObjectId(examId) } },
    { $group: { _id: '$userId', totalScore: { $sum: '$score' }, attempts: { $sum: 1 } } },
    { $sort: { totalScore: -1 } },
    { $limit: limit },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { rank: { $literal: 0 }, userId: '$_id', name: '$user.name', totalScore: 1, attempts: 1 } },
  ]);
  agg.forEach((r, i) => { r.rank = i + 1; });
  return agg;
}

router.get('/chapter', auth, async (req, res) => {
  try {
    const { examId, chapterId } = req.query;
    if (!examId || !chapterId) return res.status(400).json({ error: 'examId and chapterId required' });
    const ranks = await getChapterRanks(examId, chapterId);
    const myEntry = ranks.find((r) => r.userId.toString() === req.user._id.toString());
    res.json({ ranks, myRank: myEntry || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/overall', auth, async (req, res) => {
  try {
    const { examId } = req.query;
    if (!examId) return res.status(400).json({ error: 'examId required' });
    const ranks = await getOverallRanks(examId);
    const myEntry = ranks.find((r) => r.userId.toString() === req.user._id.toString());
    res.json({ ranks, myRank: myEntry || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
