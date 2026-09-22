const express = require('express');
const router = express.Router();
const { createTask, getTasks, getMyTasks } = require('../controllers/taskController');
const { verifyToken } = require('../../auth-service/utils/verifyToken');

// POST /api/task
router.post('/', createTask);

// GET /api/task
router.get('/', getTasks);

// GET /api/task/my - tasks for the authenticated user's roadmap
router.get('/my', verifyToken, getMyTasks);

module.exports = router;
