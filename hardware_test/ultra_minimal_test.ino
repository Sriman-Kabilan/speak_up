void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("ESP32 Basic Test - No I2S");
}

void loop() {
  Serial.println("Running...");
  delay(2000);
}