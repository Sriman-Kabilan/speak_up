# INMP441 + ESP32 Testing Guide

## Hardware Setup

### Wiring Connections
```
ESP32 DevKit → INMP441 MEMS Microphone

ESP32 Pin    →  INMP441 Pin    →  Function
3.3V         →  VDD            →  Power (3.3V)
GND          →  GND            →  Ground
GPIO26       →  SCK            →  Serial Clock (I2S Bit Clock)
GPIO25       →  WS             →  Word Select (I2S LR Clock)
GPIO22       →  SD             →  Serial Data (I2S Data)
GND          →  L/R            →  Left Channel Select (CRITICAL!)
```

### Critical L/R Pin Configuration
- **L/R = GND**: Forces LEFT channel (recommended)
- **L/R = VDD**: Forces RIGHT channel
- **L/R = Floating**: WILL CAUSE ZERO READINGS!

## Software Setup

### Step 1: Arduino IDE Setup
1. Install ESP32 board package
2. Select "ESP32 Dev Module"
3. Set upload speed to 115200

### Step 2: Upload Test Code
1. Open `inmp441_test.ino` in Arduino IDE
2. Select correct COM port
3. Upload to ESP32
4. Open Serial Monitor (115200 baud)

### Step 3: Hardware Verification
Expected Serial Output:
```
ESP32 + INMP441 Test Starting...
I2S driver installed successfully
Recording for 5 seconds...
Second 1 - Audio Level: 1234
Second 2 - Audio Level: 2345
...
Audio detected: 3456
Audio detected: 4567
```

## Testing Scenarios

### Test 1: L/R Pin = GND (Left Channel)
- Wire L/R to GND
- Should see consistent audio levels
- ✅ Expected: Audio data on left channel

### Test 2: L/R Pin = VDD (Right Channel)  
- Wire L/R to 3.3V
- Should see consistent audio levels
- ✅ Expected: Audio data on right channel

### Test 3: L/R Pin Floating (Should Fail)
- Leave L/R disconnected
- ❌ Expected: Zero readings, intermittent data

## Backend Integration Test

### Step 1: Start SpeakUp Backend
```bash
cd backend
python app.py
```

### Step 2: Record Audio with ESP32
```bash
cd hardware_test
python test_inmp441.py
```

### Step 3: Test Pronunciation Evaluation
- Script will record 3 seconds of audio
- Save as WAV file
- Send to backend for evaluation
- Check pronunciation score

## Expected Results

### ✅ Working INMP441:
- Consistent audio levels in Serial Monitor
- Clean WAV file generation
- Backend returns pronunciation score
- No zero/null readings

### ❌ L/R Issues:
- Zero audio levels
- Empty WAV files
- Backend returns "NO_SPEECH_DETECTED"
- Intermittent readings

## Troubleshooting

### No Audio Data:
1. Check wiring connections
2. Verify L/R pin is connected to GND
3. Ensure 3.3V power (NOT 5V!)
4. Check I2S pin assignments

### Intermittent Audio:
1. L/R pin likely floating
2. Connect L/R to GND firmly
3. Check jumper wire connections

### Backend Test Fails:
1. Ensure backend is running on localhost:5000
2. Check WAV file is not empty
3. Verify audio format (16kHz, 16-bit, mono)

## Success Criteria

✅ **INMP441 Working**: 
- Consistent audio readings
- Clean pronunciation evaluation
- No L/R channel issues

✅ **Ready for MAX4466**: 
- Understand audio pipeline
- Backend integration confirmed
- Hardware interface validated

## Next Steps

Once INMP441 testing is complete:
1. Document any L/R issues encountered
2. Compare with MAX4466 when it arrives
3. Integrate chosen microphone into final hardware design
4. Update SpeakUp app for hardware audio input