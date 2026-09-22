import React, { useState } from 'react';
import { X, Code, HelpCircle, BookOpen, Brain, Search, FolderGit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import '../../styles/Dashboard.css';

const TaskSubmitModal = ({ task, onClose, onSubmitted }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [answers, setAnswers] = useState('');
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');
  const { addToast } = useToast();

  const category = (task.category || 'code').toLowerCase();

  const submit = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/submission`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            category === 'quiz'
              ? { taskId: task._id, type: 'text', content: { answers }, language: 'text' }
              : category === 'reading' || category === 'learning' || category === 'research'
              ? { taskId: task._id, type: 'text', content: { reflection }, language: 'text' }
              : { taskId: task._id, type: 'code', content: { code }, language }
          ),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Failed to submit');
      }
      const data = await res.json();
      addToast({ type: 'success', message: 'Submission received. Evaluating…' });
      onSubmitted && onSubmitted({ submissionId: data.submissionId, taskId: task._id });
      onClose();
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const categoryIcons = {
    code: <Code className="w-4 h-4" />,
    quiz: <HelpCircle className="w-4 h-4" />,
    project: <FolderGit2 className="w-4 h-4" />,
    reading: <BookOpen className="w-4 h-4" />,
    learning: <Brain className="w-4 h-4" />,
    research: <Search className="w-4 h-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800/90 border border-gray-700 rounded-xl shadow-xl w-full max-w-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="submit-modal-title" className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            Submit Task
            {category && (
              <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#8C49E9]/20 text-[#8C49E9] flex items-center gap-1">
                {categoryIcons[category] || <HelpCircle className="w-4 h-4" />}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            )}
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
            aria-label="Close submit modal"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <div className="space-y-4">
          {(category === 'code' || category === 'project' || !category) && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="language-select">
                  Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-600 rounded-lg p-2 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
                  aria-label="Select programming language"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="code-input">
                  Code
                </label>
                <textarea
                  id="code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={10}
                  className="w-full border border-gray-600 rounded-lg p-2 bg-gray-900 text-gray-100 font-mono text-sm focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
                  placeholder="Paste your solution here..."
                  aria-label="Enter your code solution"
                />
              </div>
            </>
          )}
          {category === 'quiz' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1" htmlFor="answers-input">
                Answers
              </label>
              <textarea
                id="answers-input"
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                rows={8}
                className="w-full border border-gray-600 rounded-lg p-2 bg-gray-900 text-gray-100 text-sm focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
                placeholder="Provide your answers (e.g., Q1: ..., Q2: ...)."
                aria-label="Enter your quiz answers"
              />
            </div>
          )}
          {(category === 'reading' || category === 'learning' || category === 'research') && (
            <div>
              <label className="block text-sm text-gray-400 mb-1" htmlFor="reflection-input">
                Reflection
              </label>
              <textarea
                id="reflection-input"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={8}
                className="w-full border border-gray-600 rounded-lg p-2 bg-gray-900 text-gray-100 text-sm focus:ring-2 focus:ring-[#8C49E9] focus:outline-none"
                placeholder="Summarize key points and personal reflection."
                aria-label="Enter your reflection"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700/50 text-gray-100 border border-gray-600 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
              aria-label="Cancel submission"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={submitting}
              onClick={submit}
              className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
                submitting
                  ? 'bg-[#8C49E9]/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#8C49E9] to-[#4AC1FF] hover:bg-[#8C49E9]'
              } focus:outline-none focus:ring-2 focus:ring-[#8C49E9]`}
              aria-label={submitting ? 'Submitting task' : 'Submit task'}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskSubmitModal;