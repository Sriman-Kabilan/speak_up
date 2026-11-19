# ESP32 + INMP441 Simple Connection Guide

## Physical Connections (Use Female-to-Male Jumpers)

### INMP441 Microphone Pins:
```
INMP441 Board:
┌─────────────┐
│  VDD    GND │
│  WS     SCK │  
│  SD     L/R │
└─────────────┘
```

### Connection Table:
| INMP441 Pin | ESP32 Pin | Jumper Wire Color | Function |
|-------------|-----------|-------------------|----------|
| VDD         | 3V3       | RED              | Power 3.3V |
| GND         | GND       | BLACK            | Ground |
| SCK         | D26       | BLUE             | Clock |
| WS          | D25       | GREEN            | Word Select |
| SD          | D22       | YELLOW           | Data |
| L/R         | GND       | BROWN            | Force Left Channel |

## Step-by-Step Wiring:

1. **Power Connection:**
   - RED jumper: INMP441 VDD → ESP32 3V3
   - BLACK jumper: INMP441 GND → ESP32 GND

2. **I2S Signal Connections:**
   - BLUE jumper: INMP441 SCK → ESP32 D26
   - GREEN jumper: INMP441 WS → ESP32 D25  
   - YELLOW jumper: INMP441 SD → ESP32 D22

3. **CRITICAL L/R Connection:**
   - BROWN jumper: INMP441 L/R → ESP32 GND
   - This forces LEFT channel operation

## Visual Check:
```
ESP32 Side:          INMP441 Side:
3V3  ←─RED─────────→  VDD
GND  ←─BLACK───────→  GND
D26  ←─BLUE────────→  SCK
D25  ←─GREEN───────→  WS
D22  ←─YELLOW──────→  SD
GND  ←─BROWN───────→  L/R
```

## Testing Without Arduino IDE

### Method 1: Use ESP32 Flash Tool
1. Download pre-compiled firmware (I'll create this)
2. Flash directly to ESP32
3. Test via Serial Monitor

### Method 2: Use PlatformIO (Simpler than Arduino IDE)
1. Install VS Code
2. Install PlatformIO extension
3. Upload code directly

### Method 3: Python Serial Test Only
1. Wire connections as above
2. Use multimeter to verify connections
3. Test with basic serial communication

Would you like me to create a pre-compiled firmware file you can flash directly, or set up the PlatformIO method?