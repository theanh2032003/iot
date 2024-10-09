const db = require('../config/db');

const DataLog = {
    createTable: () => {
      const sql = `
        CREATE TABLE IF NOT EXISTS data_log (
          id int(10) not null primary key auto_increment,
          time VARCHAR(19) not null,
          temperature FLOAT not null,
          humidity FLOAT not null,
          light FLOAT not null,
          wind FLOAT not null
        )
      `;
      return new Promise((resolve, reject) => {
        db.query(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    insertData: ( temperature, humidity, light, wind) => {
      const sql = "INSERT INTO data_log (time, temperature, humidity, light, wind) VALUES (DATE_FORMAT(NOW(), '%H:%i:%s %d/%m/%Y'), ?, ?, ?, ?) ;";
  
      return new Promise((resolve, reject) => {
        db.query(sql, [parseFloat(temperature).toFixed(2), parseFloat(humidity).toFixed(2), parseFloat(light).toFixed(2), parseFloat(wind).toFixed(2)], (err) => {    
          if (err) reject(err);
          else resolve();
        });
      });
    },
    getAll: ({
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
    }) => {
      // Khởi tạo mảng để lưu các điều kiện lọc
      const conditions = [];
      const values = [];
      console.log(pageSize)
      page = (page == null) ? 0 : page;
      pageSize = (pageSize == null) ? 20 : pageSize;
      // Thêm điều kiện lọc cho nhiệt độ nếu có
      if (temperatureFrom !== null) {
        conditions.push("ROUND(temperature,2) = ?");
        values.push(temperatureFrom);
      }
    
      // Thêm điều kiện lọc cho độ ẩm nếu có
      if (humidityFrom !== null) {
        conditions.push("humidity = ?");
        values.push(humidityFrom);
      }

      // Thêm điều kiện lọc cho ánh sáng nếu có
      if (lightFrom !== null) {
        conditions.push("ROUND(light,2) = ?");
        values.push(lightFrom);
      }
    
      // Thêm điều kiện lọc cho thời gian nếu có
      if (timeFrom !== null) {
        timeFrom = timeFrom.replace("%20", " ");
        conditions.push("time = '" + timeFrom + "'");
        values.push(timeFrom);
      }
    
      // Tạo câu lệnh SQL
      let sql = "SELECT * FROM data_log";
      let count_sql = "SELECT COUNT(*) AS total_count FROM data_log"
      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
        count_sql += " WHERE " + conditions.join(" AND ");
      }
      sql += " ORDER BY id DESC";
      
      // Thêm phân trang
      sql += ` LIMIT ${pageSize} OFFSET ${page * pageSize}`;
      console.log(sql)
      values.push(pageSize, page * pageSize);
      return new Promise((resolve, reject) => {

        db.query(count_sql, values, (err, countResult) => {
          if (err) {
            reject(err);
          } else {
            const totalCount = countResult[0].total_count; // Lấy tổng số lượng từ kết quả đếm
            
            // Sau đó, thực hiện truy vấn dữ liệu
            db.query(sql, values, (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  filters: {
                    temperatureFrom,
                    temperatureTo,
                    humidityFrom,
                    humidityTo,
                    lightFrom,
                    lightTo,
                    timeFrom,
                    timeTo
                  },
                  pagination: {
                    page,
                    page_size: pageSize,
                    total_count: totalCount // Trả về tổng số lượng
                  },
                  results: results
                });
              }
            });
          }
        });
      });
    },
    countWind: () => {
      return new Promise((resolve, reject) => {
        // Tạo câu lệnh SQL để đếm số lượng các bản ghi có giá trị wind > 800
        let sql = "SELECT COUNT(*) AS total_count FROM data_log WHERE wind > 800";
    
        // Thực hiện truy vấn
        db.query(sql, (err, results) => {
          if (err) {
            reject(err);
          } else {
            // Trả về kết quả đếm
            resolve({
              total_wind_records: results[0].total_count
            });
          }
        });
      });
    }
};
  
  module.exports = DataLog;