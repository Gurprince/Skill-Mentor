const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  phaseId: { type: String, required: true }, 
  title: { type: String, default: '' },
  description: { type: String, required: true },
  resources: [{ type: String }],
  timeline: { type: String },
  xp: { type: Number, default: 0 },
  dependencies: [{ type: String }], 
  type: { type: String, enum: ['task', 'miniProject'], default: 'task' },
  badge: { type: String, default: null }, 
  sourceTaskId: { type: String, default: null },
  category: { type: String, enum: ['code','quiz','project','reading','learning','research'], default: 'code' },
  testCases: [{
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' }
  }],
  evaluationCriteria: [{
    key: { type: String },
    description: { type: String },
    weight: { type: Number }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
