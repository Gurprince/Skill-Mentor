// services/evaluationService.js
const axios = require('axios');
const { executeCode, formatTestResults } = require('./judge0Service');
const Submission = require('../task-service/models/Submission');
const Evaluation = require('../task-service/models/Evaluation');
const TaskProgress = require('../task-service/models/TaskProgress');
const Task = require('../task-service/models/Task');

const MAX_RETRIES = 3;
const PASSING_SCORE_DEFAULT = 80; // Fallback
const PASSING_SCORE_BY_CATEGORY = {
  code: 80,
  quiz: 70,
  project: 75,
  reading: 70,
  learning: 70,
  research: 70
};

/**
 * Execute test cases for the submission if it's a code submission
 * @param {Object} submission - The submission object
 * @param {Object} task - The task object
 * @returns {Promise<Object>} - Test results
 */
async function executeTests(submission, task) {
  if (task.category !== 'code') {
    return null; // Only code tasks run Judge0 tests
  }
  if (submission.type !== 'code' || !task.testCases || !task.testCases.length) {
    return null;
  }

  try {
    const sourceCode = submission.content.code || '';
    const language = submission.language || 'javascript';
    
    const testResults = await executeCode(
      sourceCode,
      language,
      task.testCases.map((test, index) => ({
        id: `test-${index + 1}`,
        input: test.input,
        expectedOutput: test.expectedOutput
      }))
    );

    return testResults;
  } catch (error) {
    console.error('Error executing tests:', error);
    return {
      error: error.message,
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      score: 0
    };
  }
}

function cleanModelOutput(text) {
  if (!text) return '';
  // Remove triple backticks and leading/trailing whitespace
  return text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
}

/**
 * Build prompt for Gemini to evaluate a submission with detailed rubric
 */
function buildEvaluationPrompt(task, submission, testResults = null) {
  // Default criteria if none provided
  const defaultCriteria = [
    { key: 'correctness', description: 'Code works as intended and produces correct output', weight: 40 },
    { key: 'code_quality', description: 'Code is well-structured, readable, and follows best practices', weight: 25 },
    { key: 'completeness', description: 'All required functionality is implemented', weight: 20 },
    { key: 'error_handling', description: 'Proper error handling and edge cases considered', weight: 10 },
    { key: 'documentation', description: 'Code is properly documented with comments and docstrings', weight: 5 }
  ];

  // Allow category-specific default criteria
  const categoryCriteria = {
    quiz: [
      { key: 'correctness', description: 'Answers match expected solutions', weight: 80 },
      { key: 'explanations', description: 'Quality of explanations for answers', weight: 20 }
    ],
    project: [
      { key: 'completeness', description: 'Meets all requirements', weight: 35 },
      { key: 'code_quality', description: 'Structure, readability, best practices', weight: 25 },
      { key: 'correctness', description: 'Works correctly and handles edge cases', weight: 25 },
      { key: 'documentation', description: 'README, comments, setup', weight: 15 }
    ],
    reading: [
      { key: 'reflection', description: 'Reflective understanding of material', weight: 50 },
      { key: 'application', description: 'Ability to apply concepts', weight: 30 },
      { key: 'communication', description: 'Clarity and organization', weight: 20 }
    ],
    learning: [
      { key: 'comprehension', description: 'Demonstrates understanding of new material', weight: 50 },
      { key: 'application', description: 'Applies learned concepts in examples/explanations', weight: 30 },
      { key: 'communication', description: 'Clear and structured summary/notes', weight: 20 }
    ],
    research: [
      { key: 'depth', description: 'Depth and breadth of research', weight: 40 },
      { key: 'analysis', description: 'Critical analysis and comparison', weight: 40 },
      { key: 'presentation', description: 'Clarity and structure of findings', weight: 20 }
    ]
  };

  const criteria = task.evaluationCriteria?.length
    ? task.evaluationCriteria
    : (categoryCriteria[task.category] || defaultCriteria);
  
  const criteriaText = criteria.map(c => `- ${c.key.toUpperCase()} (${c.weight}%): ${c.description}`).join('\n');
  const submissionPreview = typeof submission.content === 'string' 
    ? submission.content 
    : JSON.stringify(submission.content).slice(0, 2000);

  // Format test results if available
  const testsText = testResults ? formatTestResults(testResults) : '';

  return `
You are an expert code reviewer evaluating a programming assignment. Provide detailed, constructive feedback.

TASK:
Title: ${task.title}
Description: ${task.description}

EVALUATION RUBRIC:
${criteriaText}

TASK CATEGORY: ${task.category}

SUBMISSION (${submission.language || 'code'}):
${submissionPreview}
${testsText}

YOUR TASK:
1. Analyze the submission against each criterion
2. Provide specific, actionable feedback
3. Score each criterion (0-100) based on the rubric
4. Calculate an overall score (weighted average)

RESPONSE FORMAT (strict JSON only):
{
  "score": 0-100,  // Weighted average of all criteria
  "breakdown": ${JSON.stringify(criteria.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {}))},
  "feedback": {
    "summary": "Overall assessment of the submission",
    "strengths": ["List specific strengths of the submission"],
    "areas_for_improvement": ["Specific, actionable areas that need improvement"],
    "code_examples": ["Code snippets showing suggested improvements or alternatives"]
  },
  "next_steps": [
    "Concrete, specific actions the student should take to improve",
    "Each step should be clear and immediately actionable"
  ],
  "resources": [
    {"title": "Relevant documentation or resource name", "url": "https://example.com"},
    {"title": "Another helpful resource", "url": "https://example.com/another"}
  ]
}

IMPORTANT:
- Be specific and reference exact lines of code when possible
- Provide concrete examples for improvements
- Balance positive feedback with constructive criticism
- Suggest relevant learning resources
- Return ONLY valid JSON with no additional text
`.trim();
}

/**
 * Call Gemini (Generative Language API) to evaluate and parse JSON result.
 * Uses the same API pattern you used for roadmap generation but tailored for evaluation.
 */
async function evaluateWithGemini(task, submission, testSummary = null) {
  const prompt = buildEvaluationPrompt(task, submission, testSummary);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleaned = cleanModelOutput(raw);
      // ensure cleaned is valid JSON
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      // If parse error or API error, retry
      if (attempt < MAX_RETRIES) {
        console.warn(`Gemini eval attempt ${attempt} failed, retrying...`, err.message);
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }
      console.error('Gemini eval final error:', err.message || err);
      throw err;
    }
  }
}

/**
 * Evaluate a submission using both Judge0 and Gemini
 * @param {string} submissionId - The ID of the submission to evaluate
 * @returns {Promise<Object>} - Evaluation results
 */
async function evaluateSubmission(submissionId) {
  try {
    // Get submission and task
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Support fallback by sourceTaskId if the stored reference is not an ObjectId
    let task = null;
    try {
      task = await Task.findById(submission.task);
    } catch {}
    if (!task) {
      task = await Task.findOne({ _id: submission.task }).catch(() => null);
    }
    if (!task && typeof submission.task === 'string') {
      task = await Task.findOne({ sourceTaskId: submission.task }).catch(() => null);
    }
    if (!task) {
      throw new Error('Task not found');
    }

    // Initialize evaluation object
    const evaluationData = {
      submission: submission._id,
      judges: {
        judge0: null,
        gemini: null
      },
      isPassed: false
    };

    // Execute tests with Judge0 if this is a code submission
    let judge0Results = null;
    if (submission.type === 'code') {
      try {
        judge0Results = await executeTests(submission, task);
        evaluationData.judges.judge0 = {
          passedTests: judge0Results.passedTests || 0,
          totalTests: judge0Results.totalTests || 0,
          stdout: judge0Results.stdout || '',
          stderr: judge0Results.stderr || '',
          executionTime: judge0Results.time || '0s',
          status: judge0Results.status || 'error'
        };
      } catch (error) {
        console.error('Judge0 evaluation failed:', error);
        evaluationData.judges.judge0 = {
          error: error.message,
          status: 'error'
        };
      }
    }

    // Get evaluation from Gemini
    try {
      const geminiResults = await evaluateWithGemini(task, submission, judge0Results);
      
      // Parse the feedback if it's a string (JSON)
      let feedback = geminiResults.feedback;
      if (typeof feedback === 'string') {
        try {
          feedback = JSON.parse(cleanModelOutput(feedback));
        } catch (e) {
          console.error('Failed to parse Gemini feedback:', e);
          feedback = { summary: feedback };
        }
      }

      evaluationData.judges.gemini = {
        score: geminiResults.score || 0,
        feedback: feedback || {}
      };

      // Set overall score based on Gemini's evaluation
      evaluationData.score = geminiResults.score || 0;
      
      // Check if the submission passed (either all Judge0 tests passed or Gemini score is high enough)
      const judge0Passed = !evaluationData.judges.judge0 || 
                          evaluationData.judges.judge0.passedTests >= evaluationData.judges.judge0.totalTests;
      const passingThreshold = PASSING_SCORE_BY_CATEGORY[task.category] ?? PASSING_SCORE_DEFAULT;
      const geminiPassed = evaluationData.score >= passingThreshold;
      
      evaluationData.isPassed = judge0Passed && geminiPassed;
      
      // Update task progress if this is a passing submission
      if (evaluationData.isPassed) {
        await updateTaskProgress(submission.user, submission.task, submission._id, true);
      } else {
        await updateTaskProgress(submission.user, submission.task, submission._id, false);
      }
    } catch (error) {
      console.error('Gemini evaluation failed:', error);
      evaluationData.judges.gemini = {
        error: error.message,
        status: 'error'
      };
    }

    // Save the evaluation
    const evaluation = await Evaluation.findOneAndUpdate(
      { submission: submissionId },
      evaluationData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Update submission status
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'evaluated',
      score: evaluation.score,
      evaluatedAt: new Date()
    });

    return evaluation;
  } catch (error) {
    console.error('Error in evaluateSubmission:', error);
    
    // Update submission status to failed
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'failed',
      error: error.message
    });

    throw error;
  }
}

/**
 * Update task progress based on evaluation results
 * @param {string} userId - The ID of the user
 * @param {string} taskId - The ID of the task
 * @param {string} submissionId - The ID of the submission
 * @param {boolean} isPassed - Whether the submission passed
 */
async function updateTaskProgress(userId, taskId, submissionId, isPassed) {
  const task = await Task.findById(taskId);
  if (!task) return;

  // Find or create task progress
  let progress = await TaskProgress.findOne({ user: userId, task: taskId });
  if (!progress) {
    progress = new TaskProgress({
      user: userId,
      task: taskId,
      status: 'in_progress',
      attempts: 0,
      lastSubmission: submissionId
    });
  }

  // Update progress
  progress.attempts += 1;
  progress.lastSubmission = submissionId;
  
  if (isPassed) {
    progress.status = 'completed';
    progress.xpEarned = task.xp || 0;
  } else if (progress.status !== 'completed') {
    progress.status = 'in_progress';
  }

  await progress.save();
  return progress;
}

module.exports = { 
  evaluateWithGemini, 
  buildEvaluationPrompt, 
  evaluateSubmission,
  executeTests
};
