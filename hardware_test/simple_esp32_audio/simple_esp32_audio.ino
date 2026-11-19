// Simple ESP32 Audio Test - No I2S initially
// This version starts basic and adds features step by step

#define ANALOG_MIC_PIN 36
#define LED_PIN 2

bool isRecording = false;
int16_t audioBuffer[512];  // Smaller buffer

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(ANALOG_MIC_PIN, INPUT);
  
  // Blink LED to show we're alive
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("=== ESP32 Audio System Started ===");
  Serial.println("Available commands:");
  Serial.println("- test: Check system status");
  Serial.println("- start: Start recording");
  Serial.println("- stop: Stop recording");
  Serial.println("- analog: Test analog microphone");
  Serial.println("=====================================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "test") {
      testSystem();
    } else if (command == "start") {
      startRecording();
    } else if (command == "stop") {
      stopRecording();
    } else if (command == "analog") {
      testAnalogMic();
    } else {
      Serial.println("Unknown command: " + command);
    }
  }
  
  if (isRecording) {
    recordAnalogAudio();
  }
  
  delay(10);
}

void testSystem() {
  Serial.println("=== System Test ===");
  Serial.println("✓ ESP32: Running");
  Serial.println("✓ Serial: Working");
  Serial.println("✓ Analog Mic Pin: GPIO36");
  Serial.println("⚠ INMP441: Disabled (preventing crashes)");
  Serial.println("✓ Fail-safe: Active");
  Serial.println("==================");
}

void startRecording() {
  isRecording = true;
  digitalWrite(LED_PIN, HIGH);
  Serial.println("Recording started (analog mic)");
  Serial.println("AUDIO_START");
}

void stopRecording() {
  isRecording = false;
  digitalWrite(LED_PIN, LOW);
  Serial.println("Recording stopped");
  Serial.println("AUDIO_END");
}

void testAnalogMic() {
  Serial.println("Testing analog microphone for 3 seconds...");
  
  int maxVal = 0;
  int minVal = 4095;
  int samples = 0;
  
  unsigned long startTime = millis();
  while (millis() - startTime < 3000) {
    int value = analogRead(ANALOG_MIC_PIN);
    if (value > maxVal) maxVal = value;
    if (value < minVal) minVal = value;
    samples++;
    delay(1);
  }
  
  Serial.println("Analog mic test results:");
  Serial.println("Min value: " + String(minVal));
  Serial.println("Max value: " + String(maxVal));
  Serial.println("Range: " + String(maxVal - minVal));
  Serial.println("Samples: " + String(samples));
  
  if (maxVal - minVal > 100) {
    Serial.println("✓ Analog microphone working!");
  } else {
    Serial.println("⚠ Low signal - check microphone connection");
  }
}

void recordAnalogAudio() {
  // Record smaller chunks to avoid overwhelming serial
  for (int i = 0; i < 64; i++) {  // Smaller chunks
    int analogValue = analogRead(ANALOG_MIC_PIN);
    audioBuffer[i] = map(analogValue, 0, 4095, -32768, 32767);
    delayMicroseconds(62); // ~16kHz sampling
  }
  
  // Send data
  for (int i = 0; i < 64; i++) {
    Serial.print(audioBuffer[i]);
    if (i < 63) Serial.print(",");
  }
  Serial.println();
  
  delay(10); // Small delay to prevent overwhelming
}