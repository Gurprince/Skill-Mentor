const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Judge0 API configuration
const JUDGE0_API = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';
const SUBMISSION_TIMEOUT = 10000; // 10 seconds

// Language mapping (Judge0 language IDs)
const LANGUAGE_IDS = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'cpp': 54,
  'c': 50,
  'csharp': 51,
  'php': 68,
  'ruby': 72,
  'swift': 83,
  'go': 60,
  'rust': 73,
  'typescript': 74,
  'kotlin': 78
};

/**
 * Execute code using Judge0
 * @param {string} sourceCode - The source code to execute
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test cases
 * @returns {Promise<Object>} - Test results
 */
async function executeCode(sourceCode, language, testCases = []) {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const submissionId = uuidv4();
  const results = [];
  let passed = 0;
  let failed = 0;

  // Execute each test case
  for (const [index, testCase] of testCases.entries()) {
    try {
      const payload = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: testCase.input || '',
        expected_output: testCase.expectedOutput || '',
        cpu_time_limit: 5, // seconds
        memory_limit: 128, // MB
        wait: true // Wait for execution to complete
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': JUDGE0_API_KEY
      };

      // Submit the code
      const submission = await axios.post(
        `${JUDGE0_API}/submissions?wait=true`,
        payload,
        { headers, timeout: SUBMISSION_TIMEOUT }
      );

      // Get the submission result
      const result = await axios.get(
        `${JUDGE0_API}/submissions/${submission.data.token}`,
        { headers, timeout: SUBMISSION_TIMEOUT }
      );

      const testResult = {
        testCaseId: testCase.id || `test-${index + 1}`,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.data.stdout || '',
        status: result.data.status,
        isPassed: result.data.status?.id === 3, // 3 means accepted in Judge0
        time: result.data.time,
        memory: result.data.memory,
        compileOutput: result.data.compile_output,
        stderr: result.data.stderr
      };

      if (testResult.isPassed) passed++;
      else failed++;

      results.push(testResult);
    } catch (error) {
      console.error(`Error executing test case ${index + 1}:`, error.message);
      results.push({
        testCaseId: `test-${index + 1}`,
        error: error.message,
        isPassed: false
      });
      failed++;
    }
  }

  return {
    submissionId,
    totalTests: testCases.length,
    passedTests: passed,
    failedTests: failed,
    results,
    score: testCases.length > 0 ? Math.round((passed / testCases.length) * 100) : 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format test results for the Gemini prompt
 * @param {Object} testResults - Test results from executeCode
 * @returns {string} - Formatted test results
 */
function formatTestResults(testResults) {
  if (!testResults || testResults.totalTests === 0) return 'No test cases provided';

  return `
TEST RESULTS SUMMARY:
- Total Tests: ${testResults.totalTests}
- Passed: ${testResults.passedTests}
- Failed: ${testResults.failedTests}
- Score: ${testResults.score}%

DETAILED RESULTS:
${testResults.results.map((test, i) => `
Test ${i + 1} (${test.testCaseId}): ${test.isPassed ? '✅ PASSED' : '❌ FAILED'}
Input: ${test.input || 'None'}
Expected: ${test.expectedOutput || 'No expected output'}
Actual: ${test.actualOutput || 'No output'}
${test.stderr ? `Error: ${test.stderr}\n` : ''}`).join('\n')}`;
}

module.exports = {
  executeCode,
  formatTestResults,
  LANGUAGE_IDS
};
