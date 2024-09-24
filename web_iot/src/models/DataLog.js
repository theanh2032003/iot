const db = require('../config/db');

const DataLog = {
    createTable: () => {
      const sql = `
        CREATE TABLE IF NOT EXISTS data_log (
          id int(10) not null primary key auto_increment,
          time datetime not null,
          temperature FLOAT not null,
          humidity FLOAT not null,
          light FLOAT not null
        )
      `;
      return new Promise((resolve, reject) => {
        db.query(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    insertData: (time, temperature, humidity, light) => {
      const sql = "INSERT INTO data_log (time, temperature, humidity, light) VALUES (FROM_UNIXTIME(?), ?, ?, ?) ;";
      return new Promise((resolve, reject) => {
        db.query(sql, [time, temperature, humidity, light], (err) => {
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
        conditions.push("temperature >= ?");
        values.push(temperatureFrom);
      }
      if (temperatureTo !== null) {
        conditions.push("temperature <= ?");
        values.push(temperatureTo);
      }
    
      // Thêm điều kiện lọc cho độ ẩm nếu có
      if (humidityFrom !== null) {
        conditions.push("humidity >= ?");
        values.push(humidityFrom);
      }
      if (humidityTo !== null) {
        conditions.push("humidity <= ?");
        values.push(humidityTo);
      }
    
      // Thêm điều kiện lọc cho ánh sáng nếu có
      if (lightFrom !== null) {
        conditions.push("light >= ?");
        values.push(lightFrom);
      }
      if (lightTo !== null) {
        conditions.push("light <= ?");
        values.push(lightTo);
      }
    
      // Thêm điều kiện lọc cho thời gian nếu có
      if (timeFrom !== null) {
        conditions.push("time >= ?");
        values.push(timeFrom);
      }
      if (timeTo !== null) {
        conditions.push("time <= ?");
        values.push(timeTo);
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
    }
};
  
  module.exports = DataLog;