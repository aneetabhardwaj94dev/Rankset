const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('fatherName').trim().notEmpty(),
    body('competitiveExam').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, fatherName, competitiveExam, email, phone, password } = req.body;
      const existing = await User.findOne({ $or: [{ email }, { phone }] });
      if (existing) return res.status(400).json({ error: 'Email or phone already registered' });
      const user = await User.create({ name, fatherName, competitiveExam, email, phone, password });
      const token = makeToken(user);
      res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, preferredLanguage: user.preferredLanguage }, token });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.post('/login', [body('email').isEmail(), body('password').exists()], async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.blocked) return res.status(403).json({ error: 'Account is blocked' });
    const token = makeToken(user);
    const u = user.toObject();
    delete u.password;
    res.json({ user: u, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/change-password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.comparePassword(req.body.currentPassword);
    if (!ok) return res.status(400).json({ error: 'Current password is wrong' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.json({ message: 'If email exists, reset link will be sent' });
    const resetToken = jwt.sign({ userId: user._id.toString(), purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const scriptUrl = process.env.PASSWORD_RESET_SCRIPT_URL;
    if (scriptUrl) {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, resetLink }),
      });
    }
    res.json({ message: 'If email exists, reset link will be sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') return res.status(400).json({ error: 'Invalid token' });
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) return res.status(400).json({ error: 'Invalid token' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', auth, [body('preferredLanguage').optional().isIn(['en', 'hi'])], async (req, res) => {
  try {
    if (req.body.preferredLanguage) req.user.preferredLanguage = req.body.preferredLanguage;
    await req.user.save();
    res.json({ user: req.user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
