"""
Direct INMP441 Audio Test
Test if microphone is working with existing ESP32 firmware
"""

import serial
import time
import numpy as np

def test_inmp441_audio(port='COM13', duration=10):
    """Test INMP441 microphone audio capture"""
    print("=== INMP441 Audio Test ===")
    print(f"Connecting to ESP32 on {port}...")
    
    try:
        ser = serial.Serial(port, 115200, timeout=1)
        time.sleep(2)
        
        print(f"🎤 Testing INMP441 for {duration} seconds...")
        print("👄 Please speak into the microphone!")
        print("📊 Monitoring audio levels...")
        print()
        
        audio_samples = []
        start_time = time.time()
        sample_count = 0
        
        while time.time() - start_time < duration:
            try:
                # Read data from ESP32
                data = ser.readline().decode('utf-8', errors='ignore').strip()
                
                if data:
                    # Look for audio data patterns
                    if any(keyword in data.lower() for keyword in ['audio', 'sample', 'level', 'data', 'i2s']):
                        print(f"📡 ESP32: {data}")
                        sample_count += 1
                    
                    # Try to extract numeric values (potential audio samples)
                    try:
                        # Look for numbers in the data
                        numbers = [int(s) for s in data.split() if s.isdigit() or (s.startswith('-') and s[1:].isdigit())]
                        if numbers:
                            for num in numbers:
                                if abs(num) > 100:  # Filter out noise
                                    audio_samples.append(num)
                                    print(f"🔊 Audio Sample: {num}")
                    except:
                        pass
                
            except Exception as e:
                continue
        
        ser.close()
        
        # Analyze results
        print("\n" + "="*50)
        print("📊 INMP441 Test Results:")
        print(f"   Duration: {duration} seconds")
        print(f"   ESP32 Messages: {sample_count}")
        print(f"   Audio Samples: {len(audio_samples)}")
        
        if len(audio_samples) > 0:
            avg_level = np.mean(np.abs(audio_samples))
            max_level = np.max(np.abs(audio_samples))
            print(f"   Average Level: {avg_level:.1f}")
            print(f"   Peak Level: {max_level}")
            
            if max_level > 1000:
                print("✅ INMP441 is working! Audio detected.")
                return True
            else:
                print("⚠️  Low audio levels - check microphone positioning")
                return False
        else:
            print("❌ No audio samples detected")
            print("🔧 Possible issues:")
            print("   1. INMP441 not connected properly")
            print("   2. L/R pin not grounded")
            print("   3. ESP32 firmware not reading I2S")
            print("   4. Need custom firmware upload")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_l_r_pin_issue():
    """Test for L/R pin problems"""
    print("\n=== L/R Pin Diagnostic ===")
    print("The INMP441 L/R pin issue causes:")
    print("❌ Zero audio readings")
    print("❌ Intermittent dropouts") 
    print("❌ No response to sound")
    print()
    print("✅ Your L/R pin should be connected to ESP32 GND")
    print("✅ This forces LEFT channel operation")
    print("✅ Prevents the '0 0 0 0 0' problem you mentioned")
    print()
    
    lr_connected = input("Is INMP441 L/R pin connected to ESP32 GND? (y/n): ").lower()
    if lr_connected != 'y':
        print("⚠️  CRITICAL: Connect L/R pin to GND immediately!")
        print("   This is the root cause of MEMS microphone issues")
        return False
    else:
        print("✅ L/R pin properly grounded")
        return True

def main():
    print("INMP441 MEMS Microphone Test")
    print("Testing the L/R pin issue you mentioned")
    print("="*50)
    
    # Test L/R pin configuration
    if not test_l_r_pin_issue():
        print("❌ Fix L/R pin connection first!")
        return
    
    # Test audio capture
    print("\n🎤 Starting audio test...")
    print("Make sure to speak clearly into the INMP441!")
    
    input("Press Enter when ready to start audio test...")
    
    success = test_inmp441_audio('COM13', duration=10)
    
    if success:
        print("\n🎉 INMP441 Test PASSED!")
        print("✅ No L/R pin issues detected")
        print("✅ Audio capture working")
        print("✅ Ready for SpeakUp integration")
    else:
        print("\n❌ INMP441 Test FAILED!")
        print("🔧 Next steps:")
        print("   1. Check L/R pin connection to GND")
        print("   2. Verify all 6 wire connections")
        print("   3. Upload custom I2S firmware")
        print("   4. Consider using MAX4466 instead")

if __name__ == "__main__":
    main()