import React, { useMemo, useState } from "react";
import { CheckCircle, RefreshCw, AlertCircle, BookOpen, Target, Bookmark, Award, Clock, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import TaskSubmitModal from "./TaskSubmitModal";
import TaskViewModal from "./TaskViewModal";
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const Roadmap = ({ roadmap, loading, error, onRetry, onTaskSubmitted, preview = false }) => {
  const [expandedPhases, setExpandedPhases] = useState([0]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [submitTask, setSubmitTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const unlockedPhases = useMemo(() => new Set((roadmap?.phases || []).map((p, i) => (p.isUnlocked ? i : -1)).filter(i => i >= 0)), [roadmap]);

  // Track completed tasks based on dashboard results
  React.useEffect(() => {
    const handler = (e) => {
      const { results } = e.detail || {};
      if (!results) return;
      const completedMap = {};
      (roadmap?.phases || []).forEach((phase, pIdx) => {
        const set = new Set();
        (phase.tasks || []).forEach((task, tIdx) => {
          const match = results.find(r => r.task?.id === task._id || r.task?.sourceId === task._id || r.task?.id === task.sourceTaskId);
          if (match && (match.latestEvaluation?.score >= 80 || match.progress?.status === 'completed')) {
            set.add(tIdx);
          }
        });
        if (set.size) completedMap[pIdx] = set;
      });
      setCompletedTasks(completedMap);
    };
    window.addEventListener('results-updated', handler);
    return () => window.removeEventListener('results-updated', handler);
  }, [roadmap]);

  // Listen for global open-task-view events
  React.useEffect(() => {
    const handler = (e) => {
      console.log('open-task-view event received:', e);
      const { task } = e.detail || {};
      console.log('Task data from event:', task);
      if (task) {
        console.log('Setting viewTask with task:', task);
        setViewTask({ task });
      } else {
        console.warn('No task data found in event');
      }
    };
    window.addEventListener('open-task-view', handler);
    return () => window.removeEventListener('open-task-view', handler);
  }, []);

  const togglePhase = (index) => {
    setExpandedPhases((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleTaskComplete = (phaseIndex, taskIndex) => {
    setCompletedTasks((prev) => {
      const phaseTasks = new Set(prev[phaseIndex] || []);
      phaseTasks.has(taskIndex) ? phaseTasks.delete(taskIndex) : phaseTasks.add(taskIndex);
      return { ...prev, [phaseIndex]: phaseTasks };
    });
  };

  const getPhaseProgress = (phaseIndex, tasks) => {
    const completed = completedTasks[phaseIndex]?.size || 0;
    return tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[200px] bg-gray-800/90 rounded-xl border border-gray-700">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 border-4 border-t-[#8C49E9] border-r-[#4AC1FF] border-gray-600 rounded-full"
        />
        <p className="mt-4 text-gray-300 text-sm font-medium">Crafting your roadmap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 flex flex-col items-center text-center bg-gray-800/90 rounded-xl border border-red-500/50"
      >
        <motion.div
          animate={{ x: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 1 }}
        >
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        </motion.div>
        <h2 className="text-lg font-semibold text-red-300">Oops, something went wrong</h2>
        <p className="text-gray-400 mt-2 text-sm max-w-md">{error}</p>
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="mt-4 px-4 py-2 rounded-lg bg-red-500/80 text-white flex items-center gap-2 hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="Retry loading roadmap"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        )}
      </motion.div>
    );
  }

  if (!roadmap?.phases?.length) {
    return (
      <div className="p-8 flex flex-col items-center text-center bg-gray-800/90 rounded-xl border border-gray-700">
        <Target className="w-10 h-10 text-gray-400 mb-3" />
        <p className="text-gray-300 text-sm max-w-md">No roadmap phases found. Complete your profile or refresh to get started.</p>
      </div>
    );
  }

  const phasesToShow = preview
    ? (roadmap.phases || []).filter((p, i) => p.isUnlocked || unlockedPhases.has(i)).slice(0, 1)
    : roadmap.phases;
  const maxTasks = preview ? 3 : Infinity;

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        {!preview && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#8C49E9] to-[#4AC1FF] bg-clip-text text-transparent">
              Your Personalized Roadmap
            </h1>
            <p className="text-gray-300 text-sm mt-2">
              Career Path: <span className="font-semibold text-gray-100">{roadmap.careerPath}</span> | Level:{" "}
              <span className="font-semibold text-gray-100">{roadmap.currentLevel}</span>
            </p>
          </motion.div>
        )}
        <div className="space-y-6 relative">
          {!preview && <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-[#8C49E9] to-[#4AC1FF]"></div>}
          {phasesToShow.map((phase, index) => {
            const isExpanded = preview ? true : expandedPhases.includes(index);
            const progress = getPhaseProgress(index, phase.tasks || []);
            const isUnlocked = phase.isUnlocked || unlockedPhases.has(index);
            return (
              <motion.div
                key={phase._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
                role="region"
                aria-labelledby={`phase-${index}-title`}
              >
                {!preview && (
                  <motion.div
                    className="absolute left-2.5 top-6 w-4 h-4 rounded-full bg-[#8C49E9] ring-4 ring-gray-800"
                    whileHover={{ scale: 1.2, boxShadow: "0 0 8px rgba(140, 73, 233, 0.5)" }}
                  />
                )}
                <div
                  className={`ml-10 bg-gray-800/90 border border-gray-700 rounded-xl shadow-md transition-all duration-300 ${isUnlocked ? 'hover:shadow-lg hover:border-[#8C49E9]/50' : 'opacity-60'}`}
                >
                  <button
                    onClick={() => isUnlocked && !preview && togglePhase(index)}
                    className="w-full p-5 flex justify-between items-center text-left disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8C49E9] focus:ring-offset-2 focus:ring-offset-gray-800"
                    disabled={!isUnlocked || preview}
                    aria-expanded={isExpanded}
                    aria-controls={`phase-${index}-content`}
                    id={`phase-${index}-title`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <ListChecks className="w-6 h-6 text-[#8C49E9]" />
                        {isUnlocked && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-100">{phase.title}</h2>
                        <p className="text-gray-300 mt-1 text-sm line-clamp-2">{phase.description}</p>
                      </div>
                    </div>
                    {!preview && (
                      <div className="flex items-center gap-4">
                        {phase.totalDuration && (
                          <span className="flex items-center text-sm text-gray-300 bg-gray-700/50 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4 mr-1 text-[#4AC1FF]" />
                            {phase.totalDuration}
                          </span>
                        )}
                        <div className="relative w-10 h-10">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="3"
                            />
                            <motion.path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="url(#progressGradient)"
                              strokeWidth="3"
                              strokeDasharray={`${progress}, 100`}
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${progress}, 100` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                            <defs>
                              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8C49E9" />
                                <stop offset="100%" stopColor="#4AC1FF" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-100">
                            {progress}%
                          </span>
                        </div>
                        {isUnlocked && (
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className="text-gray-300"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </motion.span>
                        )}
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        id={`phase-${index}-content`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-6">
                          {preview ? (
                            // Preview mode: Show only tasks (up to 3)
                            phase.tasks?.length > 0 && (
                              <div>
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
                                  <ListChecks className="w-5 h-5 text-[#8C49E9]" /> Tasks
                                </h3>
                                <ul className="space-y-4">
                                  {phase.tasks.slice(0, maxTasks).map((task, taskIndex) => {
                                    const isCompleted = completedTasks[index]?.has(taskIndex) || false;
                                    return (
                                      <motion.li
                                        key={task._id || taskIndex}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={`p-4 rounded-xl border ${isCompleted ? 'border-green-500/30 bg-green-900/20 shadow-inner' : 'border-gray-600 bg-gray-700/50 shadow-sm'} hover:shadow-md hover:border-[#8C49E9]/50 transition-all duration-200`}
                                        role="listitem"
                                      >
                                        <div className="flex items-start gap-3">
                                          <motion.input
                                            type="checkbox"
                                            checked={isCompleted}
                                            onChange={() => toggleTaskComplete(index, taskIndex)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="mt-1 w-5 h-5 text-[#8C49E9] rounded border-gray-500 focus:ring-[#8C49E9] cursor-pointer"
                                            aria-label={`Mark task ${task.description} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                          />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                              <p className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                                                {task.description}
                                              </p>
                                              <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-[#8C49E9]/20 text-[#8C49E9]">
                                                {task.category || 'code'}
                                              </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mt-2">
                                              {task.timeline && (
                                                <span className="flex items-center">
                                                  <Clock className="w-4 h-4 mr-1 text-gray-400" /> {task.timeline}
                                                </span>
                                              )}
                                              {task.xp && (
                                                <span className="flex items-center">
                                                  <Award className="w-4 h-4 mr-1 text-yellow-500" /> {task.xp} XP
                                                </span>
                                              )}
                                            </div>
                                            {task.resources?.length > 0 && (
                                              <div className="mt-3">
                                                <p className="text-xs font-medium text-gray-300 mb-1">Resources:</p>
                                                <ul className="list-disc ml-4 text-[#4AC1FF] text-sm space-y-1">
                                                  {task.resources.map((res, j) => {
                                                    if (j % 2 === 0 && task.resources[j + 1]) {
                                                      return (
                                                        <li key={j}>
                                                          <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#4AC1FF]/80">
                                                            {task.resources[j + 1]}
                                                          </a>
                                                        </li>
                                                      );
                                                    } else if (j % 2 === 0) {
                                                      return (
                                                        <li key={j}>
                                                          <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#4AC1FF]/80">
                                                            Resource {Math.floor(j / 2) + 1}
                                                          </a>
                                                        </li>
                                                      );
                                                    }
                                                    return null;
                                                  })}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </motion.li>
                                    );
                                  })}
                                  {phase.tasks?.length > maxTasks && (
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-sm text-gray-400 mt-3"
                                    >
                                      ...and {phase.tasks.length - maxTasks} more tasks
                                    </motion.p>
                                  )}
                                {phase.tasks?.length > maxTasks && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-gray-400 mt-3"
                                  >
                                    ...and {phase.tasks.length - maxTasks} more tasks
                                  </motion.p>
                                )}
                                </ul>
                                {preview && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'roadmap' } }))}
                                    className="mt-4 px-4 py-2 rounded-lg bg-[#8C49E9]/80 text-white text-sm hover:bg-[#8C49E9] transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9] focus:ring-offset-2 focus:ring-offset-gray-800"
                                    aria-label="View full roadmap"
                                  >
                                    View Full Roadmap
                                  </motion.button>
                                )}
                              </div>
                            )
                          ) : (
                            // Full mode: Show all details
                            <>
                              {phase.prerequisites?.length > 0 && (
                                <div>
                                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
                                    <Bookmark className="w-5 h-5 text-[#4AC1FF]" /> Prerequisites
                                  </h3>
                                  <ul className="list-disc ml-5 text-gray-300 text-sm space-y-2">
                                    {phase.prerequisites.map((item, i) => (
                                      <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        {item}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {phase.learningOutcomes?.length > 0 && (
                                <div>
                                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
                                    <ListChecks className="w-5 h-5 text-green-500" /> Learning Outcomes
                                  </h3>
                                  <ul className="list-disc ml-5 text-gray-300 text-sm space-y-2">
                                    {phase.learningOutcomes.map((outcome, i) => (
                                      <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        {outcome}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {phase.skills?.length > 0 && (
                                <div>
                                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
                                    <BookOpen className="w-5 h-5 text-[#4AC1FF]" /> Skills Covered
                                  </h3>
                                  <ul className="list-disc ml-5 text-gray-300 text-sm space-y-2">
                                    {phase.skills.map((skill, i) => (
                                      <motion.li
                                        key={skill._id || i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <strong>{skill.name}</strong>
                                        {skill.subtopics?.length ? `: ${skill.subtopics.join(", ")}` : ""}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {phase.tasks?.length > 0 && (
                                <div>
                                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
                                    <ListChecks className="w-5 h-5 text-[#8C49E9]" /> Tasks
                                  </h3>
                                  <ul className="space-y-4">
                                    {phase.tasks.map((task, taskIndex) => {
                                      const isCompleted = completedTasks[index]?.has(taskIndex) || false;
                                      return (
                                        <motion.li
                                          key={task._id || taskIndex}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.3 }}
                                          className={`p-4 rounded-xl border ${isCompleted ? 'border-green-500/30 bg-green-900/20 shadow-inner' : 'border-gray-600 bg-gray-700/50 shadow-sm'} hover:shadow-md hover:border-[#8C49E9]/50 transition-all duration-200`}
                                          role="listitem"
                                        >
                                          <div className="flex items-start gap-3">
                                            <motion.input
                                              type="checkbox"
                                              checked={isCompleted}
                                              onChange={() => toggleTaskComplete(index, taskIndex)}
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              className="mt-1 w-5 h-5 text-[#8C49E9] rounded border-gray-500 focus:ring-[#8C49E9] cursor-pointer"
                                              aria-label={`Mark task ${task.description} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-3 flex-wrap">
                                                <p className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                                                  {task.description}
                                                </p>
                                                <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-[#8C49E9]/20 text-[#8C49E9]">
                                                  {task.category || 'code'}
                                                </span>
                                              </div>
                                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mt-2">
                                                {task.timeline && (
                                                  <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1 text-gray-400" /> {task.timeline}
                                                  </span>
                                                )}
                                                {task.xp && (
                                                  <span className="flex items-center">
                                                    <Award className="w-4 h-4 mr-1 text-yellow-500" /> {task.xp} XP
                                                  </span>
                                                )}
                                              </div>
                                              {task.resources?.length > 0 && (
                                                <div className="mt-3">
                                                  <p className="text-xs font-medium text-gray-300 mb-1">Resources:</p>
                                                  <ul className="list-disc ml-4 text-[#4AC1FF] text-sm space-y-1">
                                                    {task.resources.map((res, j) => {
                                                      if (j % 2 === 0 && task.resources[j + 1]) {
                                                        return (
                                                          <li key={j}>
                                                            <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#4AC1FF]/80">
                                                              {task.resources[j + 1]}
                                                            </a>
                                                          </li>
                                                        );
                                                      } else if (j % 2 === 0) {
                                                        return (
                                                          <li key={j}>
                                                            <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#4AC1FF]/80">
                                                              Resource {Math.floor(j / 2) + 1}
                                                            </a>
                                                          </li>
                                                        );
                                                      }
                                                      return null;
                                                    })}
                                                  </ul>
                                                </div>
                                              )}
                                              <div className="mt-3 flex flex-wrap gap-2">
                                                <motion.button
                                                  whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(74, 193, 255, 0.5)" }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={() => setViewTask({
                                                    task: {
                                                      ...task,
                                                      title: task.title || task.description,
                                                      description: task.detailedDescription || task.description,
                                                      resources: task.resources || [],
                                                      phase: phase.title,
                                                      category: task.category || 'code' // Ensure category is always set
                                                    }
                                                  })}
                                                  className="px-4 py-2 rounded-lg bg-[#4AC1FF]/80 text-white text-sm hover:bg-[#4AC1FF] transition focus:outline-none focus:ring-2 focus:ring-[#4AC1FF] focus:ring-offset-2 focus:ring-offset-gray-800"
                                                  aria-label={`View details for task ${task.description}`}
                                                >
                                                  View Task
                                                </motion.button>
                                                <motion.button
                                                  whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(140, 73, 233, 0.5)" }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={() => setSubmitTask({ task, phase })}
                                                  className="px-4 py-2 rounded-lg bg-[#8C49E9]/80 text-white text-sm hover:bg-[#8C49E9] transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9] focus:ring-offset-2 focus:ring-offset-gray-800"
                                                  aria-label={`Submit task ${task.description}`}
                                                >
                                                  Submit
                                                </motion.button>
                                              </div>
                                            </div>
                                          </div>
                                        </motion.li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                              {phase.miniProject && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-900/20 shadow-inner"
                                >
                                  <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-yellow-500" /> Mini Project
                                  </h3>
                                  <p className="text-gray-300 text-sm">{phase.miniProject.description}</p>
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-2">
                                    <span className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1 text-gray-400" /> {phase.miniProject.timeline}
                                    </span>
                                    <span className="flex items-center">
                                      <Award className="w-4 h-4 mr-1 text-yellow-500" /> {phase.miniProject.xp} XP
                                    </span>
                                    <span className="flex items-center">
                                      <Bookmark className="w-4 h-4 mr-1 text-[#8C49E9]" /> Badge: {phase.miniProject.badge}
                                    </span>
                                  </div>
                                  {phase.miniProject.submission && (
                                    <p className="mt-3 text-sm text-gray-300">
                                      <span className="font-medium">Submission:</span> {phase.miniProject.submission}
                                    </p>
                                  )}
                                  {phase.miniProject.resources?.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-xs font-medium text-gray-300 mb-1">Resources:</p>
                                      <ul className="list-disc ml-4 text-[#4AC1FF] text-sm space-y-1">
                                        {phase.miniProject.resources.map((res, i) => {
                                          if (i % 2 === 0 && phase.miniProject.resources[i + 1]) {
                                            return (
                                              <li key={i}>
                                                <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#4AC1FF]/80">
                                                  {phase.miniProject.resources[i + 1]}
                                                </a>
                                              </li>
                                            );
                                          } else if (i % 2 === 0) {
                                            return (
                                              <li key={i}>
                                                <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#4AC1FF]/80">
                                                  Resource {Math.floor(i / 2) + 1}
                                                </a>
                                              </li>
                                            );
                                          }
                                          return null;
                                        })}
                                      </ul>
                                    </div>
                                  )}
                                  {phase.miniProject.assessmentCriteria?.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-xs font-medium text-gray-300 mb-1">Assessment Criteria:</p>
                                      <ul className="list-disc ml-4 text-gray-300 text-sm space-y-1">
                                        {phase.miniProject.assessmentCriteria.map((c, i) => (
                                          <li key={i}>{c}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                              {phase.milestones?.length > 0 && (
                                <div>
                                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
                                    <Award className="w-5 h-5 text-[#8C49E9]" /> Milestones
                                  </h3>
                                  <ul className="space-y-2">
                                    {phase.milestones.map((milestone, i) => (
                                      <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-3 text-gray-300 text-sm"
                                      >
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        {milestone}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
          {preview && phasesToShow[0]?.tasks?.length > maxTasks && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 mt-3"
            >
              ...and {phasesToShow[0].tasks.length - maxTasks} more tasks
            </motion.p>
          )}
          {preview && roadmap.phases.length > 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 mt-2"
            >
              ...and {roadmap.phases.length - 1} more phases
            </motion.p>
          )}
        </div>
      </div>
      <AnimatePresence>
        {submitTask && (
          <TaskSubmitModal
            task={submitTask.task}
            onClose={() => setSubmitTask(null)}
            onSubmitted={({ taskId }) => onTaskSubmitted && onTaskSubmitted({ taskId })}
          />
        )}
        {viewTask && (
          <TaskViewModal
            task={viewTask.task}
            onClose={() => setViewTask(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

Roadmap.propTypes = {
  roadmap: PropTypes.shape({
    phases: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        isUnlocked: PropTypes.bool,
        totalDuration: PropTypes.string,
        prerequisites: PropTypes.arrayOf(PropTypes.string),
        learningOutcomes: PropTypes.arrayOf(PropTypes.string),
        skills: PropTypes.arrayOf(
          PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            subtopics: PropTypes.arrayOf(PropTypes.string),
          })
        ),
        tasks: PropTypes.arrayOf(
          PropTypes.shape({
            _id: PropTypes.string,
            description: PropTypes.string,
            category: PropTypes.string,
            timeline: PropTypes.string,
            xp: PropTypes.number,
            resources: PropTypes.arrayOf(PropTypes.string),
            sourceTaskId: PropTypes.string,
          })
        ),
        miniProject: PropTypes.shape({
          description: PropTypes.string,
          timeline: PropTypes.string,
          xp: PropTypes.number,
          badge: PropTypes.string,
          submission: PropTypes.string,
          resources: PropTypes.arrayOf(PropTypes.string),
          assessmentCriteria: PropTypes.arrayOf(PropTypes.string),
        }),
        milestones: PropTypes.arrayOf(PropTypes.string),
      })
    ),
    careerPath: PropTypes.string,
    currentLevel: PropTypes.string,
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  onTaskSubmitted: PropTypes.func,
  preview: PropTypes.bool,
};

Roadmap.defaultProps = {
  roadmap: null,
  loading: false,
  error: '',
  onRetry: null,
  onTaskSubmitted: null,
  preview: false,
};

export default Roadmap;