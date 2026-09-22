const Task = require('../models/Task');

// Create a task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tasks for the authenticated user's current roadmap
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const Roadmap = require('../../roadmap-service/models/Roadmap');
    const roadmap = await Roadmap.findOne({ user: userId }).lean();
    if (!roadmap) {
      return res.status(404).json({ success: false, msg: 'No roadmap found for user' });
    }
    const tasks = await Task.find({ roadmap: roadmap._id }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, roadmapId: roadmap._id, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};