// Minimal Safe ESP32 + INMP441 Test
// This version is designed to NOT crash

#define LED_PIN 2

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // Wait for serial to stabilize
  delay(2000);
  
  // Blink LED to show we're alive
  for(int i = 0; i < 5; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
  
  Serial.println("=== Minimal ESP32 Test ===");
  Serial.println("ESP32 is running safely");
  Serial.println("Commands:");
  Serial.println("- test: Basic test");
  Serial.println("- blink: Blink LED");
  Serial.println("- pins: Check pin states");
  Serial.println("========================");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "test") {
      Serial.println("✓ ESP32 working");
      Serial.println("✓ Serial communication OK");
      Serial.println("✓ No crashes detected");
    } 
    else if (command == "blink") {
      Serial.println("Blinking LED...");
      for(int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(200);
        digitalWrite(LED_PIN, LOW);
        delay(200);
      }
      Serial.println("LED blink complete");
    }
    else if (command == "pins") {
      Serial.println("Pin States:");
      Serial.println("D22: " + String(digitalRead(22)));
      Serial.println("D25: " + String(digitalRead(25)));
      Serial.println("D26: " + String(digitalRead(26)));
    }
    else {
      Serial.println("Unknown command: " + command);
      Serial.println("Available: test, blink, pins");
    }
  }
  
  delay(100);  // Longer delay to prevent issues
}