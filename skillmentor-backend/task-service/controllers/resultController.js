// task-service/controllers/resultController.js
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const TaskProgress = require('../models/TaskProgress');

/**
 * Get combined task result including task, submission, evaluation and progress
 * @route GET /api/task/:taskId/result
 * @param {string} taskId - The ID of the task
 * @returns {Object} Combined task result
 */
exports.getTaskResult = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Get task details
    let task = null;
    if (/^[0-9a-fA-F]{24}$/.test(taskId)) {
      task = await Task.findById(taskId).lean();
    }
    if (!task) {
      // fallback: lookup by sourceTaskId (string ids coming from AI)
      task = await Task.findOne({ sourceTaskId: taskId }).lean();
    }
    if (!task) {
      return res.status(404).json({ success: false, msg: 'Task not found' });
    }

    // Get latest submission for this task by user
    const submission = await Submission.findOne({ 
      user: userId, 
      task: taskId 
    }).sort({ createdAt: -1 }).lean();

    // If no submission exists, return basic task info
    if (!submission) {
      const progress = await TaskProgress.findOne({ user: userId, task: taskId }).lean() || 
        { status: 'unlocked', attempts: 0, xpEarned: 0 };
      
      return res.status(200).json({
        success: true,
        task,
        progress: {
          status: progress.status,
          attempts: progress.attempts,
          xpEarned: progress.xpEarned || 0
        },
        message: 'No submissions found for this task'
      });
    }

    // Get evaluation if exists
    let evaluation = null;
    try {
      evaluation = await Evaluation.findOne({ submission: submission._id }).lean();
      console.log('Found evaluation:', JSON.stringify(evaluation, null, 2));
    } catch (e) {
      console.error('Error fetching evaluation:', e);
    }
    
    // Get or create task progress
    let progress = await TaskProgress.findOne({ user: userId, task: taskId });
    if (!progress) {
      progress = await TaskProgress.create({
        user: userId,
        task: taskId,
        status: 'in_progress',
        attempts: 1,
        lastSubmission: submission._id
      });
    }

    // Prepare response
    const result = {
      success: true,
      task: {
        id: task._id,
        title: task.title || 'Untitled Task', 
        description: task.description,
        xp: task.xp,
        type: task.type,
        category: task.category || 'code'
      },
      submission: {
        id: submission._id,
        language: submission.language,
        code: submission.content?.code || '',
        status: submission.status,
        createdAt: submission.createdAt
      },
      progress: {
        status: progress.status,
        attempts: progress.attempts,
        xpEarned: progress.xpEarned >= 0 ? progress.xpEarned : 0 
      }
    };

    // Add evaluation if exists
    if (evaluation) {
      console.log('Processing evaluation with data:', JSON.stringify(evaluation, null, 2));
      
      // Determine pass/fail based on category-specific threshold
      const thresholds = { code: 80, quiz: 70, project: 75, reading: 70 };
      const passingScore = thresholds[result.task.category] ?? 80;
      const isPassed = evaluation.score >= passingScore;
      
      // Build the evaluation response based on the actual document structure
      const evaluationResponse = {
        score: evaluation.score || 0,
        isPassed: evaluation.isPassed !== undefined ? evaluation.isPassed : isPassed,
        grader: evaluation.grader || 'unknown',
        feedback: {},
        breakdown: evaluation.detail?.breakdown || evaluation.judges?.gemini?.breakdown || null,
        passingScore: passingScore 
      };
      
      // Update progress status based on evaluation if needed
      if (isPassed && progress.status !== 'completed') {
        progress.status = 'completed';
        progress.xpEarned = task.xp;  // Award full XP for passing
        await progress.save();
      } else if (!isPassed && progress.status === 'completed') {
        // If somehow marked as completed but score is below threshold, correct it
        progress.status = 'in_progress';
        progress.xpEarned = 0;  // No XP for failing
        await progress.save();
      }

      // Parse feedback if it's a string (JSON)
      try {
        if (evaluation.feedback && typeof evaluation.feedback === 'string') {
          evaluationResponse.feedback = JSON.parse(evaluation.feedback);
        } else if (evaluation.feedback) {
          evaluationResponse.feedback = evaluation.feedback;
        }
      } catch (e) {
        console.error('Error parsing feedback:', e);
        evaluationResponse.feedback = {
          error: 'Failed to parse feedback',
          rawFeedback: evaluation.feedback
        };
      }

      // Add test results if available
      if (evaluation.passedTests !== undefined && evaluation.totalTests !== undefined) {
        evaluationResponse.testResults = {
          passed: evaluation.passedTests,
          total: evaluation.totalTests,
          status: evaluation.passedTests >= evaluation.totalTests ? 'passed' : 'failed'
        };
      }

      // Add Judge0 execution details if available
      if (evaluation.judges?.judge0) {
        evaluationResponse.execution = {
          passedTests: evaluation.judges.judge0.passedTests,
          totalTests: evaluation.judges.judge0.totalTests,
          stdout: evaluation.judges.judge0.stdout,
          stderr: evaluation.judges.judge0.stderr,
          executionTime: evaluation.judges.judge0.executionTime,
          status: evaluation.judges.judge0.status
        };
      }

      // Include badge if this is a mini project task
      if (task.type === 'miniProject' && task.badge) {
        result.task.badge = task.badge;
      }

      result.evaluation = evaluationResponse;
      
      // Log the final evaluation response for debugging
      console.log('Sending evaluation response:', JSON.stringify(evaluationResponse, null, 2));
    } else {
      console.log('No evaluation found for submission:', submission._id);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('getTaskResult error', err);
    return res.status(500).json({ success: false, msg: err.message || 'Server error' });
  }
};

/**
 * Get all results for the authenticated user
 * @route GET /api/user/results
 * @returns {Array} List of task results with progress and latest evaluation
 */
exports.getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all task progress for the user with populated task details
    const progressList = await TaskProgress.find({ user: userId })
      .populate('task', 'title description xp type badge sourceTaskId')
      .sort({ updatedAt: -1 });

    // Get all submissions for the user with their evaluations
    const results = await Promise.all(progressList.map(async (progress) => {
      // Skip entries with missing task (e.g., after deletions)
      if (!progress.task) {
        return null;
      }
      // Get all submissions for this task, sorted by creation date (newest first)
      const submissions = await Submission.find(
        { user: userId, task: progress.task._id },
        'status language createdAt'
      ).sort({ createdAt: -1 });

      // Get the latest submission (if any)
      const latestSubmission = submissions[0] || null;
      
      // Get evaluation for the latest submission (if exists)
      let evaluation = null;
      if (latestSubmission) {
        evaluation = await Evaluation.findOne(
          { submission: latestSubmission._id }
        );
      }

      // Calculate XP earned (standardized to be proportional to task XP)
      const maxXp = (progress.task && typeof progress.task.xp === 'number') ? progress.task.xp : 100;
      const xpEarned = evaluation ? Math.round((evaluation.score / 100) * maxXp) : 0;

      // Prepare evaluation details if available
      const evaluationDetails = evaluation ? {
        score: evaluation.score,
        isPassed: evaluation.isPassed,
        breakdown: evaluation.judges?.gemini?.breakdown || {
          correctness: evaluation.score,
          code_quality: evaluation.judges?.gemini?.score || 0,
          completeness: evaluation.score
        },
        feedback: {
          summary: evaluation.judges?.gemini?.feedback?.summary || '',
          strengths: evaluation.judges?.gemini?.feedback?.strengths || [],
          areasForImprovement: evaluation.judges?.gemini?.feedback?.areasForImprovement || []
        },
        execution: evaluation.judges?.judge0 ? {
          passedTests: evaluation.judges.judge0.passedTests,
          totalTests: evaluation.judges.judge0.totalTests,
          output: evaluation.judges.judge0.output,
          error: evaluation.judges.judge0.error
        } : null
      } : null;

      // Prepare submission history
      const submissionHistory = await Promise.all(submissions.map(async (sub) => {
        const subEval = await Evaluation.findOne({ submission: sub._id });
        return {
          submissionId: sub._id,
          score: subEval?.score || 0,
          submittedAt: sub.createdAt,
          language: sub.language,
          status: sub.status
        };
      }));

      return {
        task: {
          id: progress.task._id,
          title: progress.task.title,
          description: progress.task.description,
          xp: maxXp,
          type: progress.task.type,
          badge: progress.task.badge || null,
          sourceId: progress.task.sourceTaskId || null
        },
        progress: {
          status: progress.status,
          attempts: progress.attempts,
          xpEarned: xpEarned,
          lastUpdated: progress.updatedAt,
          // Include history of all submissions
          history: submissionHistory
        },
        latestSubmission: latestSubmission ? {
          id: latestSubmission._id,
          status: latestSubmission.status,
          language: latestSubmission.language,
          submittedAt: latestSubmission.createdAt
        } : null,
        latestEvaluation: evaluationDetails
      };
    }));

    return res.status(200).json({ success: true, results: results.filter(Boolean) });
  } catch (err) {
    console.error('getUserResults error', err);
    return res.status(500).json({ success: false, msg: err.message || 'Server error' });
  }
};
