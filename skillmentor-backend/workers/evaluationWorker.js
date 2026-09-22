// workers/evaluationWorker.js
require('dotenv').config();
const mongoose = require('mongoose');
const submissionQueue = require('../queues/submissionQueue');
const path = require('path');
const Submission = require('../task-service/models/Submission');
const Evaluation = require('../task-service/models/Evaluation');
const Task = require('../task-service/models/Task');
const TaskProgress = require('../task-service/models/TaskProgress');
const User = require('../user-service/models/UserProfile');
const { evaluateWithGemini, executeTests } = require('../services/evaluationService');

// Database connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB connected successfully');
      return true;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) {
        console.error('Max retries reached. Could not connect to MongoDB.');
        return false;
      }
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize connection
connectDB().then(connected => {
  if (!connected) {
    console.error('Failed to connect to MongoDB. Worker will not start.');
    process.exit(1);
  }
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Process job
submissionQueue.process('evaluate-submission', async (job, done) => {
  const { submissionId } = job.data;
  console.log(`Worker: processing submission ${submissionId}`);

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    // mark running
    submission.status = 'running';
    await submission.save();

    const task = await Task.findById(submission.task);
    if (!task) throw new Error('Task not found');

    // Execute test cases if this is a code submission
    let testResults = null;
    if (submission.type === 'code') {
      try {
        testResults = await executeTests(submission, task);
        console.log(`Test execution completed: ${testResults.passedTests}/${testResults.totalTests} tests passed`);
      } catch (error) {
        console.error('Error executing tests:', error);
        testResults = {
          error: error.message,
          results: [],
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          score: 0
        };
      }
    }

    try {
      // Call Gemini evaluation with test results and normalize result
      const evalResult = await evaluateWithGemini(task, submission, testResults);
      
      // Process the evaluation result
      const score = typeof evalResult.score === 'number' 
        ? Math.min(100, Math.max(0, Math.round(evalResult.score)))
        : 0;
        
      // Ensure breakdown has all required fields with default values
      const breakdown = {
        correctness: 0,
        code_quality: 0,
        completeness: 0,
        error_handling: 0,
        documentation: 0,
        ...(evalResult.breakdown || {})
      };
      
      // Ensure feedback structure is complete
      const feedback = {
        summary: '',
        strengths: [],
        areas_for_improvement: [],
        code_examples: [],
        ...(typeof evalResult.feedback === 'string' 
          ? { summary: evalResult.feedback }
          : evalResult.feedback || {})
      };
      
      // Ensure next_steps and resources are arrays
      const nextSteps = Array.isArray(evalResult.next_steps) ? evalResult.next_steps : [];
      const resources = Array.isArray(evalResult.resources) ? evalResult.resources : [];

      // Create evaluation document with detailed feedback
      let evaluationDoc;
      try {
        evaluationDoc = await Evaluation.create({
          submission: submission._id,
          grader: 'gemini',
          score,
          passedTests: testResults?.passedTests || 0,
          totalTests: testResults?.totalTests || 0,
          feedback: JSON.stringify({
            summary: feedback.summary,
            strengths: feedback.strengths,
            areasForImprovement: feedback.areas_for_improvement,
            codeExamples: feedback.code_examples,
            nextSteps,
            resources
          }),
          detail: {
            breakdown,
            criteriaScores: Object.entries(breakdown).map(([key, value]) => ({
              criterion: key,
              score: Math.min(100, Math.max(0, Math.round(value)))
            })),
            timestamp: new Date().toISOString()
          },
          createdAt: new Date()
        });
        
        console.log(`Evaluation created: ${evaluationDoc._id} for submission ${submission._id}`);
      } catch (evalErr) {
        console.error('Error creating evaluation:', evalErr);
        throw new Error(`Failed to save evaluation: ${evalErr.message}`);
      }

      // Update submission with evaluation results
      submission.status = 'evaluated';
      submission.score = score;
      submission.feedback = feedback;
      submission.evaluation = evaluationDoc._id; // Reference to the evaluation document
      submission.evaluatedAt = new Date();
      await submission.save();

      // Update TaskProgress and user xp/badges
      let progress = await TaskProgress.findOne({ user: submission.user, task: submission.task });
      if (!progress) {
        progress = await TaskProgress.create({ user: submission.user, task: submission.task, status: 'in_progress' });
      }

      progress.attempts = (progress.attempts || 0) + 1;
      progress.lastSubmission = submission._id;

      // Award xp if score passes threshold
      const passThreshold = 65;
      if (score >= passThreshold && progress.status !== 'completed') {
        progress.status = 'completed';
        const xpToAward = Math.round((score / 100) * (task.xp || 50));
        progress.xpEarned = (progress.xpEarned || 0) + xpToAward;

        // Update user's xp
        try {
          const userProfile = await User.findOne({ user: submission.user });
          if (userProfile) {
            userProfile.xp = (userProfile.xp || 0) + xpToAward;
            await userProfile.save();
            // TODO: emit socket event for xp update
          }
        } catch (uerr) {
          console.warn('User xp update error', uerr.message);
        }
      }

      await progress.save();

      // TODO: Notify frontend via Socket.IO or push (emit event)
      console.log(`Evaluation saved for submission ${submissionId}, score ${score}`);
      done(null, { evaluationId: evaluationDoc._id });
    } catch (evalErr) {
      console.error('Evaluation failed:', evalErr.message || evalErr);
      submission.status = 'failed';
      await submission.save();
      done(evalErr);
    }
  } catch (err) {
    console.error('Worker error', err);
    done(err);
  }
});
