import React, { useEffect, useState } from 'react';
import { X, Code, HelpCircle, FolderGit2, BookOpen, Brain, Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Dashboard.css';

const TaskViewModal = ({ task, onClose }) => {
  console.log('TaskViewModal task prop:', task); // Debug log
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/task/${task._id}/result`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setResult(data);
      } catch (e) {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [task?._id, token]);

  const fb = result?.evaluation?.feedback || {};
  const strengths = fb.strengths || fb.Strengths || [];
  const areas = fb.areasForImprovement || fb.areas_for_improvement || [];
  const codeExamples = fb.codeExamples || fb.code_examples || [];
  const nextSteps = result?.evaluation?.next_steps || fb.nextSteps || [];
  const resources = result?.evaluation?.resources || fb.resources || [];
  
  // Get the category from the most reliable source first
  const category = (() => {
    const cat = (result?.task?.category || task?.category || 'code')?.toLowerCase();
    // Ensure it matches one of our known categories, default to 'code' if not
    const validCategories = ['code', 'quiz', 'project', 'reading', 'learning', 'research'];
    return validCategories.includes(cat) ? cat : 'code';
  })();
  
  console.log('Task category:', category); // Debug log

  const categoryIcons = {
    code: <Code className="w-4 h-4" />,
    quiz: <HelpCircle className="w-4 h-4" />,
    project: <FolderGit2 className="w-4 h-4" />,
    reading: <BookOpen className="w-4 h-4" />,
    learning: <Brain className="w-4 h-4" />,
    research: <Search className="w-4 h-4" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, duration: 0.3 }}
        className="relative w-full max-w-4xl bg-gray-800/95 border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] mx-auto my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-700 flex items-center justify-between">
          <h3 id="task-modal-title" className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            Task Details
            {category && (
              <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#8C49E9]/20 text-[#8C49E9] flex items-center gap-1">
                {categoryIcons[category] || <HelpCircle className="w-4 h-4" />}
                {category}
              </span>
            )}
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-gray-300" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
          <div>
            <p className="text-sm text-gray-400 mb-1">Title</p>
            <p className="font-medium text-gray-100">{task?.title || 'Untitled Task'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{task?.description || 'No description provided'}</p>
          </div>
          {task?.resources && Array.isArray(task.resources) && task.resources.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Resources</p>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {task.resources.map((res, i) => (
                  <li key={i}>
                    <a
                      href={res}
                      className="text-[#4AC1FF] hover:underline focus:outline-none focus:ring-2 focus:ring-[#4AC1FF]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {res}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-400 mb-2">Latest Evaluation</p>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-400"
                aria-busy="true"
              >
                <div className="w-5 h-5 border-2 border-[#8C49E9] border-t-transparent rounded-full animate-spin" />
                <p>Loading evaluation...</p>
              </motion.div>
            ) : result?.evaluation ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-700 rounded-lg p-4 bg-gray-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-100">
                    Score: {result.evaluation.score}%{' '}
                    <span className="text-xs text-gray-400">
                      (Pass ≥ {result.evaluation.passingScore}%)
                    </span>
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      result.evaluation.isPassed
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {result.evaluation.isPassed ? 'Passed' : 'Needs Work'}
                  </span>
                </div>
                {result.evaluation.feedback?.summary && (
                  <p className="text-sm text-gray-300 mb-3">{result.evaluation.feedback.summary}</p>
                )}
                {result.evaluation.breakdown && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    {Object.entries(result.evaluation.breakdown).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between bg-gray-800/50 rounded border border-gray-600 px-2 py-1"
                      >
                        <span className="capitalize text-gray-400">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-100">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {category === 'code' && result.evaluation.testResults && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-100 mb-1">Test Results</p>
                    <p className="text-sm text-gray-300">
                      {result.evaluation.testResults.passed}/{result.evaluation.testResults.total} passed (
                      {result.evaluation.testResults.status})
                    </p>
                  </div>
                )}
                {category === 'code' && result.evaluation.execution && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-100 mb-1">Execution</p>
                    {result.evaluation.execution.stdout && (
                      <pre className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-100 overflow-auto">
                        {result.evaluation.execution.stdout}
                      </pre>
                    )}
                    {result.evaluation.execution.stderr && (
                      <pre className="bg-red-900/50 border border-red-700 rounded p-2 text-xs text-red-300 overflow-auto">
                        {result.evaluation.execution.stderr}
                      </pre>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Time: {result.evaluation.execution.executionTime} • Status:{' '}
                      {result.evaluation.execution.status}
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {category !== 'quiz' && (strengths.length > 0 || areas.length > 0 || codeExamples.length > 0) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {strengths.length > 0 && (
                        <div className="bg-gray-800/50 rounded border border-gray-600 p-3">
                          <p className="font-medium text-gray-100 mb-1">Strengths</p>
                          <ul className="list-disc ml-4 text-gray-300 space-y-1">
                            {strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {areas.length > 0 && (
                        <div className="bg-gray-800/50 rounded border border-gray-600 p-3">
                          <p className="font-medium text-gray-100 mb-1">Areas for Improvement</p>
                          <ul className="list-disc ml-4 text-gray-300 space-y-1">
                            {areas.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {codeExamples.length > 0 && (
                        <div className="bg-gray-800/50 rounded border border-gray-600 p-3">
                          <p className="font-medium text-gray-100 mb-1">Code Examples</p>
                          <div className="space-y-2">
                            {codeExamples.map((ex, i) => (
                              <pre
                                key={i}
                                className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-100 overflow-auto"
                              >
                                {ex}
                              </pre>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {(nextSteps.length > 0 || (Array.isArray(resources) && resources.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {category !== 'quiz' && nextSteps.length > 0 && (
                        <div className="bg-gray-800/50 rounded border border-gray-600 p-3">
                          <p className="font-medium text-gray-100 mb-1">Next Steps</p>
                          <ul className="list-disc ml-4 text-gray-300 space-y-1">
                            {nextSteps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(resources) && resources.length > 0 && (
                        <div className="bg-gray-800/50 rounded border border-gray-600 p-3">
                          <p className="font-medium text-gray-100 mb-1">Resources</p>
                          <ul className="space-y-2">
                            {resources.map((r, i) => (
                              <li key={i} className="flex items-start gap-2">
                                {r.type === 'document' ? (
                                  <BookOpen className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                ) : r.type === 'code' ? (
                                  <Code className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <Search className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                )}
                                {r.url ? (
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 hover:underline break-all"
                                  >
                                    {r.title || r.url}
                                  </a>
                                ) : (
                                  <span className="text-gray-300">{r.title}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-gray-400">No evaluation yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskViewModal;