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
          DataLog.insertData(objData.timestamp, parseFloat(objData.temperature).toFixed(2), parseFloat(objData.humidity).toFixed(2), parseFloat(objData.lux).toFixed(2));  
          io.emit(process.env.TOPIC_DATA_SENSOR_CONTROL_PUB_FRONT, { objData });                  
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
  
  });

  const convertUnixTimestampToDate = (timestamp) => {
    // Tạo đối tượng Date từ timestamp (giả sử timestamp là số giây)
    const date = new Date(timestamp * 1000);  // Chuyển đổi giây thành mili giây
    // Chuyển đổi Date thành chuỗi theo định dạng YYYY-MM-DD HH:MM:SS
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };