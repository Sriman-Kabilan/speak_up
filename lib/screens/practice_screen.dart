import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/lesson.dart';
import '../providers/practice_provider.dart';
import 'feedback_screen.dart';
import 'processing_screen.dart';

class PracticeScreen extends ConsumerWidget {
  const PracticeScreen({super.key, required this.lesson});

  final Lesson lesson;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(practiceControllerProvider);
    final controller = ref.read(practiceControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: Text('Practice: ${lesson.title}')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Lesson Text', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(lesson.promptText),
            const SizedBox(height: 16),
            Text('Attempts: ${state.attemptCount}/$maxAttempts'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: state.isRecording ? controller.stopRecording : controller.startRecording,
              icon: Icon(state.isRecording ? Icons.stop : Icons.mic),
              label: Text(state.isRecording ? 'Stop Recording' : 'Record Audio'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Hardware audio stream placeholder called.')),
                );
              },
              icon: const Icon(Icons.settings_input_component),
              label: const Text('Use Connected Device (placeholder)'),
            ),
            const Spacer(),
            if (state.error != null)
              Text(state.error!, style: const TextStyle(color: Colors.red)),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: (state.audioPath != null && state.canRetry && !state.isSubmitting)
                    ? () async {
                        Navigator.of(context).push(
                          const MaterialPageRoute(builder: (_) => ProcessingScreen()),
                        );
                        await controller.submitForEvaluation(lesson);
                        if (context.mounted) {
                          Navigator.of(context).pop();
                          final latest = ref.read(practiceControllerProvider).evaluationResult;
                          if (latest != null) {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => FeedbackScreen(lesson: lesson),
                              ),
                            );
                          }
                        }
                      }
                    : null,
                child: const Text('Send to Backend /evaluate'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
