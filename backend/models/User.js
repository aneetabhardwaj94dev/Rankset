// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    examName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }, // student, admin, manager
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);