// task-service/models/TaskProgress.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskProgressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  status: { type: String, enum: ['locked','unlocked','in_progress','completed'], default: 'unlocked' },
  attempts: { type: Number, default: 0 },
  lastSubmission: { type: Schema.Types.ObjectId, ref: 'Submission' },
  xpEarned: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TaskProgress', TaskProgressSchema);
