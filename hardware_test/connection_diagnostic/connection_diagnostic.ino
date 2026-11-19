// INMP441 Connection Diagnostic Tool
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
  
  Serial.println("=== INMP441 Connection Diagnostic ===");
  Serial.println("Getting all zeros - connection issue");
  Serial.println("");
  Serial.println("Commands:");
  Serial.println("- check: Check all pin connections");
  Serial.println("- power: Test power connections");
  Serial.println("- pins: Test data/clock pins");
  Serial.println("- wiggle: Test while wiggling wires");
  Serial.println("- simple: Simple microphone test");
  Serial.println("=====================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "check") {
      checkAllConnections();
    }
    else if (command == "power") {
      testPowerConnections();
    }
    else if (command == "pins") {
      testDataClockPins();
    }
    else if (command == "wiggle") {
      wiggleTest();
    }
    else if (command == "simple") {
      simpleMicTest();
    }
    else {
      Serial.println("Unknown: " + command);
    }
  }
  
  delay(100);
}

void checkAllConnections() {
  Serial.println("=== Connection Check ===");
  Serial.println("Current wiring should be:");
  Serial.println("  ESP32 GND  → INMP441 GND");
  Serial.println("  ESP32 3.3V → INMP441 VDD");
  Serial.println("  ESP32 D26  → INMP441 SCK");
  Serial.println("  ESP32 D25  → INMP441 WS");
  Serial.println("  ESP32 D22  → INMP441 SD");
  Serial.println("  ESP32 GND  → INMP441 L/R");
  Serial.println("");
  
  Serial.println("Physical checks to perform:");
  Serial.println("1. Are all wires firmly connected?");
  Serial.println("2. Is INMP441 getting power (LED on board)?");
  Serial.println("3. Are pin numbers correct on ESP32?");
  Serial.println("4. Is L/R pin straight (not bent)?");
  Serial.println("5. Are jumper wires good quality?");
  Serial.println("");
  
  Serial.println("GPIO Pin States:");
  Serial.println("D22 (SD): " + String(digitalRead(22)));
  Serial.println("D25 (WS): " + String(digitalRead(25)));
  Serial.println("D26 (SCK): " + String(digitalRead(26)));
  Serial.println("========================");
}

void testPowerConnections() {
  Serial.println("=== Power Connection Test ===");
  
  Serial.println("Testing 3.3V output...");
  
  // Test if we can read analog values (indicates power)
  int analogTest = analogRead(A0);
  Serial.println("Analog reference test: " + String(analogTest));
  
  if (analogTest > 0) {
    Serial.println("✓ ESP32 has power");
  } else {
    Serial.println("⚠ ESP32 power issue");
  }
  
  Serial.println("");
  Serial.println("INMP441 Power Check:");
  Serial.println("1. Look at INMP441 board - is there a small LED?");
  Serial.println("2. If LED exists, is it ON?");
  Serial.println("3. Use multimeter: measure 3.3V between VDD and GND");
  Serial.println("4. If no 3.3V, check VDD wire connection");
  Serial.println("");
  Serial.println("Common power issues:");
  Serial.println("- Loose VDD connection");
  Serial.println("- Wrong pin (using 5V instead of 3.3V)");
  Serial.println("- Bad jumper wire");
  Serial.println("- INMP441 damaged from bent pin");
  Serial.println("=============================");
}

void testDataClockPins() {
  Serial.println("=== Data/Clock Pin Test ===");
  
  Serial.println("Testing I2S pin initialization...");
  
  // Try to initialize I2S and see what happens
  i2s_driver_uninstall(I2S_NUM_0);
  delay(200);
  
  i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 8000,  // Lower sample rate
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,  // 16-bit
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 2,
    .dma_buf_len = 64,  // Small buffer
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  esp_err_t result = i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  Serial.println("I2S driver install: " + String(result));
  
  if (result == ESP_OK) {
    i2s_pin_config_t pin_config = {
      .bck_io_num = 26,
      .ws_io_num = 25,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = 22
    };
    
    result = i2s_set_pin(I2S_NUM_0, &pin_config);
    Serial.println("I2S pin config: " + String(result));
    
    if (result == ESP_OK) {
      Serial.println("✓ I2S pins configured successfully");
      
      i2s_start(I2S_NUM_0);
      delay(100);
      
      // Test reading
      int16_t buffer[10];
      size_t bytes_read;
      
      result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 1000);
      Serial.println("I2S read result: " + String(result));
      Serial.println("Bytes read: " + String(bytes_read));
      
      if (bytes_read > 0) {
        Serial.println("✓ I2S communication working");
        Serial.print("Sample data: ");
        for (int i = 0; i < 5; i++) {
          Serial.print(buffer[i]);
          Serial.print(" ");
        }
        Serial.println();
      } else {
        Serial.println("✗ No I2S data received");
      }
    } else {
      Serial.println("✗ I2S pin configuration failed");
    }
  } else {
    Serial.println("✗ I2S driver installation failed");
  }
  
  Serial.println("===========================");
}

void wiggleTest() {
  Serial.println("=== Wiggle Test ===");
  Serial.println("This test runs for 10 seconds");
  Serial.println("WIGGLE each wire while test runs:");
  Serial.println("1. Wiggle VDD wire");
  Serial.println("2. Wiggle GND wire");
  Serial.println("3. Wiggle SCK wire (D26)");
  Serial.println("4. Wiggle WS wire (D25)");
  Serial.println("5. Wiggle SD wire (D22)");
  Serial.println("6. Wiggle L/R wire");
  Serial.println("");
  
  setupBasicI2S();
  
  Serial.println("Starting wiggle test - WIGGLE WIRES NOW!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int changeCount = 0;
  int32_t lastValue = 0;
  bool firstRead = true;
  
  while (millis() - startTime < 10000) {
    int32_t buffer[4];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      for (int i = 0; i < 4; i++) {
        if (!firstRead && buffer[i] != lastValue) {
          changeCount++;
          Serial.println("CHANGE detected: " + String(buffer[i]) + " (was " + String(lastValue) + ")");
        }
        lastValue = buffer[i];
        firstRead = false;
      }
    }
    
    delay(100);
  }
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("=== Wiggle Results ===");
  Serial.println("Changes detected: " + String(changeCount));
  
  if (changeCount > 0) {
    Serial.println("✓ Found loose connection - secure the wire that caused changes!");
  } else {
    Serial.println("✗ No changes - all connections seem solid");
    Serial.println("Issue might be power or damaged INMP441");
  }
  Serial.println("=====================");
}

void simpleMicTest() {
  Serial.println("=== Simple Microphone Test ===");
  Serial.println("Testing if INMP441 responds to sound at all");
  
  setupBasicI2S();
  
  Serial.println("Make VERY LOUD noise for 5 seconds!");
  Serial.println("Clap, shout, tap the microphone!");
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long startTime = millis();
  int32_t minVal = 2147483647;
  int32_t maxVal = -2147483648;
  int totalSamples = 0;
  
  while (millis() - startTime < 5000) {
    int32_t buffer[8];
    size_t bytes_read;
    
    esp_err_t result = i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &bytes_read, 100);
    
    if (result == ESP_OK && bytes_read > 0) {
      int samples = bytes_read / sizeof(int32_t);
      
      for (int i = 0; i < samples; i++) {
        if (buffer[i] < minVal) minVal = buffer[i];
        if (buffer[i] > maxVal) maxVal = buffer[i];
        totalSamples++;
      }
    }
    
    delay(50);
  }
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("=== Simple Test Results ===");
  Serial.println("Total samples: " + String(totalSamples));
  Serial.println("Min value: " + String(minVal));
  Serial.println("Max value: " + String(maxVal));
  Serial.println("Range: " + String(maxVal - minVal));
  
  if (maxVal - minVal > 0) {
    Serial.println("✓ INMP441 is responding - some variation detected!");
  } else {
    Serial.println("✗ INMP441 not responding - hardware issue");
    Serial.println("Possible causes:");
    Serial.println("- No power to INMP441");
    Serial.println("- Damaged INMP441 (from bent pin)");
    Serial.println("- Wrong connections");
  }
  Serial.println("===========================");
}

bool setupBasicI2S() {
  i2s_driver_uninstall(I2S_NUM_0);
  delay(200);
  
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
  return true;
}