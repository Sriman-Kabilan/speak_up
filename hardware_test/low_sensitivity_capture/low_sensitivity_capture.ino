// INMP441 Audio Capture - Low Sensitivity Version
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
  
  Serial.println("=== INMP441 Low Sensitivity Capture ===");
  Serial.println("L/R pin issue fixed - no more constant -1!");
  Serial.println("Now testing with very low sensitivity");
  Serial.println("");
  Serial.println("Commands:");
  Serial.println("- show: Show actual audio values");
  Serial.println("- sensitive: Ultra-sensitive recording");
  Serial.println("- record: Record for backend");
  Serial.println("- test: Quick audio test");
  Serial.println("=====================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "show") {
      showAudioValues();
    }
    else if (command == "sensitive") {
      ultraSensitiveRecording();
    }
    else if (command == "record") {
      recordForBackend();
    }
    else if (command == "test") {
      quickAudioTest();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void showAudioValues() {
  Serial.println("=== Show Actual Audio Values ===");
  
  setupI2S();
  
  Serial.println("Showing 50 raw audio samples...");
  digitalWrite(LED_PIN, HIGH);
  
  int32_t buffer[50];
  size_t bytes_read;
  
  esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 2000);
  
  if (result == ESP_OK && bytes_read > 0) {
    int samples = bytes_read / sizeof(int32_t);
    
    Serial.println("Raw 32-bit values:");
    for (int i = 0; i < min(20, samples); i++) {
      Serial.println("Sample " + String(i) + ": " + String(buffer[i]));
    }
    
    Serial.println("\nConverted 16-bit values:");
    for (int i = 0; i < min(20, samples); i++) {
      int16_t sample = (buffer[i] >> 16) & 0xFFFF;
      Serial.println("Sample " + String(i) + ": " + String(sample));
    }
    
    Serial.println("\nAlternative bit shifts:");
    for (int i = 0; i < min(10, samples); i++) {
      int16_t shift16 = (buffer[i] >> 16) & 0xFFFF;
      int16_t shift8 = (buffer[i] >> 8) & 0xFFFF;
      int16_t shift0 = buffer[i] & 0xFFFF;
      
      Serial.println("Sample " + String(i) + " - >>16:" + String(shift16) + 
                    " >>8:" + String(shift8) + " >>0:" + String(shift0));
    }
  }
  
  digitalWrite(LED_PIN, LOW);
  Serial.println("=================================");
}

void ultraSensitiveRecording() {
  Serial.println("=== Ultra-Sensitive Recording ===");
  
  setupI2S();
  
  Serial.println("Recording for 5 seconds - detecting ANY change!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int totalSamples = 0;
  int changingSamples = 0;
  int32_t lastValue = 0;
  bool firstSample = true;
  
  while (millis() - startTime < 5000) {
    int32_t buffer[8];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        totalSamples++;
        
        if (!firstSample && buffer[i] != lastValue) {
          changingSamples++;
          
          // Show first 30 changing samples
          if (changingSamples <= 30) {
            int16_t sample = (buffer[i] >> 16) & 0xFFFF;
            Serial.print(sample);
            Serial.print(" ");
            if (changingSamples % 10 == 0) Serial.println();
          }
        }
        
        lastValue = buffer[i];
        firstSample = false;
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println();
  Serial.println("=== Ultra-Sensitive Results ===");
  Serial.println("Total samples: " + String(totalSamples));
  Serial.println("Changing samples: " + String(changingSamples));
  Serial.println("Change rate: " + String((changingSamples * 100) / max(1, totalSamples)) + "%");
  
  if (changingSamples > 0) {
    Serial.println("✓ INMP441 is working - detecting audio changes!");
  } else {
    Serial.println("✗ No audio changes detected");
  }
  Serial.println("===============================");
}

void recordForBackend() {
  Serial.println("=== Recording for SpeakUp Backend ===");
  
  setupI2S();
  
  Serial.println("Recording 3 seconds for backend...");
  Serial.println("AUDIO_START");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  
  while (millis() - startTime < 3000) {
    int32_t buffer[32];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      // Convert to 16-bit and send
      for (int i = 0; i < samples; i++) {
        int16_t sample = (buffer[i] >> 16) & 0xFFFF;
        Serial.print(sample);
        if (i < samples - 1) Serial.print(",");
      }
      Serial.println();
    }
    
    delay(10);
  }
  
  digitalWrite(LED_PIN, LOW);
  Serial.println("AUDIO_END");
  Serial.println("=== Recording Complete ===");
}

void quickAudioTest() {
  Serial.println("=== Quick Audio Test ===");
  
  setupI2S();
  
  Serial.println("Testing for 3 seconds - make noise!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int minVal = 32767;
  int maxVal = -32768;
  int sampleCount = 0;
  
  while (millis() - startTime < 3000) {
    int32_t buffer[16];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        int16_t sample = (buffer[i] >> 16) & 0xFFFF;
        
        if (sample < minVal) minVal = sample;
        if (sample > maxVal) maxVal = sample;
        sampleCount++;
        
        // Show some samples
        if (sampleCount <= 20) {
          Serial.print(sample);
          Serial.print(" ");
          if (sampleCount % 10 == 0) Serial.println();
        }
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println();
  Serial.println("=== Quick Test Results ===");
  Serial.println("Samples: " + String(sampleCount));
  Serial.println("Min value: " + String(minVal));
  Serial.println("Max value: " + String(maxVal));
  Serial.println("Range: " + String(maxVal - minVal));
  
  if (maxVal - minVal > 100) {
    Serial.println("✓ Good audio range - microphone working!");
  } else if (maxVal - minVal > 10) {
    Serial.println("⚠ Small audio range - check microphone sensitivity");
  } else {
    Serial.println("✗ No audio range - check connections");
  }
  Serial.println("=========================");
}

bool setupI2S() {
  // Reset I2S
  i2s_driver_uninstall(I2S_NUM_0);
  delay(200);
  
  // Use LEFT channel (L/R connected to GND)
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 4,
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