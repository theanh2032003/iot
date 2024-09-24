const DataLog = require('../models/DataLog');

const DataSensorController = {
  getDataLog: async (req, res) => {
    try {
      const {
        temperatureFrom,
        temperatureTo,
        humidityFrom,
        humidityTo,
        lightFrom,
        lightTo,
        timeFrom,
        timeTo,
        page,
        pageSize
      } = req.query;

      const filtersReq = {
        temperatureFrom: temperatureFrom ? parseInt(temperatureFrom) : null,
        temperatureTo: temperatureTo ? parseInt(temperatureTo) : null,
        humidityFrom: humidityFrom ? parseInt(humidityFrom) : null,
        humidityTo: humidityTo ? parseInt(humidityTo) : null,
        lightFrom: lightFrom ? parseInt(lightFrom) : null,
        lightTo: lightTo ? parseInt(lightTo) : null,
        timeFrom: timeFrom ? new Date(timeFrom) : null,
        timeTo: timeTo ? new Date(timeTo) : null,
        page: page ? parseInt(page) : 0,
        pageSize: pageSize ? parseInt(pageSize) : 20
      };

      console.log(filtersReq)

      // Gọi phương thức getAll với các tham số lọc
      const { results, pagination, filters } = await DataLog.getAll(filtersReq);
      // Render dữ liệu vào trang history
      console.log({
        historyData: results,
        filters,
        pagination })
      res.render("history", {
        historyData: results,
        filters,
        pagination });
    } catch (err) {
      // Xử lý lỗi
      res.status(500).send(err.message);
    }
  }
};

module.exports = DataSensorController;