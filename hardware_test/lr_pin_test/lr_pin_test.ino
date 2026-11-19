// INMP441 L/R Pin Configuration Test
#include <driver/i2s.h>

#define LED_PIN 2

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  delay(2000);
  
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("=== INMP441 L/R Configuration Test ===");
  Serial.println("Your current wiring:");
  Serial.println("  D26 → SCK");
  Serial.println("  D25 → WS");
  Serial.println("  D22 → SD");
  Serial.println("  GND → L/R (you said this is connected)");
  Serial.println("");
  Serial.println("Commands:");
  Serial.println("- left: Configure for LEFT channel (L/R=GND)");
  Serial.println("- right: Configure for RIGHT channel (L/R=3.3V)");
  Serial.println("- both: Configure for STEREO (both channels)");
  Serial.println("- test: Quick test current config");
  Serial.println("=====================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "left") {
      testLeftChannel();
    }
    else if (command == "right") {
      testRightChannel();
    }
    else if (command == "both") {
      testBothChannels();
    }
    else if (command == "test") {
      quickTest();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void testLeftChannel() {
  Serial.println("=== Testing LEFT Channel (L/R=GND) ===");
  
  resetI2S();
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,  // INMP441 outputs 32-bit
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,   // LEFT channel only
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 128,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  if (i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL) == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 26,
      .ws_io_num = 25,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 22
    };
    
    if (i2s_set_pin(I2S_NUM_0, &pin_config) == ESP_OK) {
      Serial.println("✓ LEFT channel configured");
      testAudio("LEFT");
    }
  }
}

void testRightChannel() {
  Serial.println("=== Testing RIGHT Channel (L/R=3.3V) ===");
  
  resetI2S();
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_RIGHT,  // RIGHT channel only
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 128,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  if (i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL) == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 26,
      .ws_io_num = 25,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 22
    };
    
    if (i2s_set_pin(I2S_NUM_0, &pin_config) == ESP_OK) {
      Serial.println("✓ RIGHT channel configured");
      Serial.println("NOTE: This requires L/R pin connected to 3.3V");
      testAudio("RIGHT");
    }
  }
}

void testBothChannels() {
  Serial.println("=== Testing STEREO (Both Channels) ===");
  
  resetI2S();
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,  // Both channels
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 128,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  if (i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL) == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 26,
      .ws_io_num = 25,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 22
    };
    
    if (i2s_set_pin(I2S_NUM_0, &pin_config) == ESP_OK) {
      Serial.println("✓ STEREO configured");
      testAudio("STEREO");
    }
  }
}

void testAudio(String mode) {
  Serial.println("Testing audio for 5 seconds - MAKE NOISE!");
  digitalWrite(LED_PIN, HIGH);
  
  i2s_start(I2S_NUM_0);
  delay(100);
  
  unsigned long startTime = millis();
  int validSamples = 0;
  int totalSamples = 0;
  
  while (millis() - startTime < 5000) {
    int32_t buffer[8];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        totalSamples++;
        
        // Convert 32-bit to 16-bit
        int16_t sample = (buffer[i] >> 16) & 0xFFFF;
        
        // Check if it's not constant -1 or 0
        if (sample != -1 && sample != 0 && abs(sample) > 10) {
          validSamples++;
          
          // Show first few valid samples
          if (validSamples <= 10) {
            Serial.print(sample);
            Serial.print(" ");
            if (validSamples % 8 == 0) Serial.println();
          }
        }
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println();
  Serial.println("=== " + mode + " Results ===");
  Serial.println("Total samples: " + String(totalSamples));
  Serial.println("Valid samples: " + String(validSamples));
  Serial.println("Success rate: " + String((validSamples * 100) / max(1, totalSamples)) + "%");
  
  if (validSamples > 0) {
    Serial.println("✓ " + mode + " channel is working!");
  } else {
    Serial.println("✗ " + mode + " channel getting constant values");
  }
  Serial.println("========================");
}

void quickTest() {
  Serial.println("Quick test with current configuration...");
  
  resetI2S();
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 128,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  if (i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL) == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 26,
      .ws_io_num = 25,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 22
    };
    
    if (i2s_set_pin(I2S_NUM_0, &pin_config) == ESP_OK) {
      i2s_start(I2S_NUM_0);
      delay(100);
      
      int32_t buffer[4];
      size_t bytes_read;
      
      i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 1000);
      
      Serial.print("Quick sample: ");
      for (int i = 0; i < 4; i++) {
        int16_t sample = (buffer[i] >> 16) & 0xFFFF;
        Serial.print(sample);
        Serial.print(" ");
      }
      Serial.println();
    }
  }
}

void resetI2S() {
  i2s_driver_uninstall(I2S_NUM_0);
  delay(100);
}