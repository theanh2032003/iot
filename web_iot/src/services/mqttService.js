const client = require('../config/mqtt');

const MQTTService = {
    connect: () => {
      return new Promise((resolve, reject) => {
        client.on('connect', () => resolve(client));
        client.on('error', (error) => reject(error));
      });
    },
    subscribe: (topics) => {
      return new Promise((resolve, reject) => {
        client.subscribe(topics, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    onMessage: (callback) => {
      client.on('message', (topic, message) => callback(topic, message));
    },
    publish: (topic, message) => {
      client.publish(topic, message);
    },
  };
  
  module.exports = MQTTService;