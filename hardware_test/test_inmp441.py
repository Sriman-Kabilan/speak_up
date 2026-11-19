import serial
import numpy as np
import wave
import struct
import time

def record_from_esp32(port='COM3', duration=5, sample_rate=16000):
    """
    Record audio from ESP32 via serial and save as WAV
    """
    print(f"Connecting to ESP32 on {port}...")
    
    try:
        ser = serial.Serial(port, 115200, timeout=1)
        time.sleep(2)  # Wait for ESP32 to initialize
        
        print(f"Recording for {duration} seconds...")
        audio_data = []
        start_time = time.time()
        
        while time.time() - start_time < duration:
            try:
                line = ser.readline().decode('utf-8').strip()
                if line.startswith("Audio detected:"):
                    # Extract audio level
                    level = int(line.split(":")[1].strip())
                    # Convert to 16-bit signed integer
                    audio_sample = level if level < 32767 else 32767
                    audio_data.append(audio_sample)
                    print(f"Sample: {audio_sample}")
            except:
                continue
        
        ser.close()
        
        if len(audio_data) == 0:
            print("No audio data received!")
            return None
        
        # Convert to numpy array
        audio_array = np.array(audio_data, dtype=np.int16)
        
        # Save as WAV file
        filename = f"inmp441_test_{int(time.time())}.wav"
        with wave.open(filename, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_array.tobytes())
        
        print(f"Audio saved as: {filename}")
        print(f"Samples recorded: {len(audio_data)}")
        print(f"Duration: {len(audio_data)/sample_rate:.2f} seconds")
        
        return filename
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_with_backend(wav_file, text="hello"):
    """
    Test the recorded audio with SpeakUp backend
    """
    import requests
    
    try:
        url = "http://localhost:5000/api/evaluate"
        
        with open(wav_file, 'rb') as f:
            files = {'audio': f}
            data = {'text': text, 'exercise_id': 'inmp441_test'}
            
            print(f"Testing with backend: {text}")
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Backend Response:")
                print(f"  Score: {result.get('score', 'N/A')}")
                print(f"  Detected: {result.get('detected_word', 'N/A')}")
                print(f"  Feedback: {result.get('feedback', 'N/A')}")
                return True
            else:
                print(f"Backend error: {response.status_code}")
                print(response.text)
                return False
                
    except Exception as e:
        print(f"Backend test error: {e}")
        return False

if __name__ == "__main__":
    print("ESP32 + INMP441 Audio Test")
    print("1. Make sure ESP32 is connected and running the test code")
    print("2. Check COM port (usually COM3, COM4, etc.)")
    
    # Change COM port as needed
    port = input("Enter COM port (e.g., COM3): ").strip() or "COM3"
    
    # Record audio
    wav_file = record_from_esp32(port, duration=3)
    
    if wav_file:
        # Test with backend
        test_word = input("Enter word to test (default: hello): ").strip() or "hello"
        test_with_backend(wav_file, test_word)
    else:
        print("Recording failed!")