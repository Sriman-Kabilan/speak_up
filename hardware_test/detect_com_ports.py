import serial.tools.list_ports

def list_all_ports():
    """List all available COM ports"""
    print("=== Available COM Ports ===")
    ports = serial.tools.list_ports.comports()
    
    if not ports:
        print("❌ No COM ports found!")
        print("ESP32 may not be detected by Windows")
        return []
    
    available_ports = []
    for i, port in enumerate(ports, 1):
        print(f"{i}. {port.device} - {port.description}")
        if 'USB' in port.description or 'Serial' in port.description or 'CH340' in port.description or 'CP210' in port.description:
            print(f"   ⭐ This looks like ESP32!")
        available_ports.append(port.device)
    
    return available_ports

def test_port(port_name):
    """Test if a specific port works"""
    try:
        ser = serial.Serial(port_name, 115200, timeout=1)
        ser.close()
        return True
    except:
        return False

if __name__ == "__main__":
    print("ESP32 COM Port Detector")
    print("=" * 30)
    
    ports = list_all_ports()
    
    if ports:
        print(f"\n🔍 Testing {len(ports)} ports...")
        working_ports = []
        
        for port in ports:
            if test_port(port):
                working_ports.append(port)
                print(f"✅ {port} - Working")
            else:
                print(f"❌ {port} - Not accessible")
        
        if working_ports:
            print(f"\n🎉 Found {len(working_ports)} working port(s):")
            for port in working_ports:
                print(f"   - {port}")
            print(f"\nTry using: {working_ports[0]}")
        else:
            print("\n❌ No working ports found")
            print("ESP32 drivers may need to be installed")
    else:
        print("\n❌ No COM ports detected")
        print("Check:")
        print("1. ESP32 USB cable connection")
        print("2. USB cable supports data (not just power)")
        print("3. ESP32 USB drivers installed")