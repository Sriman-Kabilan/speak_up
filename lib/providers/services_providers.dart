import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:record/record.dart';

import '../config/app_config.dart';
import '../services/api_service.dart';
import '../services/audio_service.dart';
import '../services/device_service.dart';
import '../services/progress_service.dart';

final audioServiceProvider = Provider<AudioService>((ref) {
  return AudioService(AudioRecorder());
});

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(baseUrl: AppConfig.backendUrl);
});

final progressServiceProvider = Provider<ProgressService>((ref) {
  return ProgressService(FirebaseFirestore.instance);
});

final deviceServiceProvider = Provider<DeviceService>((ref) {
  return DeviceService();
});
