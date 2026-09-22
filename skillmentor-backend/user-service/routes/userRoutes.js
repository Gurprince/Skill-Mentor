const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/userController');
const { verifyToken } = require('../../auth-service/utils/verifyToken');

router.post('/profile', verifyToken, saveProfile);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
