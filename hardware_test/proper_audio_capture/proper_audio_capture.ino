// INMP441 Proper Audio Capture
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
  
  Serial.println("=== INMP441 Proper Audio Capture ===");
  Serial.println("Based on previous tests:");
  Serial.println("- RIGHT channel works better");
  Serial.println("- Got sample value 512 (proof it works!)");
  Serial.println("- Need better bit handling");
  Serial.println("");
  Serial.println("Commands:");
  Serial.println("- capture: Capture and show all audio data");
  Serial.println("- sensitive: High sensitivity recording");
  Serial.println("- raw: Show raw 32-bit values");
  Serial.println("- record: Record for SpeakUp backend");
  Serial.println("=====================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "capture") {
      captureAudio();
    }
    else if (command == "sensitive") {
      sensitiveRecording();
    }
    else if (command == "raw") {
      showRawData();
    }
    else if (command == "record") {
      recordForBackend();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void captureAudio() {
  Serial.println("=== Audio Capture (All Data) ===");
  
  setupI2S();
  
  Serial.println("Recording for 5 seconds - MAKE NOISE!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int sampleCount = 0;
  
  while (millis() - startTime < 5000) {
    int32_t buffer[16];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      // Show first 100 samples with different bit extractions
      if (sampleCount < 100) {
        for (int i = 0; i < min(4, samples); i++) {
          int32_t raw = buffer[i];
          int16_t upper16 = (raw >> 16) & 0xFFFF;
          int16_t lower16 = raw & 0xFFFF;
          int16_t shifted = (raw >> 8) & 0xFFFF;
          
          Serial.print("Raw:");
          Serial.print(raw);
          Serial.print(" U16:");
          Serial.print(upper16);
          Serial.print(" L16:");
          Serial.print(lower16);
          Serial.print(" S8:");
          Serial.print(shifted);
          Serial.println();
          
          sampleCount++;
        }
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  Serial.println("=== Capture Complete ===");
}

void sensitiveRecording() {
  Serial.println("=== High Sensitivity Recording ===");
  
  setupI2S();
  
  Serial.println("Recording for 5 seconds - ANY sound will be detected!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int totalSamples = 0;
  int nonZeroSamples = 0;
  int significantSamples = 0;
  
  while (millis() - startTime < 5000) {
    int32_t buffer[8];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        totalSamples++;
        
        int32_t raw = buffer[i];
        int16_t sample = (raw >> 16) & 0xFFFF;
        
        // Count non-zero samples
        if (sample != 0 && sample != -1) {
          nonZeroSamples++;
        }
        
        // Count significant samples (any change)
        if (abs(sample) > 1) {
          significantSamples++;
          
          // Show first 20 significant samples
          if (significantSamples <= 20) {
            Serial.print(sample);
            Serial.print(" ");
            if (significantSamples % 10 == 0) Serial.println();
          }
        }
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println();
  Serial.println("=== Sensitivity Results ===");
  Serial.println("Total samples: " + String(totalSamples));
  Serial.println("Non-zero samples: " + String(nonZeroSamples));
  Serial.println("Significant samples: " + String(significantSamples));
  Serial.println("Non-zero rate: " + String((nonZeroSamples * 100) / max(1, totalSamples)) + "%");
  Serial.println("Significant rate: " + String((significantSamples * 100) / max(1, totalSamples)) + "%");
  Serial.println("==========================");
}

void showRawData() {
  Serial.println("=== Raw 32-bit Data ===");
  
  setupI2S();
  
  Serial.println("Showing 20 raw samples...");
  
  int32_t buffer[20];
  size_t bytes_read;
  
  esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 2000);
  
  if (result == ESP_OK && bytes_read > 0) {
    int samples = bytes_read / sizeof(int32_t);
    
    for (int i = 0; i < samples; i++) {
      Serial.println("Sample " + String(i) + ": " + String(buffer[i]) + " (0x" + String(buffer[i], HEX) + ")");
    }
  }
  
  Serial.println("======================");
}

void recordForBackend() {
  Serial.println("=== Recording for SpeakUp Backend ===");
  
  setupI2S();
  
  Serial.println("Recording 3 seconds for backend processing...");
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

void setupI2S() {
  // Reset I2S
  i2s_driver_uninstall(I2S_NUM_0);
  delay(100);
  
  // Use RIGHT channel config (worked better in previous test)
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_RIGHT,  // RIGHT channel
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 4,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  
  i2s_pin_config_t pin_config = {
    .bck_io_num = 26,    // D26
    .ws_io_num = 25,     // D25
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = 22    // D22
  };
  
  i2s_set_pin(I2S_NUM_0, &pin_config);
  i2s_start(I2S_NUM_0);
  delay(100);
}