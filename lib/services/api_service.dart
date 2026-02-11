import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../models/evaluation_result.dart';

class ApiService {
  ApiService({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<EvaluationResult> evaluatePronunciation({
    required File audioFile,
    required String lessonText,
  }) async {
    final uri = Uri.parse('$baseUrl/evaluate');
    final request = http.MultipartRequest('POST', uri)
      ..fields['lesson_text'] = lessonText
      ..files.add(await http.MultipartFile.fromPath('audio', audioFile.path));

    // Backend pipeline responsibility:
    // 1) ASR model inference
    // 2) Phoneme extraction
    // 3) DTW alignment
    // 4) Error detection
    // 5) Feedback generation
    final streamedResponse = await _client.send(request);
    final responseBody = await streamedResponse.stream.bytesToString();

    if (streamedResponse.statusCode != 200) {
      throw HttpException('Evaluation failed: $responseBody');
    }

    final jsonMap = jsonDecode(responseBody) as Map<String, dynamic>;
    return EvaluationResult.fromJson(jsonMap);
  }
}
