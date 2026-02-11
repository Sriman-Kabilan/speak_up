class DeviceService {
  Future<bool> connect() async {
    // Placeholder for future external microphone / hardware connection logic.
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return true;
  }

  Future<void> disconnect() async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
  }
}
