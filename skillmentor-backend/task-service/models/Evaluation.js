// task-service/models/Evaluation.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EvaluationSchema = new Schema({
  submission: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
  grader: { type: String, enum: ['gemini','judge0','manual'], default: 'gemini' },
  score: { type: Number, min: 0, max: 100 },
  passedTests: Number,
  totalTests: Number,
  feedback: String,
  detail: Schema.Types.Mixed,
  judges: {
    judge0: {
      passedTests: Number,
      totalTests: Number,
      stdout: String,
      stderr: String,
      executionTime: String,
      status: String
    },
    gemini: {
      score: Number,
      feedback: {
        summary: String,
        strengths: [String],
        areasForImprovement: [String],
        codeExamples: [String],
        nextSteps: [String],
        resources: [{
          title: String,
          url: String
        }]
      },
      breakdown: {
        correctness: Number,
        code_quality: Number,
        completeness: Number,
        error_handling: Number,
        documentation: Number
      }
    }
  },
  isPassed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
EvaluationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
