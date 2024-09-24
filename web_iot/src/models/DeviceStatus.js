const db = require('../config/db');

const DeviceStatus = {
    createTable: () => {
      const sql = `
        CREATE TABLE IF NOT EXISTS device_status (
          id INT AUTO_INCREMENT PRIMARY KEY,
          device_name VARCHAR(255) NOT NULL,
          status VARCHAR(10) NOT NULL,
          time DATETIME NOT NULL
        )
      `;
      return new Promise((resolve, reject) => {
        db.query(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    updateStatus: (deviceName, status) => {
      const sql = "UPDATE device_status SET status = ?, time = NOW() WHERE device_name = ?";
      return new Promise((resolve, reject) => {
        db.query(sql, [status, deviceName], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    },
    getAll: () => {
      const sql = "SELECT * FROM device_status";
      return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    }
  };
  
  module.exports = DeviceStatus;