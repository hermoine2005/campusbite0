const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  prn: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true }));
