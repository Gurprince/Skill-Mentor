const express = require('express');
const router = express.Router();
const { generateRoadmap, getRoadmap, resetAndGenerateRoadmap } = require('../controllers/roadmapController');
const { verifyToken } = require('../../auth-service/utils/verifyToken');

router.post('/generate', verifyToken, generateRoadmap);
router.get('/', verifyToken, getRoadmap);
router.post('/reset-generate', verifyToken, resetAndGenerateRoadmap);

module.exports = router;
