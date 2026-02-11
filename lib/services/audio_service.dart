import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

class AudioService {
  AudioService(this._recorder);

  final AudioRecorder _recorder;

  Future<bool> hasPermission() => _recorder.hasPermission();

  Future<String?> startRecording() async {
    final tempDir = await getTemporaryDirectory();
    final path = '${tempDir.path}/attempt_${DateTime.now().millisecondsSinceEpoch}.m4a';

    await _recorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc, sampleRate: 16000),
      path: path,
    );
    return path;
  }

  Future<String?> stopRecording() async {
    return _recorder.stop();
  }

  Future<File?> getRecordedFile(String? path) async {
    if (path == null) return null;
    final file = File(path);
    return file.existsSync() ? file : null;
  }
}
