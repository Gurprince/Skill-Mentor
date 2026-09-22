const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  currentLevel: String,          // "1st Year", "Final Year", etc.
  careerPath: String,           // e.g., "Fullstack Developer"
  knownSkills: [String],
  xp: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
