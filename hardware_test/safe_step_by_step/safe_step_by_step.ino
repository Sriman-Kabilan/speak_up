// Safe Step-by-Step INMP441 Implementation
#include <driver/i2s.h>

#define LED_PIN 2
#define I2S_WS 25    // D25
#define I2S_SD 22    // D22  
#define I2S_SCK 26   // D26
#define I2S_PORT I2S_NUM_0

bool i2sReady = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  delay(2000);  // Safe startup delay
  
  // Blink to show we're alive
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("=== Safe INMP441 Step-by-Step ===");
  Serial.println("Commands:");
  Serial.println("- test: Basic test");
  Serial.println("- pins: Check pin states");
  Serial.println("- step1: Configure I2S pins only");
  Serial.println("- step2: Install I2S driver");
  Serial.println("- step3: Test I2S read");
  Serial.println("- record: Start recording");
  Serial.println("================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "test") {
      Serial.println("✓ ESP32 working safely");
    } 
    else if (command == "pins") {
      checkPins();
    }
    else if (command == "step1") {
      configureI2SPins();
    }
    else if (command == "step2") {
      installI2SDriver();
    }
    else if (command == "step3") {
      testI2SRead();
    }
    else if (command == "record") {
      startRecording();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void checkPins() {
  Serial.println("=== Pin Check ===");
  Serial.println("D22 (SD): " + String(digitalRead(22)));
  Serial.println("D25 (WS): " + String(digitalRead(25)));
  Serial.println("D26 (SCK): " + String(digitalRead(26)));
  Serial.println("================");
}

void configureI2SPins() {
  Serial.println("Step 1: Configuring I2S pins...");
  
  // Just configure pins, don't install driver yet
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,    // D26
    .ws_io_num = I2S_WS,      // D25
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD     // D22
  };
  
  Serial.println("✓ Pin configuration prepared");
  Serial.println("  SCK: D26");
  Serial.println("  WS:  D25");
  Serial.println("  SD:  D22");
  Serial.println("Ready for Step 2");
}

void installI2SDriver() {
  Serial.println("Step 2: Installing I2S driver...");
  
  // Simple I2S configuration
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 2,      // Small buffer count
    .dma_buf_len = 256,      // Small buffer size
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  // Install driver
  esp_err_t result = i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  if (result != ESP_OK) {
    Serial.println("✗ Driver install failed: " + String(result));
    return;
  }
  
  // Set pins
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };
  
  result = i2s_set_pin(I2S_PORT, &pin_config);
  if (result != ESP_OK) {
    Serial.println("✗ Pin config failed: " + String(result));
    i2s_driver_uninstall(I2S_PORT);
    return;
  }
  
  Serial.println("✓ I2S driver installed successfully");
  Serial.println("Ready for Step 3");
  i2sReady = true;
}

void testI2SRead() {
  if (!i2sReady) {
    Serial.println("Run step2 first!");
    return;
  }
  
  Serial.println("Step 3: Testing I2S read...");
  
  // Start I2S
  i2s_start(I2S_PORT);
  delay(100);  // Let it stabilize
  
  // Try to read some data
  int32_t buffer[8];  // Small buffer
  size_t bytes_read;
  
  esp_err_t result = i2s_read(I2S_PORT, buffer, sizeof(buffer), &bytes_read, 1000);
  
  Serial.println("Read result: " + String(result));
  Serial.println("Bytes read: " + String(bytes_read));
  
  if (bytes_read > 0) {
    Serial.println("Sample data:");
    for (int i = 0; i < 4; i++) {
      Serial.println("  [" + String(i) + "]: " + String(buffer[i]));
    }
    
    if (buffer[0] == 0 && buffer[1] == 0 && buffer[2] == 0) {
      Serial.println("⚠ Getting zeros - check L/R pin connection");
    } else {
      Serial.println("✓ Getting data - INMP441 working!");
    }
  }
  
  Serial.println("Ready for recording");
}

void startRecording() {
  if (!i2sReady) {
    Serial.println("Complete steps 1-3 first!");
    return;
  }
  
  Serial.println("Recording for 5 seconds...");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int sampleCount = 0;
  
  while (millis() - startTime < 5000) {  // 5 seconds
    int32_t buffer[16];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_PORT, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      // Show first few samples
      if (sampleCount < 32) {
        for (int i = 0; i < min(4, samples); i++) {
          int16_t sample = (buffer[i] >> 16) & 0xFFFF;
          Serial.print(sample);
          if (i < min(3, samples-1)) Serial.print(",");
        }
        Serial.println();
        sampleCount += 4;
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  Serial.println("Recording complete");
}