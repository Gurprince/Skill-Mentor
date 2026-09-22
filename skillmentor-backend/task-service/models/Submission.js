// task-service/models/Submission.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubmissionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  roadmap: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
  type: { type: String, enum: ['text','code','link','file'], required: true },
  content: Schema.Types.Mixed, // e.g. { code: '...', repo: '...', text: '...' }
  language: { type: String }, // for code submissions
  status: { type: String, enum: ['pending','running','evaluated','failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SubmissionSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Submission', SubmissionSchema);
