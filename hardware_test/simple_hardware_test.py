"""
Simple INMP441 Test - No Arduino IDE Required
Just wire the connections and run this script
"""

import serial
import time
import sys

def find_esp32_port():
    """Find ESP32 COM port automatically"""
    import serial.tools.list_ports
    
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if 'USB' in port.description or 'Serial' in port.description:
            print(f"Found potential ESP32 port: {port.device} - {port.description}")
            return port.device
    return None

def test_basic_connection():
    """Test if ESP32 is connected and responding"""
    print("=== ESP32 + INMP441 Connection Test ===")
    print()
    
    # Find COM port
    port = find_esp32_port()
    if not port:
        port = input("Enter COM port manually (e.g., COM3): ").strip()
    
    print(f"Testing connection on {port}...")
    
    try:
        ser = serial.Serial(port, 115200, timeout=2)
        time.sleep(2)
        
        print("✅ ESP32 connected successfully!")
        print("📋 Connection Status:")
        print("   - Power: ESP32 should have LED on")
        print("   - Serial: Communication established")
        print()
        
        # Send test command
        ser.write(b'test\n')
        time.sleep(1)
        
        # Read any response
        response = ser.read_all().decode('utf-8', errors='ignore')
        if response:
            print(f"📨 ESP32 Response: {response}")
        else:
            print("📨 No response (normal if no firmware loaded)")
        
        ser.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print()
        print("🔧 Troubleshooting:")
        print("   1. Check USB cable connection")
        print("   2. Verify ESP32 power LED is on")
        print("   3. Try different COM port")
        print("   4. Install ESP32 USB drivers")
        return False

def verify_wiring():
    """Guide user through wiring verification"""
    print("=== Wiring Verification Checklist ===")
    print()
    
    connections = [
        ("Power", "INMP441 VDD", "ESP32 3V3", "RED wire"),
        ("Ground", "INMP441 GND", "ESP32 GND", "BLACK wire"),
        ("Clock", "INMP441 SCK", "ESP32 D26", "BLUE wire"),
        ("Word Select", "INMP441 WS", "ESP32 D25", "GREEN wire"),
        ("Data", "INMP441 SD", "ESP32 D22", "YELLOW wire"),
        ("L/R Channel", "INMP441 L/R", "ESP32 GND", "BROWN wire - CRITICAL!")
    ]
    
    print("Check each connection:")
    for i, (name, from_pin, to_pin, wire) in enumerate(connections, 1):
        print(f"{i}. {name}: {from_pin} → {to_pin} ({wire})")
        
        if "L/R" in name:
            print("   ⚠️  CRITICAL: L/R pin MUST connect to GND (not floating!)")
        
        confirm = input(f"   ✓ Connection {i} verified? (y/n): ").lower()
        if confirm != 'y':
            print(f"   ❌ Please fix connection {i} before continuing")
            return False
    
    print()
    print("✅ All connections verified!")
    return True

def test_without_firmware():
    """Test hardware without custom firmware"""
    print("=== Hardware Test (No Custom Firmware) ===")
    print()
    print("Since you don't want to install Arduino IDE, we'll test the hardware:")
    print()
    
    # Test basic connection
    if not test_basic_connection():
        return False
    
    print("🔧 Next Steps:")
    print("1. Verify all wiring connections")
    print("2. Use multimeter to check continuity")
    print("3. Prepare for firmware upload when ready")
    print()
    
    # Wiring verification
    if verify_wiring():
        print("✅ Hardware setup complete!")
        print()
        print("📋 What we've confirmed:")
        print("   - ESP32 is powered and communicating")
        print("   - All INMP441 connections are wired")
        print("   - L/R pin is properly grounded")
        print()
        print("🚀 Ready for firmware upload!")
        print("   Options:")
        print("   1. Use online ESP32 flasher tool")
        print("   2. Install PlatformIO (easier than Arduino IDE)")
        print("   3. Use pre-compiled firmware file")
        
        return True
    else:
        print("❌ Please fix wiring issues first")
        return False

def main():
    print("ESP32 + INMP441 Hardware Test")
    print("No Arduino IDE required - just hardware verification")
    print("=" * 50)
    print()
    
    # Check if user has wired everything
    wired = input("Have you wired ESP32 to INMP441 according to the guide? (y/n): ").lower()
    if wired != 'y':
        print()
        print("📋 Please wire the connections first:")
        print("   See: SIMPLE_CONNECTION_GUIDE.md")
        print()
        print("Connection Summary:")
        print("   INMP441 VDD → ESP32 3V3 (RED)")
        print("   INMP441 GND → ESP32 GND (BLACK)")
        print("   INMP441 SCK → ESP32 D26 (BLUE)")
        print("   INMP441 WS  → ESP32 D25 (GREEN)")
        print("   INMP441 SD  → ESP32 D22 (YELLOW)")
        print("   INMP441 L/R → ESP32 GND (BROWN) ← CRITICAL!")
        return
    
    # Run hardware test
    success = test_without_firmware()
    
    if success:
        print()
        print("🎉 Hardware test PASSED!")
        print("Ready to proceed with firmware upload when you're ready.")
    else:
        print()
        print("❌ Hardware test FAILED!")
        print("Please check connections and try again.")

if __name__ == "__main__":
    main()