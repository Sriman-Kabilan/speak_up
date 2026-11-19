// INMP441 L/R Pin Fix - Corrected Version
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
  
  Serial.println("=== INMP441 L/R Pin Fix ===");
  Serial.println("Getting constant -1 values means L/R pin issue");
  Serial.println("");
  Serial.println("Commands:");
  Serial.println("- disconnect: Test with L/R pin disconnected");
  Serial.println("- left: Test LEFT channel (L/R=GND)");
  Serial.println("- right: Test RIGHT channel (L/R=3.3V)");
  Serial.println("- auto: Try all configurations");
  Serial.println("- fix: Physical connection guide");
  Serial.println("===============================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "disconnect") {
      testDisconnected();
    }
    else if (command == "left") {
      testLeftChannel();
    }
    else if (command == "right") {
      testRightChannel();
    }
    else if (command == "auto") {
      autoTest();
    }
    else if (command == "fix") {
      showFixGuide();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void testDisconnected() {
  Serial.println("=== Test with L/R Disconnected ===");
  Serial.println("PHYSICALLY disconnect L/R pin now!");
  Serial.println("L/R floating = RIGHT channel");
  
  delay(3000); // Give time to disconnect
  
  if (setupI2S(I2S_CHANNEL_FMT_ONLY_RIGHT)) {
    Serial.println("Testing RIGHT channel (L/R disconnected)...");
    testAudio("DISCONNECTED");
  }
}

void testLeftChannel() {
  Serial.println("=== Test LEFT Channel ===");
  Serial.println("Make sure L/R pin is connected to GND");
  
  if (setupI2S(I2S_CHANNEL_FMT_ONLY_LEFT)) {
    Serial.println("Testing LEFT channel (L/R=GND)...");
    testAudio("LEFT");
  }
}

void testRightChannel() {
  Serial.println("=== Test RIGHT Channel ===");
  Serial.println("Connect L/R pin to 3.3V or leave floating");
  
  if (setupI2S(I2S_CHANNEL_FMT_ONLY_RIGHT)) {
    Serial.println("Testing RIGHT channel (L/R=3.3V)...");
    testAudio("RIGHT");
  }
}

void autoTest() {
  Serial.println("=== Auto Test All Configurations ===");
  
  Serial.println("1. Testing LEFT channel...");
  if (setupI2S(I2S_CHANNEL_FMT_ONLY_LEFT)) {
    if (quickTest()) {
      Serial.println("✓ LEFT channel works! L/R should be connected to GND");
      return;
    }
  }
  
  Serial.println("2. Testing RIGHT channel...");
  if (setupI2S(I2S_CHANNEL_FMT_ONLY_RIGHT)) {
    if (quickTest()) {
      Serial.println("✓ RIGHT channel works! L/R should be floating or connected to 3.3V");
      return;
    }
  }
  
  Serial.println("3. Testing STEREO...");
  if (setupI2S(I2S_CHANNEL_FMT_RIGHT_LEFT)) {
    if (quickTest()) {
      Serial.println("✓ STEREO works! Mixed channel configuration");
      return;
    }
  }
  
  Serial.println("✗ No configuration works - hardware issue");
  Serial.println("Check all connections and power");
}

bool setupI2S(i2s_channel_fmt_t channel_format) {
  // Reset I2S
  i2s_driver_uninstall(I2S_NUM_0);
  delay(200);
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = channel_format,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  if (i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL) != ESP_OK) {
    Serial.println("✗ I2S driver install failed");
    return false;
  }
  
  i2s_pin_config_t pin_config = {
    .bck_io_num = 26,    // D26
    .ws_io_num = 25,     // D25
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = 22    // D22
  };
  
  if (i2s_set_pin(I2S_NUM_0, &pin_config) != ESP_OK) {
    Serial.println("✗ I2S pin config failed");
    i2s_driver_uninstall(I2S_NUM_0);
    return false;
  }
  
  i2s_start(I2S_NUM_0);
  delay(100);
  return true;
}

void testAudio(String mode) {
  Serial.println("Testing " + mode + " for 5 seconds - MAKE LOUD NOISE!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int totalSamples = 0;
  int validSamples = 0;
  int constantMinusOne = 0;
  
  while (millis() - startTime < 5000) {
    int32_t buffer[8];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        totalSamples++;
        
        if (buffer[i] == -1) {
          constantMinusOne++;
        } else {
          // Convert to 16-bit
          int16_t sample = (buffer[i] >> 16) & 0xFFFF;
          
          if (abs(sample) > 10) {
            validSamples++;
            
            // Show first few valid samples
            if (validSamples <= 20) {
              Serial.print(sample);
              Serial.print(" ");
              if (validSamples % 10 == 0) Serial.println();
            }
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
  Serial.println("Constant -1: " + String(constantMinusOne));
  Serial.println("Valid audio: " + String(validSamples));
  Serial.println("Success rate: " + String((validSamples * 100) / max(1, totalSamples)) + "%");
  
  if (validSamples > 10) {
    Serial.println("✓ " + mode + " configuration WORKS!");
    Serial.println("Use this configuration for recording");
  } else if (constantMinusOne > totalSamples * 0.9) {
    Serial.println("✗ Getting constant -1 - wrong L/R pin configuration");
  } else {
    Serial.println("⚠ Some data but mostly noise");
  }
  Serial.println("========================");
}

bool quickTest() {
  int32_t buffer[16];
  size_t bytes_read;
  int validCount = 0;
  
  for (int i = 0; i < 10; i++) {
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int j = 0; j < samples; j++) {
        if (buffer[j] != -1 && buffer[j] != 0) {
          validCount++;
        }
      }
    }
    delay(50);
  }
  
  return validCount > 5;
}

void showFixGuide() {
  Serial.println("=== Physical L/R Pin Fix Guide ===");
  Serial.println("");
  Serial.println("Current issue: Getting constant -1 values");
  Serial.println("This means L/R pin configuration is wrong");
  Serial.println("");
  Serial.println("Try these steps IN ORDER:");
  Serial.println("");
  Serial.println("STEP 1: Disconnect L/R pin completely");
  Serial.println("- Pull the L/R wire out");
  Serial.println("- Run 'disconnect' command");
  Serial.println("- If this works, leave L/R disconnected!");
  Serial.println("");
  Serial.println("STEP 2: If step 1 fails, connect L/R to 3.3V");
  Serial.println("- Connect L/R pin to 3.3V on ESP32");
  Serial.println("- Run 'right' command");
  Serial.println("");
  Serial.println("STEP 3: If step 2 fails, ensure solid GND connection");
  Serial.println("- Make sure L/R has solid connection to GND");
  Serial.println("- Use multimeter to verify 0V on L/R pin");
  Serial.println("- Run 'left' command");
  Serial.println("");
  Serial.println("MOST LIKELY FIX: Disconnect L/R pin completely");
  Serial.println("Many INMP441 boards work better with L/R floating");
  Serial.println("=================================");
}