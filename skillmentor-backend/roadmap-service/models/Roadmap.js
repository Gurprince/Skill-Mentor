const mongoose = require('mongoose');
const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerPath: { type: String, required: true },
  currentLevel: { type: String, required: true },
  jobValidatedSkills: [{ type: String }],
  phases: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    prerequisites: [{ type: String, required: true }],
    learningOutcomes: [{ type: String, required: true }],
    skills: [{
      name: { type: String, required: true },
      subtopics: [{ type: String, required: true }]
    }],
    tasks: [{
      description: { type: String, required: true },
      resources: [{ type: String }],
      timeline: { type: String, required: true },
      xp: { type: Number, required: true },
      dependencies: [{ type: String }],
      _id: { type: String, required: true },
      category: { type: String, enum: ['code','quiz','project','reading','learning','research'], default: 'code' }
    }],
    miniProject: {
      description: { type: String, required: true },
      submission: { type: String, required: true },
      assessmentCriteria: [{ type: String, required: true }],
      resources: [{ type: String }],
      timeline: { type: String, required: true },
      xp: { type: Number, required: true },
      badge: { type: String, required: true },
      category: { type: String, enum: ['project'], default: 'project' }
    },
    totalDuration: { type: String, required: true },
    isUnlocked: { type: Boolean, required: true },
    milestones: [{ type: String, required: true }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Roadmap', roadmapSchema);