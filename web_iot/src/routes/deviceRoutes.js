const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/DeviceController');

router.post('/update_status', (req, res) => {
  const { deviceName, status } = req.body;
  DeviceController.updateStatus(deviceName, status);
  res.sendStatus(200);
});

module.exports = router;
