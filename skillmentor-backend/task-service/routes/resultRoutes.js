// task-service/routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth-service/utils/verifyToken');
const resultController = require('../controllers/resultController');

// Get combined task result including submission, evaluation and progress
router.get('/task/:taskId/result', verifyToken, resultController.getTaskResult);

// Get all results for the authenticated user
router.get('/user/results', verifyToken, resultController.getUserResults);

module.exports = router;
