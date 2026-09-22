// task-service/controllers/submissionController.js
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const TaskProgress = require('../models/TaskProgress');
const { evaluateSubmission } = require('../../services/evaluationService');

let submissionQueue;
try {
  submissionQueue = require('../../queues/submissionQueue');
  console.log('Redis queue initialized');
} catch (err) {
  console.warn('Redis queue initialization failed, falling back to direct evaluation', err.message);
  submissionQueue = {
    add: async (type, data) => {
      // Simulate queue behavior with direct processing
      const { submissionId } = data;
      try {
        await evaluateSubmission(submissionId);
      } catch (error) {
        console.error('Evaluation failed:', error);
        await Submission.findByIdAndUpdate(submissionId, { 
          status: 'failed',
          error: error.message
        });
      }
    }
  };
}

exports.createSubmission = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware
    const { taskId, type, content, language, roadmapId } = req.body;

    if (!taskId || !type || !content) {
      return res.status(400).json({ success: false, msg: 'taskId, type and content are required' });
    }

    // Resolve task by Mongo _id or by sourceTaskId (string ids from AI)
    let task = null;
    if (/^[0-9a-fA-F]{24}$/.test(taskId)) {
      task = await Task.findById(taskId);
    }
    if (!task) {
      task = await Task.findOne({ sourceTaskId: taskId });
    }
    if (!task) return res.status(404).json({ success: false, msg: 'Task not found' });

    // Save submission
    const submission = await Submission.create({
      user: userId,
      task: task._id,
      roadmap: roadmapId,
      type,
      content,
      language
    });

    // Ensure TaskProgress exists or update
    let progress = await TaskProgress.findOne({ user: userId, task: task._id });
    if (!progress) {
      progress = await TaskProgress.create({ user: userId, task: task._id, status: 'in_progress', attempts: 0 });
    } else {
      progress.status = progress.status === 'completed' ? 'completed' : 'in_progress';
    }
    progress.lastSubmission = submission._id;
    await progress.save();

    // Enqueue evaluation job (send minimal payload)
    await submissionQueue.add('evaluate-submission', {
      submissionId: submission._id.toString()
    });

    return res.status(201).json({ success: true, submissionId: submission._id, status: submission.status });
  } catch (err) {
    console.error('createSubmission error', err);
    return res.status(500).json({ success: false, msg: err.message || 'Server error' });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id).lean();
    if (!submission) return res.status(404).json({ success: false, msg: 'Submission not found' });

    const Evaluation = require('../models/Evaluation');
    const evaluation = await Evaluation.findOne({ submission: submission._id }).lean();

    return res.status(200).json({ success: true, submission, evaluation });
  } catch (err) {
    console.error('getSubmission error', err);
    return res.status(500).json({ success: false, msg: err.message || 'Server error' });
  }
};
