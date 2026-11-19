#include "driver/i2s.h"
#include "esp_system.h"

// INMP441 I2S Configuration
#define I2S_WS 25          // Word Select (LRCLK)
#define I2S_SD 22          // Serial Data (DOUT)
#define I2S_SCK 26         // Serial Clock (BCLK)
#define I2S_PORT I2S_NUM_0
#define I2S_SAMPLE_RATE 16000
#define I2S_SAMPLE_BITS 16
#define I2S_READ_LEN (2 * 1024)
#define RECORD_TIME 5
#define I2S_CHANNEL_NUM 1

void setup() {
  Serial.begin(115200);
  Serial.println("INMP441 Audio Recorder Starting...");
  
  delay(1000);
  i2sInit();
  delay(500);
  
  Serial.println("INMP441 Ready - Speak into microphone!");
}

void loop() {
  // Continuous audio monitoring
  int32_t sample = 0;
  size_t bytes_read = 0;
  
  // Read I2S data
  esp_err_t result = i2s_read(I2S_PORT, &sample, sizeof(sample), &bytes_read, 100);
  
  if (result == ESP_OK && bytes_read > 0) {
    // Convert to 16-bit audio sample
    int16_t audio_sample = (sample >> 16) & 0xFFFF;
    int audio_level = abs(audio_sample);
    
    // Print audio level if significant
    if (audio_level > 500) {
      Serial.print("AUDIO:");
      Serial.println(audio_level);
    }
    
    // Send raw audio data for recording
    if (audio_level > 100) {
      Serial.print("SAMPLE:");
      Serial.println(audio_sample);
    }
  }
  
  delay(10); // Small delay to prevent overwhelming serial
}

void i2sInit() {
  // I2S configuration for INMP441
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = I2S_SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,  // INMP441 L/R = GND (LEFT)
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 1024,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  // I2S pin configuration for INMP441
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,      // GPIO26 -> SCK
    .ws_io_num = I2S_WS,        // GPIO25 -> WS  
    .data_out_num = -1,         // Not used
    .data_in_num = I2S_SD       // GPIO22 -> SD
  };

  // Install and start I2S driver
  esp_err_t result = i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  if (result != ESP_OK) {
    Serial.print("ERROR: I2S driver install failed: ");
    Serial.println(result);
    return;
  }

  result = i2s_set_pin(I2S_PORT, &pin_config);
  if (result != ESP_OK) {
    Serial.print("ERROR: I2S pin config failed: ");
    Serial.println(result);
    return;
  }

  Serial.println("I2S initialized successfully for INMP441");
  Serial.println("Pin Configuration:");
  Serial.println("  SCK (Clock): GPIO26");
  Serial.println("  WS (Word Select): GPIO25");
  Serial.println("  SD (Data): GPIO22");
  Serial.println("  L/R: Connected to GND (LEFT channel)");
}