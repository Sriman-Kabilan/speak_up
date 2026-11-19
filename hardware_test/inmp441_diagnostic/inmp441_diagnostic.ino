// ESP32 + INMP441 Diagnostic Version
#include <driver/i2s.h>

// INMP441 I2S pins
#define I2S_WS 25    // D25
#define I2S_SD 22    // D22  
#define I2S_SCK 26   // D26
#define I2S_PORT I2S_NUM_0

#define LED_PIN 2

bool isRecording = false;
bool i2sInitialized = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // Blink LED
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("=== INMP441 Diagnostic Version ===");
  Serial.println("Commands:");
  Serial.println("- diag: Run full diagnostics");
  Serial.println("- init: Initialize INMP441");
  Serial.println("- raw: Show raw I2S data");
  Serial.println("- start: Start recording");
  Serial.println("- stop: Stop recording");
  Serial.println("==================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "diag") {
      runDiagnostics();
    } else if (command == "init") {
      initializeI2S();
    } else if (command == "raw") {
      showRawData();
    } else if (command == "start") {
      startRecording();
    } else if (command == "stop") {
      stopRecording();
    } else {
      Serial.println("Unknown command: " + command);
    }
  }
  
  if (isRecording && i2sInitialized) {
    recordAudio();
  }
  
  delay(10);
}

void runDiagnostics() {
  Serial.println("=== INMP441 Diagnostics ===");
  
  // Check GPIO pins
  Serial.println("GPIO Pin States:");
  Serial.println("D22 (SD): " + String(digitalRead(22)));
  Serial.println("D25 (WS): " + String(digitalRead(25)));
  Serial.println("D26 (SCK): " + String(digitalRead(26)));
  
  // Check power
  Serial.println("Power Check:");
  Serial.println("3.3V available: " + String(analogRead(A0) > 0 ? "Yes" : "Check"));
  
  // I2S Status
  if (i2sInitialized) {
    Serial.println("I2S Status: Initialized");
  } else {
    Serial.println("I2S Status: Not initialized");
  }
  
  Serial.println("===========================");
}

void initializeI2S() {
  Serial.println("Initializing with multiple configurations...");
  
  // Try Configuration 1: Standard I2S
  if (tryI2SConfig1()) {
    Serial.println("✓ Config 1 (Standard I2S) worked!");
    return;
  }
  
  // Try Configuration 2: MSB format
  if (tryI2SConfig2()) {
    Serial.println("✓ Config 2 (MSB format) worked!");
    return;
  }
  
  // Try Configuration 3: Different bit settings
  if (tryI2SConfig3()) {
    Serial.println("✓ Config 3 (Alt bits) worked!");
    return;
  }
  
  Serial.println("✗ All configurations failed!");
}

bool tryI2SConfig1() {
  Serial.println("Trying Config 1: Standard I2S...");
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = 512,
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
    i2s_driver_uninstall(I2S_PORT);
    return false;
  }
  
  i2s_zero_dma_buffer(I2S_PORT);
  i2s_start(I2S_PORT);
  i2sInitialized = true;
  return true;
}

bool tryI2SConfig2() {
  Serial.println("Trying Config 2: MSB format...");
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_MSB,  // Different format
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = 512,
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
    i2s_driver_uninstall(I2S_PORT);
    return false;
  }
  
  i2s_zero_dma_buffer(I2S_PORT);
  i2s_start(I2S_PORT);
  i2sInitialized = true;
  return true;
}

bool tryI2SConfig3() {
  Serial.println("Trying Config 3: 16-bit samples...");
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,  // 16-bit instead of 32
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = 512,
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
    i2s_driver_uninstall(I2S_PORT);
    return false;
  }
  
  i2s_zero_dma_buffer(I2S_PORT);
  i2s_start(I2S_PORT);
  i2sInitialized = true;
  return true;
}

void showRawData() {
  if (!i2sInitialized) {
    Serial.println("Run 'init' first");
    return;
  }
  
  Serial.println("Raw I2S data (10 samples):");
  
  int32_t buffer[10];
  size_t bytes_read;
  
  esp_err_t result = i2s_read(I2S_PORT, buffer, sizeof(buffer), &bytes_read, 1000);
  
  Serial.println("Read result: " + String(result));
  Serial.println("Bytes read: " + String(bytes_read));
  
  for (int i = 0; i < 10; i++) {
    Serial.println("Sample " + String(i) + ": " + String(buffer[i]) + " (0x" + String(buffer[i], HEX) + ")");
  }
}

void startRecording() {
  if (!i2sInitialized) {
    Serial.println("Run 'init' first");
    return;
  }
  
  isRecording = true;
  digitalWrite(LED_PIN, HIGH);
  Serial.println("Recording started - make noise!");
}

void stopRecording() {
  isRecording = false;
  digitalWrite(LED_PIN, LOW);
  Serial.println("Recording stopped");
}

void recordAudio() {
  int32_t buffer[32];
  size_t bytes_read;
  
  esp_err_t result = i2s_read(I2S_PORT, buffer, sizeof(buffer), &bytes_read, 100);
  
  if (result == ESP_OK && bytes_read > 0) {
    int samples = bytes_read / sizeof(int32_t);
    
    for (int i = 0; i < min(16, samples); i++) {
      int16_t sample = (buffer[i] >> 16) & 0xFFFF;
      Serial.print(sample);
      if (i < min(15, samples-1)) Serial.print(",");
    }
    Serial.println();
  }
}