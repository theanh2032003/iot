const mqtt = require("mqtt");

const options = {
  host: 'e7b9bebcbf214dcfa2de218f51a8ee97.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'B21DCCN004',
  password: 'Theanh2032003',
  rejectUnauthorized: false
};

const client = mqtt.connect(options);

module.exports = client;
