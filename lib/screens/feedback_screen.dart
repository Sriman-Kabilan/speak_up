import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/lesson.dart';
import '../models/practice_attempt.dart';
import '../providers/practice_provider.dart';
import '../providers/services_providers.dart';
import '../widgets/score_card.dart';

class FeedbackScreen extends ConsumerWidget {
  const FeedbackScreen({super.key, required this.lesson});

  final Lesson lesson;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(practiceControllerProvider);
    final result = state.evaluationResult;
    if (result == null) {
      return const Scaffold(body: Center(child: Text('No evaluation result found.')));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Feedback')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ScoreCard(score: result.pronunciationScore),
            const SizedBox(height: 12),
            Text('Recognized Text: ${result.recognizedText}'),
            const SizedBox(height: 8),
            Text('Detected Phoneme Errors: ${result.detectedErrors.join(', ')}'),
            const SizedBox(height: 8),
            Text('Articulation Suggestion: ${result.articulationFeedback}'),
            const SizedBox(height: 8),
            Text('Phoneme Comparison: ${result.phonemeComparison.join(' | ')}'),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: state.canRetry
                        ? () {
                            ref.read(practiceControllerProvider.notifier).clearResult();
                            Navigator.of(context).pop();
                          }
                        : null,
                    child: const Text('Retry'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: () async {
                      final userId = FirebaseAuth.instance.currentUser?.uid;
                      if (userId == null) return;

                      final attempt = PracticeAttempt(
                        lessonId: lesson.id,
                        userId: userId,
                        createdAt: DateTime.now(),
                        result: result,
                      );
                      await ref.read(progressServiceProvider).saveAttempt(attempt);

                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Attempt saved to Firestore.')),
                        );
                        Navigator.of(context).popUntil((route) => route.isFirst);
                      }
                    },
                    child: const Text('Continue'),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
