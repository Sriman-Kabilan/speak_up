// ESP32 + INMP441 Step-by-Step Integration
// This version adds I2S support carefully

#include <driver/i2s.h>

// INMP441 I2S pins (matching your actual wiring D22, D25, D26)
#define I2S_WS 25    // D25
#define I2S_SD 22    // D22  
#define I2S_SCK 26   // D26
#define I2S_PORT I2S_NUM_0

#define LED_PIN 2

// Audio settings
#define SAMPLE_RATE 16000
#define SAMPLE_BITS 16
#define BUFFER_SIZE 512

bool isRecording = false;
bool i2sInitialized = false;
int16_t audioBuffer[BUFFER_SIZE];

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // Blink LED to show we're alive
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("=== ESP32 + INMP441 System ===");
  Serial.println("Available commands:");
  Serial.println("- test: Check system status");
  Serial.println("- init: Initialize INMP441");
  Serial.println("- start: Start recording");
  Serial.println("- stop: Stop recording");
  Serial.println("- wiring: Show wiring guide");
  Serial.println("===============================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "test") {
      testSystem();
    } else if (command == "init") {
      initializeI2S();
    } else if (command == "start") {
      startRecording();
    } else if (command == "stop") {
      stopRecording();
    } else if (command == "wiring") {
      showWiring();
    } else {
      Serial.println("Unknown command: " + command);
    }
  }
  
  if (isRecording && i2sInitialized) {
    recordI2SAudio();
  }
  
  delay(10);
}

void testSystem() {
  Serial.println("=== System Status ===");
  Serial.println("✓ ESP32: Running");
  Serial.println("✓ Serial: Working");
  Serial.println("✓ LED: Working");
  
  if (i2sInitialized) {
    Serial.println("✓ INMP441: Initialized");
  } else {
    Serial.println("⚠ INMP441: Not initialized (run 'init' command)");
  }
  
  Serial.println("====================");
}

void initializeI2S() {
  Serial.println("Initializing INMP441...");
  
  // I2S configuration
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

  // Pin configuration
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,    // GPIO32
    .ws_io_num = I2S_WS,      // GPIO25
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD     // GPIO33
  };

  // Install I2S driver
  esp_err_t result = i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  if (result != ESP_OK) {
    Serial.println("✗ I2S driver install failed: " + String(result));
    return;
  }
  
  // Set I2S pins
  result = i2s_set_pin(I2S_PORT, &pin_config);
  if (result != ESP_OK) {
    Serial.println("✗ I2S pin config failed: " + String(result));
    i2s_driver_uninstall(I2S_PORT);
    return;
  }
  
  // Clear I2S buffer
  i2s_zero_dma_buffer(I2S_PORT);
  
  i2sInitialized = true;
  Serial.println("✓ INMP441 initialized successfully!");
  Serial.println("Ready to record audio");
}

void startRecording() {
  if (!i2sInitialized) {
    Serial.println("⚠ Run 'init' command first to initialize INMP441");
    return;
  }
  
  isRecording = true;
  digitalWrite(LED_PIN, HIGH);
  Serial.println("Recording started");
  Serial.println("AUDIO_START");
}

void stopRecording() {
  isRecording = false;
  digitalWrite(LED_PIN, LOW);
  Serial.println("Recording stopped");
  Serial.println("AUDIO_END");
}

void recordI2SAudio() {
  size_t bytes_read;
  esp_err_t result = i2s_read(I2S_PORT, audioBuffer, sizeof(audioBuffer), &bytes_read, 100);
  
  if (result == ESP_OK && bytes_read > 0) {
    int samples = bytes_read / sizeof(int16_t);
    
    // Check if we're getting real data (not all zeros)
    bool hasData = false;
    for (int i = 0; i < samples; i++) {
      if (audioBuffer[i] != 0) {
        hasData = true;
        break;
      }
    }
    
    if (hasData) {
      // Send first 32 samples to avoid overwhelming serial
      for (int i = 0; i < min(32, samples); i++) {
        Serial.print(audioBuffer[i]);
        if (i < min(31, samples-1)) Serial.print(",");
      }
      Serial.println();
    } else {
      Serial.println("⚠ All zeros - check INMP441 wiring");
    }
  } else {
    Serial.println("⚠ I2S read error: " + String(result));
  }
}

void showWiring() {
  Serial.println("=== INMP441 Wiring Guide ===");
  Serial.println("ESP32    →    INMP441");
  Serial.println("GND      →    GND");
  Serial.println("3.3V     →    VDD");
  Serial.println("D26      →    SCK");
  Serial.println("D25      →    WS");
  Serial.println("D22      →    SD");
  Serial.println("GND      →    L/R (IMPORTANT!)");
  Serial.println("============================");
  Serial.println("Make sure L/R pin is connected to GND!");
}