const express = require('express');
const router = express.Router();

// Import controller
const ActionLogController = require('../controllers/ActionLogController');

// Định nghĩa route cho trang chủ
router.get('/log', ActionLogController.getAllLogs);

module.exports = router;