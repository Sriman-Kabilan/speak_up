import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/practice_attempt.dart';
import 'services_providers.dart';

class DashboardSummary {
  const DashboardSummary({
    required this.totalAttempts,
    required this.averageScore,
    required this.weakPhonemes,
    required this.history,
  });

  final int totalAttempts;
  final double averageScore;
  final List<String> weakPhonemes;
  final List<PracticeAttempt> history;
}

final attemptsStreamProvider = StreamProvider<List<PracticeAttempt>>((ref) {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return Stream.value(const []);
  return ref.read(progressServiceProvider).watchAttempts(user.uid);
});

final dashboardSummaryProvider = Provider<AsyncValue<DashboardSummary>>((ref) {
  final attemptsAsync = ref.watch(attemptsStreamProvider);

  return attemptsAsync.whenData((attempts) {
    final total = attempts.length;
    final average = total == 0
        ? 0.0
        : attempts
                .map((attempt) => attempt.result.pronunciationScore)
                .reduce((a, b) => a + b) /
            total;

    final weak = <String>{};
    for (final attempt in attempts) {
      if (attempt.result.pronunciationScore < 60) {
        weak.addAll(attempt.result.detectedErrors);
      }
    }

    return DashboardSummary(
      totalAttempts: total,
      averageScore: average,
      weakPhonemes: weak.toList(),
      history: attempts,
    );
  });
});
