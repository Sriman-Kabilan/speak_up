// INMP441 L/R Pin Dynamic Test
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
  
  Serial.println("=== INMP441 L/R Pin Dynamic Test ===");
  Serial.println("We got sample '512' before, but now getting -1");
  Serial.println("This means L/R pin connection is inconsistent");
  Serial.println("");
  Serial.println("Commands:");
  Serial.println("- check: Check L/R pin physical connection");
  Serial.println("- force_left: Force LEFT channel with different configs");
  Serial.println("- force_right: Force RIGHT channel with different configs");
  Serial.println("- auto: Auto-detect working configuration");
  Serial.println("- fix: Try to fix L/R connection issue");
  Serial.println("=======================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "check") {
      checkLRPin();
    }
    else if (command == "force_left") {
      forceLeftChannel();
    }
    else if (command == "force_right") {
      forceRightChannel();
    }
    else if (command == "auto") {
      autoDetectConfig();
    }
    else if (command == "fix") {
      fixLRConnection();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void checkLRPin() {
  Serial.println("=== L/R Pin Connection Check ===");
  Serial.println("Current wiring should be:");
  Serial.println("  ESP32 GND → INMP441 L/R");
  Serial.println("");
  Serial.println("Physical check:");
  Serial.println("1. Is L/R pin physically connected to a wire?");
  Serial.println("2. Is that wire connected to ESP32 GND?");
  Serial.println("3. Is the connection solid (not loose)?");
  Serial.println("");
  Serial.println("Try this test:");
  Serial.println("- Disconnect L/R pin completely");
  Serial.println("- Run 'force_right' command");
  Serial.println("- If it works, L/R was floating");
  Serial.println("- Then connect L/R to GND and run 'force_left'");
  Serial.println("===============================");
}

void forceLeftChannel() {
  Serial.println("=== Force LEFT Channel Test ===");
  Serial.println("This assumes L/R pin is connected to GND");
  
  // Try multiple LEFT configurations
  Serial.println("Trying Config 1: Standard LEFT...");
  if (testConfig(I2S_CHANNEL_FMT_ONLY_LEFT, I2S_COMM_FORMAT_STAND_I2S)) {
    Serial.println("✓ Standard LEFT works!");
    return;
  }
  
  Serial.println("Trying Config 2: LEFT with MSB...");
  if (testConfig(I2S_CHANNEL_FMT_ONLY_LEFT, I2S_COMM_FORMAT_STAND_MSB)) {
    Serial.println("✓ LEFT with MSB works!");
    return;
  }
  
  Serial.println("Trying Config 3: LEFT with PCM...");
  if (testConfig(I2S_CHANNEL_FMT_ONLY_LEFT, I2S_COMM_FORMAT_PCM)) {
    Serial.println("✓ LEFT with PCM works!");
    return;
  }
  
  Serial.println("✗ All LEFT configurations failed");
  Serial.println("L/R pin might not be connected to GND");
}

void forceRightChannel() {
  Serial.println("=== Force RIGHT Channel Test ===");
  Serial.println("This assumes L/R pin is floating or connected to 3.3V");
  
  // Try multiple RIGHT configurations
  Serial.println("Trying Config 1: Standard RIGHT...");
  if (testConfig(I2S_CHANNEL_FMT_ONLY_RIGHT, I2S_COMM_FORMAT_STAND_I2S)) {
    Serial.println("✓ Standard RIGHT works!");
    return;
  }
  
  Serial.println("Trying Config 2: RIGHT with MSB...");
  if (testConfig(I2S_CHANNEL_FMT_ONLY_RIGHT, I2S_COMM_FORMAT_STAND_MSB)) {
    Serial.println("✓ RIGHT with MSB works!");
    return;
  }
  
  Serial.println("Trying Config 3: RIGHT with PCM...");
  if (testConfig(I2S_CHANNEL_FMT_ONLY_RIGHT, I2S_COMM_FORMAT_PCM)) {
    Serial.println("✓ RIGHT with PCM works!");
    return;
  }
  
  Serial.println("✗ All RIGHT configurations failed");
  Serial.println("Try disconnecting L/R pin completely");
}

void autoDetectConfig() {
  Serial.println("=== Auto-Detect Working Configuration ===");
  
  struct ConfigTest {
    i2s_channel_format_t channel;
    i2s_comm_format_t comm;
    String name;
  };
  
  ConfigTest configs[] = {
    {I2S_CHANNEL_FMT_ONLY_LEFT, I2S_COMM_FORMAT_STAND_I2S, "LEFT Standard"},
    {I2S_CHANNEL_FMT_ONLY_RIGHT, I2S_COMM_FORMAT_STAND_I2S, "RIGHT Standard"},
    {I2S_CHANNEL_FMT_RIGHT_LEFT, I2S_COMM_FORMAT_STAND_I2S, "STEREO Standard"},
    {I2S_CHANNEL_FMT_ONLY_LEFT, I2S_COMM_FORMAT_STAND_MSB, "LEFT MSB"},
    {I2S_CHANNEL_FMT_ONLY_RIGHT, I2S_COMM_FORMAT_STAND_MSB, "RIGHT MSB"},
    {I2S_CHANNEL_FMT_ONLY_LEFT, I2S_COMM_FORMAT_PCM, "LEFT PCM"},
    {I2S_CHANNEL_FMT_ONLY_RIGHT, I2S_COMM_FORMAT_PCM, "RIGHT PCM"}
  };
  
  for (int i = 0; i < 7; i++) {
    Serial.println("Testing: " + configs[i].name);
    if (testConfig(configs[i].channel, configs[i].comm)) {
      Serial.println("✓ FOUND WORKING CONFIG: " + configs[i].name);
      Serial.println("Use this configuration for recording!");
      return;
    }
    delay(500);
  }
  
  Serial.println("✗ No working configuration found");
  Serial.println("Hardware issue - check all connections");
}

bool testConfig(i2s_channel_format_t channel_fmt, i2s_comm_format_t comm_fmt) {
  // Reset I2S
  i2s_driver_uninstall(I2S_NUM_0);
  delay(100);
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = channel_fmt,
    .communication_format = comm_fmt,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 128,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  if (i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL) != ESP_OK) {
    return false;
  }
  
  i2s_pin_config_t pin_config = {
    .bck_io_num = 26,
    .ws_io_num = 25,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = 22
  };
  
  if (i2s_set_pin(I2S_NUM_0, &pin_config) != ESP_OK) {
    i2s_driver_uninstall(I2S_NUM_0);
    return false;
  }
  
  i2s_start(I2S_NUM_0);
  delay(100);
  
  // Test for valid data
  int32_t buffer[16];
  size_t bytes_read;
  int validSamples = 0;
  
  for (int test = 0; test < 5; test++) {
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 200);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        int16_t sample = (buffer[i] >> 16) & 0xFFFF;
        
        // Check for non-constant values
        if (sample != -1 && sample != 0 && abs(sample) > 5) {
          validSamples++;
          Serial.print(sample);
          Serial.print(" ");
        }
      }
    }
    delay(100);
  }
  
  if (validSamples > 0) {
    Serial.println();
    Serial.println("Valid samples found: " + String(validSamples));
    return true;
  }
  
  return false;
}

void fixLRConnection() {
  Serial.println("=== L/R Connection Fix Guide ===");
  Serial.println("Step 1: Disconnect L/R pin completely");
  Serial.println("Step 2: Run 'force_right' - should work if L/R was the issue");
  Serial.println("Step 3: If that works, L/R pin was causing problems");
  Serial.println("");
  Serial.println("Permanent fix options:");
  Serial.println("Option A: Leave L/R disconnected (floating = RIGHT channel)");
  Serial.println("Option B: Solder L/R directly to GND on INMP441 board");
  Serial.println("Option C: Use a different GPIO pin to control L/R");
  Serial.println("");
  Serial.println("Quick test: Touch L/R pin to different voltages:");
  Serial.println("- Touch to GND: Should work with LEFT channel");
  Serial.println("- Touch to 3.3V: Should work with RIGHT channel");
  Serial.println("- Leave floating: Should work with RIGHT channel");
  Serial.println("===============================");
}