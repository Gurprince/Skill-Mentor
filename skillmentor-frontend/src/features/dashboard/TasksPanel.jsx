import React from 'react';
import { ListChecks, Code, HelpCircle, FolderGit2, BookOpen, Brain, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Dashboard.css';

const TasksPanel = ({ tasks = [], completedTaskIds = new Set(), onOpenTask }) => {
  const [filter, setFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Define category icons and display names
  const categories = {
    code: { icon: <Code className="w-4 h-4" />, label: 'Code' },
    quiz: { icon: <HelpCircle className="w-4 h-4" />, label: 'Quizzes' },
    project: { icon: <FolderGit2 className="w-4 h-4" />, label: 'Projects' },
    reading: { icon: <BookOpen className="w-4 h-4" />, label: 'Reading' },
    learning: { icon: <Brain className="w-4 h-4" />, label: 'Learning' },
    research: { icon: <Search className="w-4 h-4" />, label: 'Research' },
  };

  // Filter tasks based on search query and category
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filter === 'all' || 
                            (task.category?.toLowerCase() === filter) || 
                            (filter === 'completed' && completedTaskIds.has(String(task._id)));
      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, filter, completedTaskIds]);

  // Group filtered tasks by category
  const grouped = filteredTasks.reduce((acc, t) => {
    const key = t.category?.toLowerCase() || 'code';
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  // Order categories
  const order = ['code', 'quiz', 'project', 'reading', 'learning', 'research'];
  const orderedEntries = Object.entries(grouped).sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-md shadow-md"
    >
      <div className="p-5 border-b border-gray-700 flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-[#8C49E9]" />
        <h3 className="text-lg font-semibold text-gray-100">All Tasks</h3>
      </div>
      <div className="px-5 pt-4 pb-2 text-xs flex flex-wrap gap-2">
        <div className="relative w-full mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-full text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C49E9] focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'completed', ...order].map(cat => {
            const isActive = filter === cat;
            const count = cat === 'all' 
              ? tasks.length 
              : cat === 'completed'
                ? tasks.filter(t => completedTaskIds.has(String(t._id))).length
                : (grouped[cat]?.length || 0);
                
            return (
              <motion.button
                key={cat}
                onClick={() => setFilter(cat)}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8C49E9] to-[#4AC1FF] text-white border-transparent'
                    : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50'
                }`}
                aria-label={`Filter by ${cat === 'all' ? 'all tasks' : cat === 'completed' ? 'completed tasks' : categories[cat]?.label || cat}`}
                aria-selected={isActive}
              >
                {cat === 'all' ? (
                  <>
                    <span>All</span>
                    <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{count}</span>
                  </>
                ) : cat === 'completed' ? (
                  <>
                    <span>Completed</span>
                    <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{count}</span>
                  </>
                ) : (
                  <>
                    {categories[cat]?.icon}
                    <span>{categories[cat]?.label || cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    <span className="text-xs bg-white/20 rounded-full px-1.5">{count}</span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="p-5 pt-2 text-sm text-gray-300 space-y-4 max-h-[400px] overflow-auto overscroll-contain">
        {filteredTasks.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center"
          >
            No tasks available yet.
          </motion.p>
        )}
        <AnimatePresence>
          {Object.entries(grouped).length > 0 ? (
            orderedEntries.map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {categories[category]?.icon || <HelpCircle className="w-4 h-4 text-gray-400" />}
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    {categories[category]?.label || category.charAt(0).toUpperCase() + category.slice(1)}
                  </p>
                </div>
                {items.map((t) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between p-4 rounded-lg border border-gray-600 bg-gray-700/50 hover:border-[#8C49E9]/50 transition-all ${
                      completedTaskIds.has(String(t._id)) ? 'opacity-80' : ''
                    }`}
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(140, 73, 233, 0.2)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium line-clamp-1 ${
                          completedTaskIds.has(String(t._id))
                            ? 'text-gray-500 line-through'
                            : 'text-gray-100'
                        }`}
                      >
                        {t.title || 'Untitled Task'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8C49E9]/20 text-[#8C49E9]">
                          {categories[t.category?.toLowerCase()]?.icon || <HelpCircle className="w-3 h-3" />}
                          {t.category?.charAt(0).toUpperCase() + t.category?.slice(1) || t.type?.charAt(0).toUpperCase() + t.type?.slice(1) || 'Code'}
                        </span>
                        <span> • {t.xp || 0} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {completedTaskIds.has(String(t._id)) && (
                        <span className="inline-flex items-center gap-1 text-green-300 bg-green-500/20 border border-green-500/50 px-2 py-0.5 rounded text-xs">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onOpenTask && onOpenTask(t)}
                        className="px-3 py-1.5 rounded bg-[#4AC1FF]/80 text-white text-xs hover:bg-[#4AC1FF] focus:outline-none focus:ring-2 focus:ring-[#4AC1FF]"
                        aria-label={`Open task ${t.title || 'Untitled Task'}`}
                      >
                        Open
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent('open-task-submit', { detail: { task: t } })
                          )
                        }
                        className="px-3 py-1.5 rounded bg-[#8C49E9]/80 text-white text-xs hover:bg-[#8C49E9] focus:outline-none focus:ring-2 focus:ring-[#8C49E9]"
                        aria-label={`Submit task ${t.title || 'Untitled Task'}`}
                      >
                        Submit
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h4 className="text-gray-300 font-medium mb-1">No tasks found</h4>
              <p className="text-gray-500 text-sm max-w-xs">
                {searchQuery 
                  ? 'No tasks match your search. Try different keywords.'
                  : filter === 'completed'
                    ? 'You haven\'t completed any tasks yet.'
                    : `No ${filter === 'all' ? '' : filter + ' '}tasks available.`}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="mt-4 px-4 py-2 text-sm bg-[#8C49E9]/10 text-[#8C49E9] hover:bg-[#8C49E9]/20 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TasksPanel;