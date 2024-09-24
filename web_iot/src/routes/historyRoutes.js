const express = require('express');
const router = express.Router();

// Import controller
const DataSensorController = require('../controllers/DataSensorController');

// Định nghĩa route cho trang chủ
router.get('/history', DataSensorController.getDataLog);

module.exports = router;