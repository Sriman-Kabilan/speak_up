/**
 * Backend Evaluation Service
 * Calls Python backend for precise phoneme evaluation
 */
import { Platform } from "react-native";

let FileSystem;
try {
  if (Platform.OS !== "web") {
    FileSystem = require("expo-file-system");
  }
} catch (e) {}

export class BackendEvaluationService {
  constructor() {
    // Use different URLs for different platforms
    if (Platform.OS === "web") {
      this.backendUrl = "http://localhost:5000";
    } else {
      // Mobile: Try multiple possible IPs
      this.possibleUrls = [
         "http://192.168.250.38:5000", // ✅ ONLY REAL WORKING IP

          // Emulator support
          "http://10.0.2.2:5000",
          "http://192.168.250.201:5000", // Try router IP with port forwarding

          // iOS simulator / web fallback
          "http://localhost:5000"// Try router IP with port forwarding
      ];
      this.backendUrl = this.possibleUrls[0]; // Start with first
    }
    this.isAvailable = false;
    this.testedUrls = new Set();
  }

  async checkHealth() {
    try {
      console.log(`🔍 Checking backend health at: ${this.backendUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.backendUrl}/api/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.status === "healthy";
        console.log("✅ Backend available:", data.message);
        return true;
      }

      this.isAvailable = false;
      console.log("❌ Backend unhealthy response");
      return false;
    } catch (error) {
      console.warn(
        `⚠️ Backend not available at ${this.backendUrl}:`,
        error.message,
      );

      // If mobile and primary IP fails, try alternative IPs
      if (Platform.OS !== "web" && this.backendUrl.includes("192.168.29.30")) {
        console.log("🔄 Trying alternative backend URLs...");
        const alternativeUrls = [
          "http://192.168.1.30:5000", // Common router range
          "http://10.0.0.30:5000", // Another common range
          "http://192.168.0.30:5000", // Another common range
        ];

        for (const url of alternativeUrls) {
          try {
            console.log(`🔍 Trying: ${url}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${url}/api/health`, {
              method: "GET",
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.status === "healthy") {
                console.log(`✅ Found working backend at: ${url}`);
                this.backendUrl = url;
                this.isAvailable = true;
                return true;
              }
            }
          } catch (altError) {
            console.log(`❌ ${url} failed:`, altError.message);
          }
        }
      }

      this.isAvailable = false;
      return false;
    }
  }

  async evaluate(audioData, text, exerciseId) {
    try {
      // Force health check on every request for mobile debugging
      if (Platform.OS !== "web") {
        console.log("📱 Mobile platform detected, forcing health check...");
        this.isAvailable = false;
      }

      if (!this.isAvailable) {
        console.log("🔄 Backend not marked as available, checking health...");
        const healthResult = await this.checkHealth();
        console.log("🏥 Health check result:", healthResult);

        if (!healthResult) {
          throw new Error("Backend health check failed - cannot reach server");
        }
      }

      if (!this.isAvailable) {
        throw new Error("Backend not available after health check");
      }

      const formData = new FormData();

      // Handle different data types for web vs mobile
      if (Platform.OS === "web") {
        // Web: audioData is already a Blob
        formData.append("audio", audioData, "recording.wav");
        console.log("📤 Sending to backend (web):", {
          text,
          exerciseId,
          audioSize: audioData.size,
        });
      } else {
        // Mobile: audioData is the original file URI — use it directly
        if (!audioData) {
          throw new Error("No audio URI available on mobile");
        }
        const audioFile = {
          uri: audioData,
          type: "audio/wav",
          name: "recording.wav",
        };
        formData.append("audio", audioFile);
        console.log("📤 Sending to backend (mobile):", {
          text,
          exerciseId,
          uri: audioData,
          backendUrl: this.backendUrl,
        });
      }

      formData.append("text", text);
      formData.append("exercise_id", exerciseId);

      console.log(`🌐 Making request to: ${this.backendUrl}/api/evaluate`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ Request timeout after 30 seconds");
        controller.abort();
      }, 30000);

      const response = await fetch(`${this.backendUrl}/api/evaluate`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("📵 Backend response error:", response.status, errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("📥 Backend result:", result);

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("❌ Backend evaluation error:", error);

      // Provide specific error messages for different failure types
      let errorMessage = error.message;
      if (error.name === "AbortError") {
        errorMessage = "Request timeout - backend took too long to respond";
      } else if (error.message.includes("Network request failed")) {
        errorMessage = `Network connection failed. Make sure:\n1. Backend is running (python app.py)\n2. Both devices are on same WiFi\n3. Computer IP is ${this.backendUrl.split("//")[1].split(":")[0]}\n4. Windows Firewall allows Python connections`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  uint8ArrayToBase64(uint8Array) {
    let binary = "";
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  async getPhonemes(word) {
    try {
      const response = await fetch(`${this.backendUrl}/api/phonemes/${word}`);

      if (!response.ok) {
        throw new Error("Word not found");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting phonemes:", error);
      return null;
    }
  }
}
