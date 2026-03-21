#include <WiFiS3.h>
#include <DHT.h>

// ------------------------------
// WiFi and server configuration
// ------------------------------
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your computer's local WiFi IP running Express backend
// Example: 192.168.1.10
const char* serverIp = "YOUR_SERVER_IP_ADDRESS";
const int serverPort = 3000;
const char* endpoint = "/api/readings";

// ------------------------------
// Sensor and actuator pin setup
// ------------------------------
#define DHTPIN 2
#define DHTTYPE DHT11

const int LED_PIN = 7;
const int BUZZER_PIN = 8;

// ------------------------------
// Reading and threshold settings
// ------------------------------
const float TEMP_THRESHOLD = 28.0;
const unsigned long SEND_INTERVAL = 5000; // ms
unsigned long lastSendTime = 0;

DHT dht(DHTPIN, DHTTYPE);

// Function prototype
void sendReading(float temperature, float humidity, const char* status, float threshold);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for Serial Monitor on boards that need it
  }

  dht.begin();

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);

  Serial.print("Connecting to WiFi");
  while (WiFi.begin(ssid, password) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("Board IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long now = millis();

  // Use millis() interval pattern for periodic reading/sending
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature(); // Celsius

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT11 sensor.");
      return;
    }

    // Threshold logic for server room alerting
    const char* status = "normal";
    if (temperature > TEMP_THRESHOLD) {
      status = "alert";
      digitalWrite(LED_PIN, HIGH);
      tone(BUZZER_PIN, 2000); // Sound buzzer in alert condition
    } else {
      status = "normal";
      digitalWrite(LED_PIN, LOW);
      noTone(BUZZER_PIN);     // Silence buzzer in normal condition
    }

    // Serial logging each cycle
    Serial.print("Temperature: ");
    Serial.print(temperature, 1);
    Serial.print(" C, Humidity: ");
    Serial.print(humidity, 1);
    Serial.print(" %, Status: ");
    Serial.println(status);

    // Send reading to local Express backend
    sendReading(temperature, humidity, status, TEMP_THRESHOLD);
  }
}

void sendReading(float temperature, float humidity, const char* status, float threshold) {
  WiFiClient client;

  if (client.connect(serverIp, serverPort)) {
    // Build JSON body including status and threshold
    String jsonBody = "{\"temperature\":";
    jsonBody += String(temperature, 1);
    jsonBody += ",\"humidity\":";
    jsonBody += String(humidity, 1);
    jsonBody += ",\"status\":\"";
    jsonBody += status;
    jsonBody += "\",\"threshold\":";
    jsonBody += String(threshold, 1);
    jsonBody += "}";

    // HTTP POST request to /api/readings
    client.print("POST ");
    client.print(endpoint);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.print(serverIp);
    client.print(":");
    client.println(serverPort);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonBody.length());
    client.println("Connection: close");
    client.println();
    client.println(jsonBody);

    Serial.println("POST sent:");
    Serial.println(jsonBody);
  } else {
    Serial.println("Connection to server failed.");
  }

  client.stop();
}