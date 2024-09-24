const express = require('express');
const router = express.Router();

// Import controller
const ProfileController = require('../controllers/ProfileController');

// Định nghĩa route cho trang chủ
router.get('/profile', ProfileController.getProfile);

module.exports = router;