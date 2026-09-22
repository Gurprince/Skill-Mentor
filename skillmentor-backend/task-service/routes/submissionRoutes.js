// task-service/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const { createSubmission, getSubmission } = require('../controllers/submissionController');
const { verifyToken } = require('../../auth-service/utils/verifyToken');

router.post('/', verifyToken, createSubmission);
router.get('/:id', verifyToken, getSubmission);

module.exports = router;
