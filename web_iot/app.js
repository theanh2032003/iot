const express = require('express');
require('dotenv').config();
const app = express();
const port = 6060;
var server = require("http").Server(app);
var io = require("socket.io")(server);


const actionLogRoutes = require('./src/routes/actionLogRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const homeRoutes = require('./src/routes/homeRoutes');
const profileRoutes = require('./src/routes/profileRoutes');

const ActionLog = require('./src/models/ActionLog');
const DeviceStatus = require('./src/models/DeviceStatus');
const DataLog = require('./src/models/DataLog');

DataLog.createTable()
ActionLog.createTable()
DeviceStatus.createTable()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Static files
app.use(express.static('./src/public'));

// Use routes
app.use('/', actionLogRoutes);
app.use('/', historyRoutes);
app.use('/', homeRoutes);
app.use('/', profileRoutes);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// MQTT and Socket.IO setup (same as before)
const MQTTService = require('./src/services/mqttService');

const setupMQTT = async () => {
    try {
      await MQTTService.connect();
      console.log("Connected to MQTT broker");
  
      // Subscribe to the topics
      await MQTTService.subscribe(process.env.TOPIC_LIGHT_RES_STATUS_SUB_ESP8266);
      console.log(`Subscribed to topic: ${process.env.TOPIC_LIGHT_RES_STATUS_SUB_ESP8266}`);
  
      await MQTTService.subscribe(process.env.TOPIC_FAN_RES_STATUS_SUB_ESP8266);
      console.log(`Subscribed to topic: ${process.env.TOPIC_FAN_RES_STATUS_SUB_ESP8266}`);
  
      await MQTTService.subscribe(process.env.TOPIC_TELEVISION_RES_STATUS_SUB_ESP8266);
      console.log(`Subscribed to topic: ${process.env.TOPIC_TELEVISION_RES_STATUS_SUB_ESP8266}`);
  
      await MQTTService.subscribe(process.env.TOPIC_TEM_HUMI_SUB_ESP8266);
      console.log(`Subscribed to topic: ${process.env.TOPIC_TEM_HUMI_SUB_ESP8266}`);

      await MQTTService.subscribe(process.env.TOPIC_OTHER_DEVICE_RES_STATUS_SUB_ESP8266);
      console.log(`Subscribed to topic: ${process.env.TOPIC_OTHER_DEVICE_RES_STATUS_SUB_ESP8266}`);

      await MQTTService.subscribe(process.env.TOPIC_WARNING_RES_STATUS_SUB_ESP8266);
      console.log(`Subscribed to topic: ${process.env.TOPIC_WARNING_RES_STATUS_SUB_ESP8266}`);


      MQTTService.onMessage((topic, message) => {
        // console.log(`Message received: ${message} from topic: ${topic}`);
        const objData = JSON.parse(message);
  
        if (topic === process.env.TOPIC_LIGHT_RES_STATUS_SUB_ESP8266) {
          try {
          const state = objData.state;
          DeviceStatus.updateStatus("light", state);
          ActionLog.insertAction("light", state);
          io.emit(process.env.TOPIC_LIGHT_CONTROL_PUB_FRONT, { state });            
          } catch (error) {
            console.log(error);
          }

        } else if (topic === process.env.TOPIC_FAN_RES_STATUS_SUB_ESP8266) {
          try {
          const state = objData.state;
          DeviceStatus.updateStatus("fan", state);
          ActionLog.insertAction("fan", state);
          io.emit(process.env.TOPIC_FAN_CONTROL_PUB_FRONT, { state });            
          } catch (error) {
            console.log(error);
          }

        } else if (topic === process.env.TOPIC_TELEVISION_RES_STATUS_SUB_ESP8266) {
          try {
          const state = objData.state;
          DeviceStatus.updateStatus("television", state);
          ActionLog.insertAction("television", state);
          io.emit(process.env.TOPIC_TELEVISION_CONTROL_PUB_FRONT, { state });            
          } catch (error) {
            console.log(error);
          }

        } else if (topic === process.env.TOPIC_TEM_HUMI_SUB_ESP8266) {
          try {
          DataLog.insertData(objData.temperature, objData.humidity, objData.lux, objData.wind);  
          DataLog.countWind().then(count => {
            // console.log(count.total_wind_records)
            io.emit(process.env.TOPIC_DATA_SENSOR_CONTROL_PUB_FRONT, {
              objData,
              windCount: count.total_wind_records // Truyền count vào emit
            });
          }).catch(error => {
            console.log(error);
          });
          // io.emit(process.env.TOPIC_DATA_SENSOR_CONTROL_PUB_FRONT, { objData, windCount: count.total_wind_records});                  
          } catch (error) {
            console.log(error);
          }

        } else if (topic === process.env.TOPIC_OTHER_DEVICE_RES_STATUS_SUB_ESP8266) {
          try {
            const state = objData.state;
            DeviceStatus.updateStatus("other_device", state);
            ActionLog.insertAction("other_device", state);
            io.emit(process.env.TOPIC_OTHER_DEVICE_PUB_FRONT, { state });            
            } catch (error) {
              console.log(error);
            }
        } else if (topic === process.env.TOPIC_WARNING_RES_STATUS_SUB_ESP8266) {
          try {
            const state = objData.state;
            // DeviceStatus.updateStatus("other_device", state);
            // ActionLog.insertAction("other_device", state);
            io.emit(process.env.TOPIC_WARNING_PUB_FRONT, { state });            
            } catch (error) {
              console.log(error);
            }
        }
      });
    } catch (err) {
      console.error("Failed to setup MQTT", err);
      process.exit(1);
    }
  };

setupMQTT();

io.on("connection", function (socket) {
    console.log(socket.id + " connected");
  
    // Xử lý khi client disconnect
    socket.on("disconnect", function () {
      console.log(socket.id + " disconnected");
    });
  
    // Light control event
    socket.on(process.env.TOPIC_LIGHT_CONTROL_SUB_FRONT, function (data) {
      const status = data === "on" ? "on" : "off";
      console.log(`Light ${status.toUpperCase()}`);
      MQTTService.publish(process.env.TOPIC_LIGHT_REQ_PUB_ESP8266, status);
    });
  
    // Fan control event
    socket.on(process.env.TOPIC_FAN_CONTROL_SUB_FRONT, function (data) {
      const status = data === "on" ? "on" : "off";
      console.log(`Fan ${status.toUpperCase()}`);
      MQTTService.publish(process.env.TOPIC_FAN_REQ_PUB_ESP8266, status);
    });
  
    // Television control event
    socket.on(process.env.TOPIC_TELEVISION_CONTROL_SUB_FRONT, function (data) {
      const status = data === "on" ? "on" : "off";
      console.log(`Television ${status.toUpperCase()}`);
      MQTTService.publish(process.env.TOPIC_TELEVISION_REQ_PUB_ESP8266, status);
    });

    socket.on(process.env.TOPIC_OTHER_DEVICE_CONTROL_SUB_FRONT, function (data) {
      const status = data === "on" ? "on" : "off";
      console.log(`Other device ${status.toUpperCase()}`);
      MQTTService.publish(process.env.TOPIC_OTHER_DEVICE_REQ_PUB_ESP8266, status);
    });
  
    socket.on(process.env.TOPIC_WARNING_CONTROL_SUB_FRONT, function (data) {
      const status = data === "on" ? "on" : "off";
      console.log(`warning ${status.toUpperCase()}`);
      MQTTService.publish(process.env.TOPIC_WARNING_REQ_PUB_ESP8266, status);
    });
  });

  const getCurrentTimeFormatted = () => {
    const date = new Date(); // Lấy thời gian hiện tại
  
    const hours = String(date.getHours()).padStart(2, '0'); // Giờ
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Phút
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Giây
    const day = String(date.getDate()).padStart(2, '0'); // Ngày
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng (cộng 1)
    const year = date.getFullYear(); // Năm
  
    // Tạo chuỗi định dạng hh:mm:ss dd/mm/yyyy
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };