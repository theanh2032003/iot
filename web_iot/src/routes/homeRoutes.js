const express = require('express');
const router = express.Router();

// Import controller
const DiviceStatusController = require('../controllers/DeviceStatusController');

// Định nghĩa route cho trang chủ
router.get('/', DiviceStatusController.getAllDiviceStatus);

module.exports = router;