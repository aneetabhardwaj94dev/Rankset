const express = require('express');
const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.use(requireRole('admin', 'manager'));

router.get('/leaderboard', async (req, res) => {
  try {
    const { examId, chapterId, phone, email, format } = req.query;
    if (!examId) return res.status(400).json({ error: 'examId required' });
    const match = { examId: new mongoose.Types.ObjectId(examId) };
    if (chapterId) match.chapterId = new mongoose.Types.ObjectId(chapterId);
    let agg = [
      { $match: match },
      { $sort: { score: -1, submittedAt: -1 } },
      { $group: { _id: '$userId', bestScore: { $max: '$score' }, lastAttempt: { $last: '$$ROOT' } } },
      { $sort: { bestScore: -1 } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', name: '$user.name', email: '$user.email', phone: '$user.phone', score: '$bestScore' } },
    ];
    const data = await Attempt.aggregate(agg);
    let filtered = data;
    if (phone) filtered = data.filter((r) => r.phone && String(r.phone).includes(phone));
    if (email) filtered = filtered.filter((r) => r.email && r.email.toLowerCase().includes(email.toLowerCase()));
    const result = filtered.map((r, i) => ({ rank: i + 1, ...r }));
    if (format === 'csv') {
      const csv = [['Rank', 'Name', 'Email', 'Phone', 'Score'].join(','), ...result.map((r) => [r.rank, r.name, r.email, r.phone, r.score].join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leaderboard.csv');
      return res.send(csv);
    }
    res.json({ data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
