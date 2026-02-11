import 'evaluation_result.dart';

class PracticeAttempt {
  const PracticeAttempt({
    required this.lessonId,
    required this.userId,
    required this.createdAt,
    required this.result,
  });

  final String lessonId;
  final String userId;
  final DateTime createdAt;
  final EvaluationResult result;

  Map<String, dynamic> toFirestore() {
    return {
      'lessonId': lessonId,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'result': result.toJson(),
    };
  }

  factory PracticeAttempt.fromFirestore(Map<String, dynamic> json) {
    return PracticeAttempt(
      lessonId: json['lessonId'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      createdAt: DateTime.parse(
        json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
      ),
      result: EvaluationResult.fromJson(
        json['result'] as Map<String, dynamic>? ?? const {},
      ),
    );
  }
}
