class EvaluationResult {
  const EvaluationResult({
    required this.recognizedText,
    required this.phonemeComparison,
    required this.pronunciationScore,
    required this.detectedErrors,
    required this.articulationFeedback,
  });

  final String recognizedText;
  final List<String> phonemeComparison;
  final double pronunciationScore;
  final List<String> detectedErrors;
  final String articulationFeedback;

  factory EvaluationResult.fromJson(Map<String, dynamic> json) {
    return EvaluationResult(
      recognizedText: json['recognized_text'] as String? ?? '',
      phonemeComparison: (json['phoneme_comparison'] as List<dynamic>? ?? const [])
          .map((e) => e.toString())
          .toList(),
      pronunciationScore:
          (json['pronunciation_score'] as num?)?.toDouble() ?? 0.0,
      detectedErrors: (json['detected_errors'] as List<dynamic>? ?? const [])
          .map((e) => e.toString())
          .toList(),
      articulationFeedback: json['articulation_feedback'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'recognized_text': recognizedText,
      'phoneme_comparison': phonemeComparison,
      'pronunciation_score': pronunciationScore,
      'detected_errors': detectedErrors,
      'articulation_feedback': articulationFeedback,
    };
  }
}
