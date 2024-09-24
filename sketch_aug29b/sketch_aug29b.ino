#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Định nghĩa chân cho DHT11, LED và quang trở
#define DHTPIN D1     // Chân DHT11
#define DHTTYPE DHT11 // Loại cảm biến DHT11
#define LED1 D2       // LED 1
#define LED2 D3       // LED 2
#define LED3 D4       // LED 3
#define LDR_PIN A0    // Chân quang trở


// Thông tin kết nối WiFi và MQTT Broker
const char* ssid = "TP-Link_B510";             // Thay bằng SSID của bạn
const char* password = "50447430";         // Thay bằng mật khẩu WiFi của bạn
// const char* ssid = "Tuan Them";             // Thay bằng SSID của bạn
// const char* password = "12345678";         // Thay bằng mật khẩu WiFi của bạn
const char* mqtt_server = "e7b9bebcbf214dcfa2de218f51a8ee97.s1.eu.hivemq.cloud"; // Thay bằng URL của HiveMQ
const char* mqtt_user = "B21DCCN004";       // Thay bằng username của bạn
const char* mqtt_pass = "Theanh2032003";       // Thay bằng password của bạn
const int mqtt_port = 8883;

const char* topic_light = "theanh2032003/esp8266/light";
const char* topic_fan = "theanh2032003/esp8266/fan";
const char* topic_television = "theanh2032003/esp8266/television";

const char* topic_light_status = "theanh2032003/esp8266/light/status";
const char* topic_fan_status = "theanh2032003/esp8266/fan/status";
const char* topic_television_status = "theanh2032003/esp8266/television/status";
const char* topic_sensor_data = "theanh2032003/esp8266/sensor_data";

// Tạo đối tượng DHT và PubSubClient
DHT dht(DHTPIN, DHTTYPE);
WiFiClientSecure espClient;
PubSubClient client(espClient);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7*3600, 60000);
// Hàm kết nối WiFi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// Hàm callback xử lý khi nhận tin nhắn từ MQTT
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("Callback function called");
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // Chuyển payload thành chuỗi để so sánh
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  // Xử lý bật/tắt LED dựa trên tin nhắn nhận được
  String ledState = (message == "on") ? "on" : "off";

  // Tạo một đối tượng JSON để gửi trạng thái
  StaticJsonDocument<200> doc;
  doc["state"] = ledState;

  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  if (strcmp(topic, topic_light) == 0) {
    Serial.print("Light "); 
    digitalWrite(LED1, (ledState == "on") ? HIGH : LOW);
    client.publish(topic_light_status, jsonBuffer);

  } else if (strcmp(topic, topic_fan) == 0) {
    Serial.print("fan");
    digitalWrite(LED2, (ledState == "on") ? HIGH : LOW);
    client.publish(topic_fan_status, jsonBuffer);

  } else if (strcmp(topic, topic_television) == 0) {
    Serial.print("television");
    digitalWrite(LED3, (ledState == "on") ? HIGH : LOW);
    client.publish(topic_television_status, jsonBuffer);

  }
    Serial.print(ledState);
}

// Hàm kết nối lại nếu mất kết nối với MQTT Broker
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientID =  "ESPClient-";
    clientID += String(random(0xffff),HEX);
    if (client.connect(clientID.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected");
      if (client.subscribe(topic_light)) {
        Serial.println("Subscribed to topic_light");
      }
      if (client.subscribe(topic_fan)) {
        Serial.println("Subscribed to topic_fan");
      }
      if (client.subscribe(topic_television)) {
        Serial.println("Subscribed to topic_television");
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LDR_PIN, INPUT);

  setup_wifi();
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  dht.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Đọc dữ liệu từ DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature(); // Nhiệt độ theo Celsius

  // // Đọc giá trị từ quang trở
  int ldrValue = analogRead(LDR_PIN);
  
  // // Tính toán Lux từ giá trị đọc được từ quang trở
  // // Giá trị Lux là một phép đo ước lượng. 
  // // Công thức có thể thay đổi tùy thuộc vào cấu hình của module LDR
  float lux = (float)ldrValue * (3.3 / 1024.0) * 1000; // Giả định điện áp tối đa là 3.3V và giá trị ADC 10-bit

  // // Kiểm tra nếu không đọc được từ DHT11
  // if (isnan(h) || isnan(t)) {
  //   Serial.println("Failed to read from DHT sensor!");
  //   return;
  // }

  // // Xuất nhiệt độ, độ ẩm, và Lux ra Serial
  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.print(" *C\t");
  Serial.print("Lux: ");
  Serial.println(lux);
  timeClient.update();
  unsigned long currentTime = timeClient.getEpochTime();

  // // Tạo chuỗi JSON
  StaticJsonDocument<200> doc;
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["lux"] = lux;
  doc["timestamp"] = currentTime; 
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);

  // Gửi chuỗi JSON qua MQTT
  client.publish(topic_sensor_data, jsonBuffer);

  delay(2000); // Đợi 2 giây trước khi lặp lại
}
