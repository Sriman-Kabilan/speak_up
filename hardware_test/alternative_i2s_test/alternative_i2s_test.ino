// Alternative I2S Configuration Test
#include <driver/i2s.h>

#define LED_PIN 2

bool i2sReady = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  delay(2000);
  
  // Blink to show we're alive
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("=== Alternative I2S Test ===");
  Serial.println("Commands:");
  Serial.println("- test: Basic test");
  Serial.println("- config1: Try original pins (22,25,26)");
  Serial.println("- config2: Try alternative pins (32,33,25)");
  Serial.println("- config3: Try minimal I2S config");
  Serial.println("- reset: Reset I2S");
  Serial.println("===============================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "test") {
      Serial.println("✓ ESP32 working");
    }
    else if (command == "config1") {
      tryConfig1();
    }
    else if (command == "config2") {
      tryConfig2();
    }
    else if (command == "config3") {
      tryConfig3();
    }
    else if (command == "reset") {
      resetI2S();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void tryConfig1() {
  Serial.println("Config 1: Original pins (D22,D25,D26)");
  
  resetI2S();  // Clean slate
  
  Serial.println("Installing I2S driver...");
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,  // Try 16-bit first
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,  // Default interrupt
    .dma_buf_count = 2,
    .dma_buf_len = 128,     // Very small buffer
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  esp_err_t result = i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  Serial.println("Driver install result: " + String(result));
  
  if (result == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 26,    // D26
      .ws_io_num = 25,     // D25
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 22    // D22
    };
    
    result = i2s_set_pin(I2S_NUM_0, &pin_config);
    Serial.println("Pin config result: " + String(result));
    
    if (result == ESP_OK) {
      Serial.println("✓ Config 1 SUCCESS!");
      testRead();
    } else {
      Serial.println("✗ Config 1 pin setup failed");
    }
  } else {
    Serial.println("✗ Config 1 driver install failed");
  }
}

void tryConfig2() {
  Serial.println("Config 2: Alternative pins (D32,D33,D25)");
  
  resetI2S();
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 128,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  esp_err_t result = i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  Serial.println("Driver install result: " + String(result));
  
  if (result == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 32,    // Different pin
      .ws_io_num = 25,     // Keep D25
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 33    // Different pin
    };
    
    result = i2s_set_pin(I2S_NUM_0, &pin_config);
    Serial.println("Pin config result: " + String(result));
    
    if (result == ESP_OK) {
      Serial.println("✓ Config 2 SUCCESS!");
      Serial.println("NOTE: You'd need to rewire to D32,D33,D25");
    } else {
      Serial.println("✗ Config 2 pin setup failed");
    }
  } else {
    Serial.println("✗ Config 2 driver install failed");
  }
}

void tryConfig3() {
  Serial.println("Config 3: Minimal I2S (no pins assigned)");
  
  resetI2S();
  
  // Minimal config - just install driver
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 8000,   // Lower sample rate
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 64,     // Tiny buffer
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  esp_err_t result = i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  Serial.println("Minimal driver install result: " + String(result));
  
  if (result == ESP_OK) {
    Serial.println("✓ Minimal I2S driver works!");
    Serial.println("The issue might be with pin assignment");
  } else {
    Serial.println("✗ Even minimal I2S fails - deeper hardware issue");
  }
}

void resetI2S() {
  Serial.println("Resetting I2S...");
  i2s_driver_uninstall(I2S_NUM_0);
  delay(100);
  i2sReady = false;
}

void testRead() {
  Serial.println("Testing I2S read...");
  
  i2s_start(I2S_NUM_0);
  delay(100);
  
  int16_t buffer[8];
  size_t bytes_read;
  
  esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 1000);
  
  Serial.println("Read result: " + String(result));
  Serial.println("Bytes read: " + String(bytes_read));
  
  if (bytes_read > 0) {
    Serial.print("Data: ");
    for (int i = 0; i < 4; i++) {
      Serial.print(buffer[i]);
      Serial.print(" ");
    }
    Serial.println();
  }
}