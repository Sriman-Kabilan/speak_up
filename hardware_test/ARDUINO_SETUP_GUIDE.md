# Arduino IDE Setup & Fail-Safe Audio System Guide

## Step-by-Step Arduino IDE Setup

### 1. Install Arduino IDE
- Download from: https://www.arduino.cc/en/software
- Install and launch Arduino IDE

### 2. Add ESP32 Board Support
1. **File → Preferences**
2. In "Additional Board Manager URLs" add:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
3. Click "OK"
4. **Tools → Board → Boards Manager**
5. Search "ESP32"
6. Install "ESP32 by Espressif Systems" (latest version)

### 3. Install Required Libraries
1. **Sketch → Include Library → Manage Libraries**
2. Search and install:
   - **ArduinoJson** (by Benoit Blanchon)
   - **WebSockets** (by Markus Sattler)

### 4. Configure Board Settings
1. **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
2. **Tools → Port → COM13** (your detected port)
3. **Tools → Upload Speed → 115200**
4. **Tools → Flash Frequency → 80MHz**
5. **Tools → Partition Scheme → Default 4MB**

## Hardware Connections (INMP441)

```
ESP32    →    INMP441
GND      →    GND
3.3V     →    VDD
GPIO32   →    SCK (Serial Clock)
GPIO25   →    WS (Word Select)
GPIO33   →    SD (Serial Data)
GND      →    L/R (Left/Right - connect to GND for LEFT)
```

## Upload Process

### 1. Open Arduino Code
1. **File → Open**
2. Select: `S:\SpeakUp_native\hardware_test\failsafe_audio_recorder.ino`

### 2. Upload to ESP32
1. Connect ESP32 via USB
2. Press **Upload** button (→)
3. If upload fails, hold **BOOT** button on ESP32 during upload

### 3. Open Serial Monitor
1. **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see: "Audio system ready - Type 'start' or 'stop'"

## Fail-Safe Audio System Features

### 🎯 Multiple Audio Sources
1. **Primary**: ESP32 + INMP441 (I2S digital microphone)
2. **Backup 1**: ESP32 + Analog microphone (GPIO36)
3. **Backup 2**: Laptop/PC microphone
4. **Existing**: Mobile/Web app (unchanged)

### 🔄 Automatic Fallback
- If INMP441 fails → Switch to analog mic
- If ESP32 fails → Switch to laptop mic
- If hardware fails → Mobile/Web still works

### 🌐 Web Integration Ready
- WebSocket server on port 81
- Can integrate with existing React Native app
- No changes needed to current mobile/web functionality

## Testing Instructions

### 1. Test Arduino Upload
```bash
# In Arduino IDE Serial Monitor, type:
test
```
Expected output:
```
=== Audio Source Test ===
Primary: INMP441 (I2S) - ACTIVE
Backup: Analog mic - STANDBY
Web/Mobile: Available via WebSocket
========================
```

### 2. Test Python Integration
```bash
cd S:\SpeakUp_native\hardware_test
python failsafe_audio_system.py
```

### 3. Test Recording
```bash
# In Serial Monitor, type:
start
# Wait 3 seconds, then type:
stop
```

### 4. Test with SpeakUp Backend
```bash
# Make sure backend is running:
cd S:\SpeakUp_native\backend
python app.py

# Then run fail-safe system:
python failsafe_audio_system.py
# Choose option 2: "Test with backend"
```

## Troubleshooting

### ESP32 Not Detected
1. Install CP2102 USB drivers
2. Try different USB cable
3. Press RESET button on ESP32

### INMP441 Not Working
1. Check wiring connections
2. Ensure L/R pin connected to GND
3. System will auto-fallback to analog mic

### Upload Errors
1. Hold BOOT button during upload
2. Check COM port selection
3. Try lower upload speed (115200)

### Audio Quality Issues
1. Check microphone connections
2. Test different audio sources
3. Adjust sample rate if needed

## Integration with Existing App

### No Changes Required
- Your current mobile/web app continues working
- This adds hardware option without breaking existing functionality
- Backend API remains the same

### Optional Web Integration
```javascript
// Add to your React Native app if desired
const ws = new WebSocket('ws://ESP32_IP:81');
ws.send('start_recording');
```

## File Structure
```
S:\SpeakUp_native\hardware_test\
├── failsafe_audio_recorder.ino    # Arduino firmware
├── failsafe_audio_system.py       # Python integration
├── ARDUINO_SETUP_GUIDE.md         # This guide
└── [other test files...]
```

## Success Indicators

✅ **Arduino IDE Setup Complete**
- ESP32 board installed
- Libraries installed
- Code uploads successfully

✅ **Hardware Working**
- Serial monitor shows "Audio system ready"
- "test" command shows active audio source
- Recording produces audio data

✅ **Integration Working**
- Python script detects ESP32
- Audio recording successful
- Backend evaluation works

✅ **Fail-Safe Working**
- Multiple audio sources detected
- Automatic fallback on failure
- Existing mobile/web unaffected