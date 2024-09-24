const { DeviceStatus } = require('../models/deviceStatus');
const { ActionLog } = require('../models/ActionLog');

const DeviceService = {
    saveDeviceStatus: async (deviceName, status) => {
      await DeviceStatus.updateStatus(deviceName, status);
    },
    saveUserAction: async (deviceName, action) => {
      await ActionLog.insertAction(deviceName, action);
    },
  };
  
  module.exports = DeviceService;
