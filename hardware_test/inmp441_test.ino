#include "driver/i2s.h"

// I2S configuration
#define I2S_WS 25
#define I2S_SD 22
#define I2S_SCK 26
#define I2S_PORT I2S_NUM_0
#define I2S_SAMPLE_RATE 16000
#define I2S_SAMPLE_BITS 16
#define I2S_READ_LEN (16 * 1024)
#define RECORD_TIME 5  // seconds
#define I2S_CHANNEL_NUM 1
#define FLASH_RECORD_SIZE (I2S_CHANNEL_NUM * I2S_SAMPLE_RATE * I2S_SAMPLE_BITS / 8) * RECORD_TIME

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 + INMP441 Test Starting...");
  
  delay(1000);
  i2sInit();
  delay(500);
  
  Serial.println("Recording for 5 seconds...");
  i2s_adc_data_scale adc_data;
  size_t bytes_read;
  
  for (int i = 0; i < RECORD_TIME; i++) {
    i2s_read(I2S_PORT, (void*)&adc_data, sizeof(adc_data), &bytes_read, portMAX_DELAY);
    Serial.print("Second "); Serial.print(i+1); 
    Serial.print(" - Audio Level: "); Serial.println(abs(adc_data.type2.data[0]));
    delay(1000);
  }
  
  Serial.println("Test complete!");
}

void loop() {
  // Continuous audio monitoring
  int32_t sample = 0;
  size_t bytes_read = 0;
  
  i2s_read(I2S_PORT, &sample, sizeof(sample), &bytes_read, 100);
  
  if (bytes_read > 0) {
    int16_t audio_sample = sample & 0xFFFF;
    int audio_level = abs(audio_sample);
    
    // Print audio level every 100ms if there's sound
    if (audio_level > 1000) {
      Serial.print("Audio detected: ");
      Serial.println(audio_level);
    }
  }
  
  delay(100);
}

void i2sInit() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = I2S_SAMPLE_RATE,
    .bits_per_sample = i2s_bits_per_sample_t(I2S_SAMPLE_BITS),
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,  // FORCE LEFT CHANNEL
    .communication_format = i2s_comm_format_t(I2S_COMM_FORMAT_STAND_I2S),
    .intr_alloc_flags = 0,
    .dma_buf_count = 64,
    .dma_buf_len = 1024,
    .use_apll = 1
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };

  esp_err_t result = i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  if (result != ESP_OK) {
    Serial.print("Error installing I2S driver: ");
    Serial.println(result);
    return;
  }

  result = i2s_set_pin(I2S_PORT, &pin_config);
  if (result != ESP_OK) {
    Serial.print("Error setting I2S pins: ");
    Serial.println(result);
    return;
  }

  Serial.println("I2S driver installed successfully");
}