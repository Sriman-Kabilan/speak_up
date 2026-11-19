"""
INMP441 Hardware Integration for SpeakUp
Records audio from INMP441 -> ESP32 -> Laptop -> Backend
"""

import serial
import numpy as np
import wave
import time
import requests
import threading
from collections import deque

class INMP441Recorder:
    def __init__(self, port='COM13', sample_rate=16000):
        self.port = port
        self.sample_rate = sample_rate
        self.ser = None
        self.recording = False
        self.audio_buffer = deque()
        
    def connect(self):
        """Connect to ESP32"""
        try:
            self.ser = serial.Serial(self.port, 115200, timeout=0.1)
            time.sleep(2)  # Wait for ESP32 to initialize
            print(f"✅ Connected to ESP32 on {self.port}")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    def start_recording(self, duration=5):
        """Record audio from INMP441 for specified duration"""
        if not self.ser:
            print("❌ Not connected to ESP32")
            return None
            
        print(f"🎤 Recording for {duration} seconds...")
        print("👄 Speak clearly into INMP441!")
        
        self.audio_buffer.clear()
        self.recording = True
        
        # Start reading thread
        read_thread = threading.Thread(target=self._read_audio_data)
        read_thread.start()
        
        # Record for specified duration
        time.sleep(duration)
        self.recording = False
        read_thread.join()
        
        # Convert buffer to audio array
        if len(self.audio_buffer) == 0:
            print("❌ No audio data captured")
            return None
            
        audio_data = list(self.audio_buffer)
        audio_array = np.array(audio_data, dtype=np.int16)
        
        print(f"✅ Captured {len(audio_data)} samples")
        print(f"📊 Audio level: avg={np.mean(np.abs(audio_array)):.1f}, max={np.max(np.abs(audio_array))}")
        
        return audio_array
    
    def _read_audio_data(self):
        """Read audio data from ESP32 in background thread"""
        while self.recording:
            try:
                line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                
                if line.startswith('SAMPLE:'):
                    # Extract audio sample
                    sample_str = line.replace('SAMPLE:', '')
                    try:
                        sample = int(sample_str)
                        self.audio_buffer.append(sample)
                    except ValueError:
                        pass
                        
            except Exception:
                continue
    
    def save_wav(self, audio_data, filename):
        """Save audio data as WAV file"""
        try:
            with wave.open(filename, 'wb') as wav_file:
                wav_file.setnchannels(1)  # Mono
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(self.sample_rate)
                wav_file.writeframes(audio_data.tobytes())
            
            print(f"💾 Audio saved as: {filename}")
            return filename
        except Exception as e:
            print(f"❌ Failed to save WAV: {e}")
            return None
    
    def test_with_backend(self, wav_file, text):
        """Test recorded audio with SpeakUp backend"""
        try:
            url = "http://localhost:5000/api/evaluate"
            
            with open(wav_file, 'rb') as f:
                files = {'audio': f}
                data = {'text': text, 'exercise_id': 'inmp441_hardware_test'}
                
                print(f"🔄 Testing pronunciation: '{text}'")
                response = requests.post(url, files=files, data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"🎯 Backend Results:")
                    print(f"   Score: {result.get('score', 'N/A')}/100")
                    print(f"   Detected: '{result.get('detected_word', 'N/A')}'")
                    print(f"   Expected: '{text}'")
                    print(f"   Feedback: {result.get('feedback', 'N/A')}")
                    
                    # Check if pronunciation was accurate
                    score = result.get('score', 0)
                    if score >= 80:
                        print("✅ Excellent pronunciation!")
                    elif score >= 60:
                        print("✅ Good pronunciation!")
                    else:
                        print("⚠️  Needs improvement")
                    
                    return result
                else:
                    print(f"❌ Backend error: {response.status_code}")
                    print(response.text)
                    return None
                    
        except Exception as e:
            print(f"❌ Backend test failed: {e}")
            return None
    
    def disconnect(self):
        """Disconnect from ESP32"""
        if self.ser:
            self.ser.close()
            print("🔌 Disconnected from ESP32")

def main():
    print("INMP441 Hardware Integration Test")
    print("=" * 40)
    
    # Initialize recorder
    recorder = INMP441Recorder('COM13')
    
    if not recorder.connect():
        print("❌ Failed to connect to ESP32")
        print("🔧 Make sure:")
        print("   1. ESP32 is connected via USB")
        print("   2. Proper firmware is uploaded")
        print("   3. INMP441 is wired correctly")
        return
    
    try:
        while True:
            print("\n" + "="*40)
            print("INMP441 Hardware Test Menu:")
            print("1. Record and test pronunciation")
            print("2. Quick audio test")
            print("3. Exit")
            
            choice = input("Choose option (1-3): ").strip()
            
            if choice == '1':
                # Full pronunciation test
                text = input("Enter word/phrase to practice: ").strip().lower()
                if not text:
                    text = "hello"
                
                print(f"\n🎤 Say: '{text}'")
                input("Press Enter when ready...")
                
                # Record audio
                audio_data = recorder.start_recording(duration=3)
                
                if audio_data is not None:
                    # Save as WAV
                    timestamp = int(time.time())
                    wav_file = f"inmp441_recording_{timestamp}.wav"
                    
                    if recorder.save_wav(audio_data, wav_file):
                        # Test with backend
                        recorder.test_with_backend(wav_file, text)
                
            elif choice == '2':
                # Quick audio level test
                print("\n🎤 Quick audio test (3 seconds)")
                input("Press Enter and speak...")
                
                audio_data = recorder.start_recording(duration=3)
                if audio_data is not None:
                    print("✅ INMP441 is working!")
                else:
                    print("❌ No audio detected")
                    
            elif choice == '3':
                break
            else:
                print("Invalid choice")
                
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted")
    finally:
        recorder.disconnect()

if __name__ == "__main__":
    main()