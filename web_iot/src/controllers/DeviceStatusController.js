const DiviceStatus = require('../models/DeviceStatus');

const DiviceStatusController = {
  getAllDiviceStatus: async (req, res) => {
    try {
      const result = await DiviceStatus.getAll();
      var deviceStatus = {};
      result.forEach(function (row) {
        deviceStatus[row.device_name] = row.status;
      });
      // console.log(deviceStatus)
      res.render('home', { deviceStatus: deviceStatus });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};

module.exports = DiviceStatusController;