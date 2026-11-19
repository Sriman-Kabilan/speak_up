import serial
import time
import requests
import json
import pyaudio
import wave
import threading
from typing import Optional, List

class FailSafeAudioRecorder:
    def __init__(self, backend_url="http://localhost:5000"):
        self.backend_url = backend_url
        self.esp32_port = None
        self.audio_sources = {
            'esp32_inmp441': False,
            'esp32_analog': False,
            'laptop_mic': False
        }
        self.current_source = None
        self.recording = False
        
    def detect_esp32(self) -> Optional[str]:
        """Detect ESP32 COM port"""
        import serial.tools.list_ports
        
        for port in serial.tools.list_ports.comports():
            if 'CP210' in port.description or 'CH340' in port.description:
                try:
                    ser = serial.Serial(port.device, 115200, timeout=1)
                    ser.close()
                    print(f"✓ ESP32 detected on {port.device}")
                    return port.device
                except:
                    continue
        return None
    
    def test_audio_sources(self):
        """Test all available audio sources"""
        print("=== Testing Audio Sources ===")
        
        # Test ESP32 connection
        self.esp32_port = self.detect_esp32()
        if self.esp32_port:
            try:
                ser = serial.Serial(self.esp32_port, 115200, timeout=2)
                ser.write(b'test\n')
                time.sleep(1)
                response = ser.read_all().decode('utf-8', errors='ignore')
                
                if 'INMP441' in response and 'ACTIVE' in response:
                    self.audio_sources['esp32_inmp441'] = True
                    print("✓ ESP32 + INMP441: Available")
                elif 'Analog mic' in response and 'ACTIVE' in response:
                    self.audio_sources['esp32_analog'] = True
                    print("✓ ESP32 + Analog Mic: Available")
                
                ser.close()
            except Exception as e:
                print(f"✗ ESP32: Connection failed - {e}")
        
        # Test laptop microphone
        try:
            p = pyaudio.PyAudio()
            device_count = p.get_device_count()
            for i in range(device_count):
                device_info = p.get_device_info_by_index(i)
                if device_info['maxInputChannels'] > 0:
                    self.audio_sources['laptop_mic'] = True
                    print("✓ Laptop Microphone: Available")
                    break
            p.terminate()
        except Exception as e:
            print(f"✗ Laptop Mic: Not available - {e}")
        
        # Select primary source
        if self.audio_sources['esp32_inmp441']:
            self.current_source = 'esp32_inmp441'
            print("→ Primary: ESP32 + INMP441")
        elif self.audio_sources['esp32_analog']:
            self.current_source = 'esp32_analog'
            print("→ Primary: ESP32 + Analog Mic")
        elif self.audio_sources['laptop_mic']:
            self.current_source = 'laptop_mic'
            print("→ Primary: Laptop Microphone")
        else:
            print("✗ No audio sources available!")
            return False
        
        print("=============================")
        return True
    
    def record_audio(self, duration=3, word="test"):
        """Record audio using available source"""
        if not self.current_source:
            print("No audio source selected!")
            return None
        
        print(f"Recording with {self.current_source} for {duration}s...")
        
        if self.current_source.startswith('esp32'):
            return self._record_esp32(duration)
        else:
            return self._record_laptop_mic(duration)
    
    def _record_esp32(self, duration):
        """Record from ESP32"""
        try:
            ser = serial.Serial(self.esp32_port, 115200, timeout=1)
            
            # Start recording
            ser.write(b'start\n')
            time.sleep(0.1)
            
            audio_data = []
            start_time = time.time()
            recording_started = False
            
            while time.time() - start_time < duration:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    
                    if line == "AUDIO_START":
                        recording_started = True
                        continue
                    elif line == "AUDIO_END":
                        break
                    elif recording_started and ',' in line:
                        try:
                            samples = [int(x) for x in line.split(',')]
                            audio_data.extend(samples)
                        except:
                            continue
            
            # Stop recording
            ser.write(b'stop\n')
            ser.close()
            
            print(f"Recorded {len(audio_data)} samples")
            return audio_data
            
        except Exception as e:
            print(f"ESP32 recording failed: {e}")
            # Fallback to laptop mic
            if self.audio_sources['laptop_mic']:
                print("Falling back to laptop microphone...")
                self.current_source = 'laptop_mic'
                return self._record_laptop_mic(duration)
            return None
    
    def _record_laptop_mic(self, duration):
        """Record from laptop microphone"""
        try:
            CHUNK = 1024
            FORMAT = pyaudio.paInt16
            CHANNELS = 1
            RATE = 16000
            
            p = pyaudio.PyAudio()
            
            stream = p.open(format=FORMAT,
                          channels=CHANNELS,
                          rate=RATE,
                          input=True,
                          frames_per_buffer=CHUNK)
            
            frames = []
            for _ in range(0, int(RATE / CHUNK * duration)):
                data = stream.read(CHUNK)
                frames.append(data)
            
            stream.stop_stream()
            stream.close()
            p.terminate()
            
            # Convert to int16 array
            import struct
            audio_data = []
            for frame in frames:
                samples = struct.unpack(f'{len(frame)//2}h', frame)
                audio_data.extend(samples)
            
            print(f"Recorded {len(audio_data)} samples from laptop mic")
            return audio_data
            
        except Exception as e:
            print(f"Laptop mic recording failed: {e}")
            return None
    
    def test_with_backend(self, word="hello"):
        """Test recording and send to SpeakUp backend"""
        print(f"\n=== Testing '{word}' with SpeakUp Backend ===")
        
        # Record audio
        audio_data = self.record_audio(duration=3, word=word)
        if not audio_data:
            print("Recording failed!")
            return
        
        # Save as WAV file
        wav_file = f"test_{word}_{self.current_source}.wav"
        self._save_wav(audio_data, wav_file)
        
        # Send to backend
        try:
            with open(wav_file, 'rb') as f:
                files = {'audio': f}
                data = {'word': word}
                
                response = requests.post(
                    f"{self.backend_url}/evaluate",
                    files=files,
                    data=data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✓ Backend Response:")
                    print(f"  Score: {result.get('score', 'N/A')}")
                    print(f"  Feedback: {result.get('feedback', 'N/A')}")
                    print(f"  Source: {self.current_source}")
                else:
                    print(f"✗ Backend Error: {response.status_code}")
                    
        except Exception as e:
            print(f"✗ Backend connection failed: {e}")
            print("Note: Make sure backend is running (python backend/app.py)")
    
    def _save_wav(self, audio_data, filename):
        """Save audio data as WAV file"""
        import struct
        
        with wave.open(filename, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16000)
            
            # Convert to bytes
            audio_bytes = b''.join(struct.pack('<h', sample) for sample in audio_data)
            wav_file.writeframes(audio_bytes)

def main():
    print("SpeakUp Fail-Safe Audio System")
    print("==============================")
    
    recorder = FailSafeAudioRecorder()
    
    # Test all audio sources
    if not recorder.test_audio_sources():
        print("No audio sources available. Exiting.")
        return
    
    while True:
        print("\nOptions:")
        print("1. Test recording")
        print("2. Test with backend")
        print("3. Switch audio source")
        print("4. Re-scan sources")
        print("5. Exit")
        
        choice = input("Choose option (1-5): ").strip()
        
        if choice == '1':
            word = input("Enter word to practice (default: hello): ").strip() or "hello"
            recorder.record_audio(duration=3, word=word)
            
        elif choice == '2':
            word = input("Enter word to practice (default: hello): ").strip() or "hello"
            recorder.test_with_backend(word)
            
        elif choice == '3':
            available = [k for k, v in recorder.audio_sources.items() if v]
            if len(available) > 1:
                print("Available sources:")
                for i, source in enumerate(available):
                    print(f"{i+1}. {source}")
                try:
                    idx = int(input("Select source: ")) - 1
                    recorder.current_source = available[idx]
                    print(f"Switched to: {recorder.current_source}")
                except:
                    print("Invalid selection")
            else:
                print("Only one source available")
                
        elif choice == '4':
            recorder.test_audio_sources()
            
        elif choice == '5':
            break
        
        else:
            print("Invalid option")

if __name__ == "__main__":
    main()