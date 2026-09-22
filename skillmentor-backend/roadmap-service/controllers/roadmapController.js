const Roadmap = require('../models/Roadmap');
const Task = require('../../task-service/models/Task'); // <-- import Task model
const { generateRoadmapFromGemini } = require('../services/geminiService');
const { fetchJobSkills } = require('../services/jobSkillService');
const Submission = require('../../task-service/models/Submission');
const Evaluation = require('../../task-service/models/Evaluation');
const TaskProgress = require('../../task-service/models/TaskProgress');

exports.generateRoadmap = async (req, res) => {
  try {
    const { careerPath, currentLevel } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!careerPath || !currentLevel) {
      return res.status(400).json({ success: false, msg: 'careerPath and currentLevel are required' });
    }

    // Fetch job skills
    const jobSkills = await fetchJobSkills(careerPath);

    // Generate roadmap from Gemini
    const roadmapData = await generateRoadmapFromGemini(careerPath, currentLevel, jobSkills);

    if (!Array.isArray(roadmapData) || roadmapData.length === 0) {
      throw new Error('Invalid roadmap data from Gemini API');
    }

    // Save or update roadmap
    const roadmap = await Roadmap.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        careerPath,
        currentLevel,
        jobValidatedSkills: jobSkills,
        phases: roadmapData.map((p, i) => ({
          ...p,
          isUnlocked: i === 0
        }))
      },
      { upsert: true, new: true }
    );

    // ---- Create Tasks from Roadmap ----
    let allTasks = [];
    for (const phase of roadmap.phases) {
      // Regular tasks
      if (phase.tasks && phase.tasks.length) {
        const tasksToInsert = phase.tasks.map(t => {
          // Generate a title from the description if not provided
          const taskTitle = t.title || 
                           t.description.split('.')[0].substring(0, 100) || 
                           `Task ${Math.random().toString(36).substring(2, 7)}`;
                           
          return {
            roadmap: roadmap._id,
            phaseId: phase._id.toString(),
            title: taskTitle,
            description: t.description,
            resources: t.resources || [],
            timeline: t.timeline || '',
            xp: t.xp || 0,
            dependencies: t.dependencies || [],
            type: 'task',
            category: t.category || 'code',
            sourceTaskId: t._id || null
          };
        });
        allTasks.push(...tasksToInsert);
      }

      // MiniProject
      if (phase.miniProject) {
        allTasks.push({
          roadmap: roadmap._id,
          phaseId: phase._id.toString(),
          title: phase.miniProject.title || 'Mini Project',
          description: phase.miniProject.description,
          resources: phase.miniProject.resources || [],
          timeline: phase.miniProject.timeline || '',
          xp: phase.miniProject.xp || 0,
          dependencies: [],
          type: 'miniProject',
          category: 'project',
          badge: phase.miniProject.badge || null,
          sourceTaskId: phase.miniProject._id || null
        });
      }
    }

    if (allTasks.length) {
      // Remove old tasks for this roadmap before inserting new ones
      await Task.deleteMany({ roadmap: roadmap._id });
      await Task.insertMany(allTasks);
    }

    console.log(`✅ Roadmap & ${allTasks.length} tasks created for user ${userId}`);

    res.status(200).json({
      success: true,
      roadmap,
      tasksCreated: allTasks.length
    });
  } catch (err) {
    console.error('❌ Roadmap Generation Error:', err.message);
    res.status(500).json({ success: false, msg: `Failed to generate roadmap: ${err.message}` });
  }
};

exports.getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ success: false, msg: 'Roadmap not found' });
    }
    // Compute dynamic phase unlocks based on completed tasks
    const tasks = await Task.find({ roadmap: roadmap._id }).lean();
    const phaseIdToTasks = tasks.reduce((acc, t) => {
      acc[t.phaseId] = acc[t.phaseId] || [];
      acc[t.phaseId].push(t);
      return acc;
    }, {});
    const allTaskIds = tasks.map(t => t._id);
    const completedProgress = await require('../../task-service/models/TaskProgress')
      .find({ user: req.user.id, task: { $in: allTaskIds }, status: 'completed' })
      .lean();
    const completedTaskIdSet = new Set(completedProgress.map(p => p.task.toString()));

    const phases = roadmap.phases.map((phase, idx) => {
      if (idx === 0) return { ...phase.toObject?.() || phase, isUnlocked: true };
      const phaseTasks = phaseIdToTasks[phase._id.toString()] || [];
      if (phaseTasks.length === 0) {
        return { ...phase.toObject?.() || phase, isUnlocked: false };
      }
      const allPrevCompleted = phaseTasks.every(t => completedTaskIdSet.has(t._id.toString()));
      return { ...phase.toObject?.() || phase, isUnlocked: allPrevCompleted };
    });

    const response = roadmap.toObject ? { ...roadmap.toObject(), phases } : { ...roadmap, phases };

    res.status(200).json({ success: true, roadmap: response });
  } catch (err) {
    console.error('❌ Roadmap Retrieval Error:', err.message);
    res.status(500).json({ success: false, msg: `Failed to retrieve roadmap: ${err.message}` });
  }
};

// Fully reset user's roadmap-related data and regenerate a new roadmap
exports.resetAndGenerateRoadmap = async (req, res) => {
  // If transactions are not supported (standalone Mongo), perform non-transactional reset
  const supportsTransactions = false;
  let session = null;
  try {
    if (supportsTransactions && Roadmap.startSession) {
      session = await Roadmap.startSession();
      session.startTransaction();
    }

    const { careerPath, currentLevel } = req.body;
    const userId = req.user.id;
    if (!careerPath || !currentLevel) {
      if (session) { await session.abortTransaction(); session.endSession(); }
      return res.status(400).json({ success: false, msg: 'careerPath and currentLevel are required' });
    }

    const useSession = (q) => (session ? q.session(session) : q);

    const roadmaps = await useSession(Roadmap.find({ user: userId }));
    const roadmapIds = roadmaps.map(r => r._id);
    const tasks = roadmapIds.length ? await useSession(Task.find({ roadmap: { $in: roadmapIds } })) : [];
    const taskIds = tasks.map(t => t._id);

    const submissions = await useSession(Submission.find({ user: userId, ...(taskIds.length ? { task: { $in: taskIds } } : {}) }));
    const submissionIds = submissions.map(s => s._id);

    if (submissionIds.length) await useSession(Evaluation.deleteMany({ submission: { $in: submissionIds } }));
    if (submissionIds.length) await useSession(Submission.deleteMany({ _id: { $in: submissionIds } }));
    await useSession(TaskProgress.deleteMany({ user: userId }));
    if (taskIds.length) await useSession(Task.deleteMany({ _id: { $in: taskIds } }));
    if (roadmapIds.length) await useSession(Roadmap.deleteMany({ _id: { $in: roadmapIds } }));

    const jobSkills = await fetchJobSkills(careerPath);
    const roadmapData = await generateRoadmapFromGemini(careerPath, currentLevel, jobSkills);
    if (!Array.isArray(roadmapData) || roadmapData.length === 0) {
      if (session) { await session.abortTransaction(); session.endSession(); }
      return res.status(500).json({ success: false, msg: 'Invalid roadmap data from Gemini API' });
    }

    const created = await (session
      ? Roadmap.create([{
          user: userId, careerPath, currentLevel, jobValidatedSkills: jobSkills,
          phases: roadmapData.map((p, i) => ({ ...p, isUnlocked: i === 0 }))
        }], { session })
      : Roadmap.create([{
          user: userId, careerPath, currentLevel, jobValidatedSkills: jobSkills,
          phases: roadmapData.map((p, i) => ({ ...p, isUnlocked: i === 0 }))
        }]));

    const roadmap = created[0];

    let allTasks = [];
    for (const phase of roadmap.phases) {
      if (phase.tasks && phase.tasks.length) {
        const tasksToInsert = phase.tasks.map(t => ({
          roadmap: roadmap._id,
          phaseId: phase._id.toString(),
          title: t.title || t.description.split('.')[0].substring(0, 100) || `Task ${Math.random().toString(36).substring(2, 7)}`,
          description: t.description,
          resources: t.resources || [],
          timeline: t.timeline || '',
          xp: t.xp || 0,
          dependencies: t.dependencies || [],
          type: 'task',
          sourceTaskId: t._id || null
        }));
        allTasks.push(...tasksToInsert);
      }
      if (phase.miniProject) {
        allTasks.push({
          roadmap: roadmap._id,
          phaseId: phase._id.toString(),
          title: phase.miniProject.title || 'Mini Project',
          description: phase.miniProject.description,
          resources: phase.miniProject.resources || [],
          timeline: phase.miniProject.timeline || '',
          xp: phase.miniProject.xp || 0,
          dependencies: [],
          type: 'miniProject',
          badge: phase.miniProject.badge || null,
          sourceTaskId: phase.miniProject._id || null
        });
      }
    }
    if (allTasks.length) {
      if (session) await Task.insertMany(allTasks, { session }); else await Task.insertMany(allTasks);
    }

    if (session) { await session.commitTransaction(); session.endSession(); }
    return res.status(200).json({ success: true, roadmap, tasksCreated: allTasks.length, reset: true });
  } catch (err) {
    if (session) {
      try { await session.abortTransaction(); } catch {}
      try { session.endSession(); } catch {}
    }
    const msg = String(err && err.message || '');
    if (msg.includes('Transaction numbers are only allowed on a replica set member') || msg.toLowerCase().includes('transaction')) {
      console.warn('Transactions not supported; using non-transactional reset.');
      // Fallback: perform the reset without session
      try {
        const { careerPath, currentLevel } = req.body;
        const userId = req.user.id;
        if (!careerPath || !currentLevel) return res.status(400).json({ success: false, msg: 'careerPath and currentLevel are required' });

        const roadmaps = await Roadmap.find({ user: userId });
        const roadmapIds = roadmaps.map(r => r._id);
        const tasks = roadmapIds.length ? await Task.find({ roadmap: { $in: roadmapIds } }) : [];
        const taskIds = tasks.map(t => t._id);
        const submissions = await Submission.find({ user: userId, ...(taskIds.length ? { task: { $in: taskIds } } : {}) });
        const submissionIds = submissions.map(s => s._id);
        if (submissionIds.length) await Evaluation.deleteMany({ submission: { $in: submissionIds } });
        if (submissionIds.length) await Submission.deleteMany({ _id: { $in: submissionIds } });
        await TaskProgress.deleteMany({ user: userId });
        if (taskIds.length) await Task.deleteMany({ _id: { $in: taskIds } });
        if (roadmapIds.length) await Roadmap.deleteMany({ _id: { $in: roadmapIds } });

        const jobSkills = await fetchJobSkills(careerPath);
        const roadmapData = await generateRoadmapFromGemini(careerPath, currentLevel, jobSkills);
        if (!Array.isArray(roadmapData) || roadmapData.length === 0) return res.status(500).json({ success: false, msg: 'Invalid roadmap data from Gemini API' });
        const created = await Roadmap.create([{ user: userId, careerPath, currentLevel, jobValidatedSkills: jobSkills, phases: roadmapData.map((p, i) => ({ ...p, isUnlocked: i === 0 })) }]);
        const roadmap = created[0];
        let allTasks = [];
        for (const phase of roadmap.phases) {
          if (phase.tasks && phase.tasks.length) {
            const tasksToInsert = phase.tasks.map(t => ({
              roadmap: roadmap._id,
              phaseId: phase._id.toString(),
              title: t.title || t.description.split('.')[0].substring(0, 100) || `Task ${Math.random().toString(36).substring(2, 7)}`,
              description: t.description,
              resources: t.resources || [],
              timeline: t.timeline || '',
              xp: t.xp || 0,
              dependencies: t.dependencies || [],
              type: 'task',
              sourceTaskId: t._id || null
            }));
            allTasks.push(...tasksToInsert);
          }
          if (phase.miniProject) {
            allTasks.push({
              roadmap: roadmap._id,
              phaseId: phase._id.toString(),
              title: phase.miniProject.title || 'Mini Project',
              description: phase.miniProject.description,
              resources: phase.miniProject.resources || [],
              timeline: phase.miniProject.timeline || '',
              xp: phase.miniProject.xp || 0,
              dependencies: [],
              type: 'miniProject',
              badge: phase.miniProject.badge || null,
              sourceTaskId: phase.miniProject._id || null
            });
          }
        }
        if (allTasks.length) await Task.insertMany(allTasks);
        return res.status(200).json({ success: true, roadmap, tasksCreated: allTasks.length, reset: true });
      } catch (fallbackErr) {
        console.error('Fallback reset failed:', fallbackErr.message);
        return res.status(500).json({ success: false, msg: `Failed to reset and generate roadmap: ${fallbackErr.message}` });
      }
    }
    console.error('❌ Roadmap Reset & Generation Error:', err.message);
    return res.status(500).json({ success: false, msg: `Failed to reset and generate roadmap: ${err.message}` });
  }
};
