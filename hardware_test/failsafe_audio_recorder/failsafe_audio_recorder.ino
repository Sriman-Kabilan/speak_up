#include <driver/i2s.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// INMP441 I2S pins
#define I2S_WS 25
#define I2S_SD 33
#define I2S_SCK 32
#define I2S_PORT I2S_NUM_0

// Analog microphone pin (backup)
#define ANALOG_MIC_PIN 36

// Audio settings
#define SAMPLE_RATE 16000
#define SAMPLE_BITS 16
#define BUFFER_SIZE 1024

WebSocketsServer webSocket = WebSocketsServer(81);
bool isRecording = false;
bool useI2S = true;
int16_t audioBuffer[BUFFER_SIZE];

void setup() {
  Serial.begin(115200);
  
  // Test INMP441 initialization
  if (initI2S()) {
    Serial.println("INMP441 initialized successfully");
    useI2S = true;
  } else {
    Serial.println("INMP441 failed, using analog backup");
    useI2S = false;
    pinMode(ANALOG_MIC_PIN, INPUT);
  }
  
  // Setup WiFi for web integration
  setupWiFi();
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  Serial.println("Audio system ready - Type 'start' or 'stop'");
}

bool initI2S() {
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = i2s_bits_per_sample_t(SAMPLE_BITS),
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = i2s_comm_format_t(I2S_COMM_FORMAT_STAND_I2S),
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = BUFFER_SIZE,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };

  if (i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL) != ESP_OK) {
    return false;
  }
  
  if (i2s_set_pin(I2S_PORT, &pin_config) != ESP_OK) {
    return false;
  }
  
  return true;
}

void setupWiFi() {
  // Optional: Connect to WiFi for web integration
  // WiFi.begin("your_wifi", "password");
  Serial.println("WiFi setup ready (configure if needed)");
}

void loop() {
  webSocket.loop();
  
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    
    if (command == "start") {
      startRecording();
    } else if (command == "stop") {
      stopRecording();
    } else if (command == "test") {
      testAudioSources();
    }
  }
  
  if (isRecording) {
    recordAudio();
  }
  
  delay(10);
}

void startRecording() {
  isRecording = true;
  Serial.println("Recording started");
  Serial.println("AUDIO_START");
}

void stopRecording() {
  isRecording = false;
  Serial.println("Recording stopped");
  Serial.println("AUDIO_END");
}

void recordAudio() {
  if (useI2S) {
    recordI2SAudio();
  } else {
    recordAnalogAudio();
  }
}

void recordI2SAudio() {
  size_t bytes_read;
  esp_err_t result = i2s_read(I2S_PORT, audioBuffer, sizeof(audioBuffer), &bytes_read, portMAX_DELAY);
  
  if (result == ESP_OK && bytes_read > 0) {
    int samples = bytes_read / sizeof(int16_t);
    for (int i = 0; i < samples; i++) {
      Serial.print(audioBuffer[i]);
      if (i < samples - 1) Serial.print(",");
    }
    Serial.println();
  }
}

void recordAnalogAudio() {
  for (int i = 0; i < BUFFER_SIZE; i++) {
    int analogValue = analogRead(ANALOG_MIC_PIN);
    audioBuffer[i] = map(analogValue, 0, 4095, -32768, 32767);
    delayMicroseconds(62); // ~16kHz sampling
  }
  
  for (int i = 0; i < BUFFER_SIZE; i++) {
    Serial.print(audioBuffer[i]);
    if (i < BUFFER_SIZE - 1) Serial.print(",");
  }
  Serial.println();
}

void testAudioSources() {
  Serial.println("=== Audio Source Test ===");
  
  if (useI2S) {
    Serial.println("Primary: INMP441 (I2S) - ACTIVE");
    Serial.println("Backup: Analog mic - STANDBY");
  } else {
    Serial.println("Primary: INMP441 (I2S) - FAILED");
    Serial.println("Backup: Analog mic - ACTIVE");
  }
  
  Serial.println("Web/Mobile: Available via WebSocket");
  Serial.println("========================");
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_TEXT:
      String command = String((char*)payload);
      if (command == "start_recording") {
        startRecording();
      } else if (command == "stop_recording") {
        stopRecording();
      }
      break;
  }
}