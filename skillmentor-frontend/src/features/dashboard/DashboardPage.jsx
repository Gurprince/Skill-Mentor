import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { fetchRoadmap, generateRoadmap, getUserResults, resetAndGenerate, getTaskResult, getMyTasks } from '../dashboard/dashboardService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Roadmap from '../roadmap/Roadmap';
import TasksPanel from './TasksPanel';
import TaskViewModal from '../roadmap/TaskViewModal';
import TaskSubmitModal from '../roadmap/TaskSubmitModal';
import { Bell, User, Settings, LogOut, Award, Sparkles, CheckCircle2, Target, Clock, ListChecks, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import '../../styles/Dashboard.css';
import logo from '../../assests/logo.png';

const DashboardPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [myTasks, setMyTasks] = useState([]);
  const [evaluatingTaskId, setEvaluatingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [submitTask, setSubmitTask] = useState(null);

  // Mock data for new charts (replace with API data later)
  const skillMasteryData = [
    { skill: 'JavaScript', score: 80 },
    { skill: 'React', score: 65 },
    { skill: 'Problem Solving', score: 70 },
    { skill: 'Communication', score: 55 },
  ];

  const weeklyActivityData = [
    { day: 'Mon', hours: 4, tasks: 2 },
    { day: 'Tue', hours: 3, tasks: 1 },
    { day: 'Wed', hours: 5, tasks: 3 },
    { day: 'Thu', hours: 2, tasks: 0 },
    { day: 'Fri', hours: 4, tasks: 2 },
    { day: 'Sat', hours: 6, tasks: 4 },
    { day: 'Sun', hours: 1, tasks: 0 },
  ];

  const achievements = [
    { id: 1, name: 'First Task Completed', icon: <Award className="w-6 h-6 text-yellow-500" /> },
    { id: 2, name: '7-Day Streak', icon: <Target className="w-6 h-6 text-red-500" /> },
    { id: 3, name: 'First Project Submission', icon: <ListChecks className="w-6 h-6 text-[#8C49E9]" /> },
    { id: 4, name: 'Phase Completion', icon: <CheckCircle2 className="w-6 h-6 text-green-500" /> },
  ];

  const generateNewRoadmap = useCallback(async () => {
    setGenerating(true);
    setError('');
    try {
      if (!user?.profile?.careerPath || !user?.profile?.currentLevel) {
        setError('Complete your profile first');
        setGenerating(false);
        navigate('/profile-setup');
        return;
      }
      const confirm = window.confirm('Regenerate roadmap? This will reset your tasks, submissions, evaluations, and progress. This action cannot be undone.');
      if (!confirm) {
        setGenerating(false);
        return;
      }
      const genData = await resetAndGenerate(user.profile, token);
      if (genData.success && genData.roadmap) {
        setRoadmap(genData.roadmap);
        try {
          const res = await getUserResults(token);
          setResults(res.results || []);
        } catch {}
      } else {
        setError('Failed to reset and generate roadmap');
      }
    } catch (err) {
      setError(err.message || 'Error generating roadmap');
    } finally {
      setGenerating(false);
    }
  }, [token, navigate, user]);

  const loadRoadmap = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const isNewUser = location.state?.from === 'profile-setup';
      if (!isNewUser) {
        const data = await fetchRoadmap(token);
        if (data.success && data.roadmap) {
          setRoadmap(data.roadmap);
          return;
        }
      }
      await generateNewRoadmap();
    } catch (err) {
      setError(err.message || 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  }, [token, generateNewRoadmap]);

  const handleRetry = useCallback(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  useEffect(() => {
    const openView = (e) => {
      const task = e.detail?.task;
      if (task) setViewTask(task);
    };
    const openSubmit = (e) => {
      const task = e.detail?.task;
      if (task) setSubmitTask(task);
    };
    window.addEventListener('open-task-view', openView);
    window.addEventListener('open-task-submit', openSubmit);
    return () => {
      window.removeEventListener('open-task-view', openView);
      window.removeEventListener('open-task-submit', openSubmit);
    };
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        if (!token) return;
        const res = await getUserResults(token);
        setResults(res.results || []);
      } catch {}
    };
    loadResults();
  }, [token]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (!token) return;
        const res = await getMyTasks(token);
        setMyTasks(res.tasks || []);
      } catch {}
    };
    loadTasks();
  }, [token, roadmap?._id]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const res = await getUserResults(token);
        setResults(res.results || []);
        window.dispatchEvent(new CustomEvent('results-updated', { detail: { results: res.results || [] } }));
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleTaskSubmitted = useCallback(async ({ taskId }) => {
    if (!token || !taskId) return;
    setEvaluatingTaskId(taskId);
    const start = Date.now();
    const timeoutMs = 15000;
    const intervalMs = 2000;
    while (Date.now() - start < timeoutMs) {
      try {
        await getTaskResult(token, taskId);
        const res = await getUserResults(token);
        setResults(res.results || []);
        window.dispatchEvent(new CustomEvent('results-updated', { detail: { results: res.results || [] } }));
        const updated = res.results?.find(r => r.task?.id === taskId);
        if (updated && (updated.latestEvaluation?.score !== undefined || updated.progress?.status === 'completed')) {
          break;
        }
      } catch {}
      await new Promise(r => setTimeout(r, intervalMs));
    }
    setEvaluatingTaskId(null);
  }, [token]);

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate completed tasks from roadmap
  const completedTasksMap = useMemo(() => {
    const map = {};
    roadmap?.phases?.forEach(phase => {
      map[phase._id] = new Set(phase.tasks?.filter(task => task.completed).map((_, index) => index) || []);
    });
    return map;
  }, [roadmap]);

  const stats = useMemo(() => {
    const base = { phases: 0, tasks: 0, completed: 0, xp: 0, percent: 0 };
    const totalFromRoadmap = roadmap?.phases?.flatMap(p => p.tasks || []).length || 0;
    const totalFromResults = results?.length || 0;
    const totalTasks = totalFromResults || totalFromRoadmap || 0;
    const completed = results.filter(r => r.progress?.status === 'completed').length;
    const xp = results.reduce((acc, r) => acc + (r.progress?.xpEarned || 0), 0);
    const percent = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;
    return { phases: roadmap?.phases?.length || 0, tasks: totalTasks, completed, xp, percent };
  }, [roadmap, results]);

  const nextTask = useMemo(() => {
    const pending = results.find(r => r.progress?.status !== 'completed');
    return pending || null;
  }, [results]);

  const completedTaskIds = useMemo(() => {
    if (!Array.isArray(myTasks) || !Array.isArray(results)) return new Set();
    const set = new Set();
    myTasks.forEach(t => {
      const match = results.find(r => (
        r.task?.id === String(t._id) || (t.sourceTaskId && r.task?.sourceId === t.sourceTaskId)
      ));
      if (match && (match.progress?.status === 'completed' || (match.latestEvaluation?.score ?? 0) >= 80)) {
        set.add(String(t._id));
      }
    });
    return set;
  }, [myTasks, results]);

  // Calculate overall progress for PieChart
  const totalTasks = roadmap?.phases?.reduce((sum, phase) => sum + (phase.tasks?.length || 0), 0) || 0;
  const completedTasksCount = Object.values(completedTasksMap).reduce((sum, set) => sum + (set?.size || 0), 0);
  const totalPhases = roadmap?.phases?.length || 0;
  const completedPhases = roadmap?.phases?.filter(p => p.tasks?.every((_, i) => completedTasksMap[p._id]?.has(i))).length || 0;
  const overallProgress = totalTasks ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Get upcoming tasks (next 3 from current phase)
  const currentPhase = roadmap?.phases?.find(p => p.isUnlocked && p.tasks?.some((_, i) => !completedTasksMap[p._id]?.has(i)));
  const upcomingTasks = currentPhase?.tasks?.filter((_, i) => !completedTasksMap[currentPhase._id]?.has(i)).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800/90 backdrop-blur-md border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SkillMentor Logo" className="w-8 h-8 blend-overlay" />
            <h1 className="text-xl font-bold text-gray-100 bg-gradient-to-r from-[#8C49E9] to-[#4AC1FF] bg-clip-text text-transparent">SkillMentor</h1>
          </div>
          {roadmap?.careerPath && (
            <div className="hidden md:block text-gray-300 font-semibold">
              {roadmap.careerPath}
            </div>
          )}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-300 hover:text-[#8C49E9] focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
            </motion.button>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-gray-300 hover:text-[#8C49E9] focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                aria-label="Profile menu"
                aria-expanded={isDropdownOpen}
              >
                <User className="w-6 h-6" />
              </motion.button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800/90 border border-gray-700 rounded-lg shadow-lg p-2"
                  >
                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Abstract Glow Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-[400px] h-[400px] bg-purple-500/15 blur-[120px] top-[-100px] left-[-50px]" />
          <div className="absolute w-[300px] h-[300px] bg-blue-500/15 blur-[120px] bottom-[-50px] right-[-50px]" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#8C49E9] to-[#4AC1FF] bg-clip-text text-transparent flex items-center gap-2"
            >
              <Sparkles className="w-7 h-7 text-[#8C49E9]" /> SkillMentor Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 mt-2"
            >
              {roadmap?.careerPath ? `Path: ${roadmap.careerPath}` : 'Select a path in your profile'} 
              {roadmap?.currentLevel ? ` • Level: ${roadmap.currentLevel}` : ''}
            </motion.p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
              aria-label="Refresh dashboard"
            >
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateNewRoadmap}
              disabled={generating}
              className={`px-4 py-2 rounded-lg text-white ${generating ? 'bg-[#8C49E9]/50 cursor-not-allowed' : 'bg-[#8C49E9] hover:bg-[#7a3cd1]'} transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9]`}
              aria-label={generating ? 'Generating roadmap' : 'Generate new roadmap'}
            >
              {generating ? 'Generating…' : 'Generate Roadmap'}
            </motion.button>
          </div>
        </div>

        {/* Roadmap Generation Loader */}
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            role="status"
            aria-label="Generating roadmap"
            aria-busy="true"
          >
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 flex items-center gap-3 border border-gray-700">
              <div className="w-6 h-6 border-4 border-[#8C49E9] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-semibold text-gray-100">Generating your roadmap…</p>
                <p className="text-xs text-gray-400">This may take a few seconds.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-md flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'roadmap', label: 'Roadmap' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'evaluations', label: 'Evaluations' },
            { id: 'badges', label: 'Badges' },
          ].map(t => (
            <motion.button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${activeTab === t.id ? 'bg-gray-800 border-x border-t border-[#8C49E9] text-[#8C49E9]' : 'text-gray-400 hover:text-gray-100'} relative transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9]`}
              aria-label={`Switch to ${t.label} tab`}
              aria-selected={activeTab === t.id}
            >
              {t.label}
              {activeTab === t.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C49E9]"
                  layoutId="tab-underline"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Left Side: Roadmap & Progress */}
              <div className="md:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Target, label: 'Phases', value: stats.phases, color: 'from-[#8C49E9]/20 to-gray-800', iconColor: '#8C49E9' },
                    { icon: ListChecks, label: 'Tasks', value: stats.tasks, color: 'from-blue-500/20 to-gray-800', iconColor: 'blue-500' },
                    { icon: CheckCircle2, label: 'Completed', value: stats.completed, color: 'from-green-500/20 to-gray-800', iconColor: 'green-500' },
                    { icon: Award, label: 'XP', value: stats.xp, color: 'from-yellow-500/20 to-gray-800', iconColor: 'yellow-500' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} border border-gray-700 flex items-center gap-3 backdrop-blur-md`}
                    >
                      <stat.icon className={`w-6 h-6 text-${stat.iconColor}`} />
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-xl font-semibold text-gray-100">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Roadmap Progress Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 shadow-md"
                >
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Roadmap Progress</h2>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-32 h-32">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={[{ value: overallProgress }, { value: 100 - overallProgress }]}
                            dataKey="value"
                            innerRadius={50}
                            outerRadius={60}
                            startAngle={90}
                            endAngle={-270}
                          >
                            <Cell fill="#8C49E9" />
                            <Cell fill="#374151" />
                          </Pie>
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold text-gray-100">
                            {overallProgress}%
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-gray-300">
                      <p>Tasks Completed: <span className="font-semibold">{completedTasksCount} / {totalTasks}</span></p>
                      <p>Phases Completed: <span className="font-semibold">{completedPhases} / {totalPhases}</span></p>
                    </div>
                  </div>
                </motion.div>

                {/* Roadmap Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md"
                >
                  <div className="p-5 border-b border-gray-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#8C49E9]" />
                      <h2 className="font-semibold text-gray-100">Roadmap Preview</h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('roadmap')}
                      className="px-3 py-1.5 rounded bg-[#8C49E9] text-white text-xs hover:bg-[#7a3cd1] transition flex items-center gap-1"
                      aria-label="View full roadmap"
                    >
                      Full Roadmap <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <Roadmap
                    roadmap={roadmap}
                    loading={loading}
                    error={error}
                    onRetry={handleRetry}
                    onTaskSubmitted={handleTaskSubmitted}
                    preview
                  />
                </motion.div>

                {/* Upcoming Tasks */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 shadow-md"
                >
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Upcoming Tasks</h2>
                  {upcomingTasks.length > 0 ? (
                    <ul className="space-y-4">
                      {upcomingTasks.map((task, index) => (
                        <motion.li
                          key={task._id || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-[#8C49E9]/50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-100">{task.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1 text-gray-400" /> {task.timeline || 'N/A'}
                                </span>
                                <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-[#8C49E9]/20 text-[#8C49E9]">
                                  {task.category || 'Code'}
                                </span>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(140, 73, 233, 0.5)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.dispatchEvent(new CustomEvent('open-task-view', { detail: { task } }))}
                              className="px-4 py-2 rounded-lg bg-[#8C49E9]/80 text-white text-sm hover:bg-[#8C49E9] focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                              aria-label={`Start task ${task.description}`}
                            >
                              Start
                            </motion.button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No upcoming tasks. Complete previous tasks to unlock more.</p>
                  )}
                </motion.div>
              </div>

              {/* Right Side: Insights & Analytics */}
              <div className="space-y-6">
                {/* Next Suggested Step */}
                <motion.div
                  className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="p-5 border-b border-gray-700 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#8C49E9]" />
                    <h3 className="font-semibold text-gray-100">Next Suggested Step</h3>
                  </div>
                  <div className="p-5 text-sm text-gray-300">
                    {nextTask ? (
                      <div className="space-y-3">
                        <p className="font-medium text-gray-100">{nextTask.task?.title || 'Untitled Task'}</p>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-7
00 border border-gray-600">
                            {nextTask.task?.type}
                          </span>
                          {nextTask.progress?.attempts ? (
                            <span className="text-xs">Attempts: {nextTask.progress.attempts}</span>
                          ) : null}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const event = new CustomEvent('open-task-view', {
                              detail: { task: { _id: nextTask.task?.id, title: nextTask.task?.title, description: nextTask.task?.description } },
                            });
                            window.dispatchEvent(event);
                          }}
                          className="mt-2 px-4 py-2 rounded-lg bg-[#8C49E9] hover:bg-[#7a3cd1] text-white transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                          aria-label={`Start task: ${nextTask.task?.title}`}
                        >
                          Start Task
                        </motion.button>
                      </div>
                    ) : (
                      <p>No tasks available yet.</p>
                    )}
                  </div>
                </motion.div>

                {/* Skill Mastery Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 shadow-md"
                >
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Skill Mastery</h2>
                  <ResponsiveContainer height={250} width={400}>
                    <RadarChart data={skillMasteryData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" tick={{ fontSize: 12, overflow: 'visible' }} />
                      <Radar dataKey="score" stroke="#8C49E9" fill="#8C49E9" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Weekly Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 shadow-md"
                >
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Weekly Activity</h2>
                  <ResponsiveContainer height={200}>
                    <BarChart data={weeklyActivityData}>
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="hours" fill="#4AC1FF" name="Hours Spent" />
                      <Bar dataKey="tasks" fill="#8C49E9" name="Tasks Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Recent Evaluations */}
                <motion.div
                  className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="p-5 border-b border-gray-700 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-gray-100">Recent Evaluations</h3>
                  </div>
                  <div className="p-5 text-sm text-gray-300 space-y-3">
                    {results.length === 0 && <p>Submit tasks to see AI feedback here.</p>}
                    {results.slice(0, 5).map(r => (
                      <motion.div
                        key={r.task.id}
                        className="p-3 rounded-lg border border-gray-600 bg-gray-700/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-100 line-clamp-1">{r.task.title}</p>
                          {r.latestEvaluation?.score !== undefined && (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                r.latestEvaluation.score >= 80 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              {r.latestEvaluation.score}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {r.latestEvaluation?.feedback?.summary ? (
                            <p className="text-gray-400 line-clamp-2 pr-2">{r.latestEvaluation.feedback.summary}</p>
                          ) : (
                            <span className="text-gray-500">No feedback</span>
                          )}
                          {r.latestSubmission?.submittedAt && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(r.latestSubmission.submittedAt)}
                            </span>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const event = new CustomEvent('open-task-view', {
                              detail: { task: { _id: r.task.id, title: r.task.title, description: r.task.description } },
                            });
                            window.dispatchEvent(event);
                          }}
                          className="mt-2 px-3 py-1.5 rounded bg-[#8C49E9] text-white text-xs hover:bg-[#7a3cd1] transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                          aria-label={`View details for ${r.task.title}`}
                        >
                          View Details
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Certificates & Achievements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 shadow-md"
                >
                  <h2 className="text-xl font-semibold text-gray-100 mb-4">Achievements</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 flex items-center gap-3 hover:border-[#8C49E9]/50 transition-all"
                      >
                        {achievement.icon}
                        <p className="text-sm text-gray-300">{achievement.name}</p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.a
                    href="/achievements"
                    whileHover={{ scale: 1.05 }}
                    className="mt-4 inline-block px-4 py-2 rounded-lg bg-[#8C49E9]/80 text-white text-sm hover:bg-[#8C49E9] focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                    aria-label="View all achievements"
                  >
                    View All Achievements
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md"
            >
              <div className="p-5 border-b border-gray-700 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8C49E9]" />
                <h2 className="font-semibold text-gray-100">Your Roadmap</h2>
              </div>
              <Roadmap
                roadmap={roadmap}
                loading={loading}
                error={error}
                onRetry={handleRetry}
                onTaskSubmitted={handleTaskSubmitted}
                preview={false}
              />
            </motion.div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TasksPanel
                tasks={myTasks}
                completedTaskIds={completedTaskIds}
                onOpenTask={(task) => {
                  const event = new CustomEvent('open-task-view', { detail: { task } });
                  window.dispatchEvent(event);
                }}
              />
            </motion.div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <motion.div
              key="evaluations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md p-5 space-y-3"
            >
              {results.length === 0 && <p className="text-sm text-gray-400">No evaluations yet.</p>}
              {results.map(r => (
                <motion.div
                  key={r.task.id}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-100 line-clamp-1">{r.task.title}</p>
                    {r.latestEvaluation?.score !== undefined && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          r.latestEvaluation.score >= 80 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {r.latestEvaluation.score}%
                      </span>
                    )}
                  </div>
                  {r.latestEvaluation?.feedback?.summary && (
                    <p className="text-gray-400 mt-1">{r.latestEvaluation.feedback.summary}</p>
                  )}
                  {r.latestSubmission?.submittedAt && (
                    <p className="text-xs text-gray-500 mt-1">Submitted: {formatDate(r.latestSubmission.submittedAt)}</p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const event = new CustomEvent('open-task-view', {
                        detail: { task: { _id: r.task.id, title: r.task.title, description: r.task.description } },
                      });
                      window.dispatchEvent(event);
                    }}
                    className="mt-2 px-3 py-1.5 rounded bg-[#8C49E9] text-white text-xs hover:bg-[#7a3cd1] transition focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                    aria-label={`View details for ${r.task.title}`}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md p-5"
            >
              <div className="flex flex-wrap gap-2">
                {results.filter(r => r.task?.badge && r.progress?.status === 'completed').length === 0 && (
                  <p className="text-sm text-gray-400">Earn badges by completing mini projects and milestones.</p>
                )}
                {results
                  .filter(r => r.task?.badge && r.progress?.status === 'completed')
                  .map((r) => (
                    <motion.span
                      key={r.task.id}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Award className="w-4 h-4" /> {r.task.badge}
                    </motion.span>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Modals */}
        {viewTask && (
          <TaskViewModal
            task={{ _id: viewTask._id || viewTask.id, title: viewTask.title, description: viewTask.description, resources: viewTask.resources }}
            onClose={() => setViewTask(null)}
          />
        )}
        {submitTask && (
          <TaskSubmitModal
            task={{ _id: submitTask._id || submitTask.id, title: submitTask.title }}
            onClose={() => setSubmitTask(null)}
            onSubmitted={handleTaskSubmitted}
          />
        )}

        {/* Evaluation Overlay */}
        {evaluatingTaskId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            role="status"
            aria-label="Evaluating submission"
            aria-busy="true"
          >
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 flex items-center gap-3 border border-gray-700">
              <div className="w-6 h-6 border-4 border-[#8C49E9] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-semibold text-gray-100">Evaluating your submission…</p>
                <p className="text-xs text-gray-400">This usually takes a few seconds.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;