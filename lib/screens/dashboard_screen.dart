import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../providers/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = ref.watch(dashboardSummaryProvider);

    return summary.when(
      data: (data) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(child: ListTile(title: const Text('Total Attempts'), trailing: Text('${data.totalAttempts}'))),
          Card(
            child: ListTile(
              title: const Text('Average Score'),
              trailing: Text(data.averageScore.toStringAsFixed(1)),
            ),
          ),
          Card(
            child: ListTile(
              title: const Text('Weak Phonemes (< 60)'),
              subtitle: Text(data.weakPhonemes.isEmpty ? 'None' : data.weakPhonemes.join(', ')),
            ),
          ),
          const SizedBox(height: 12),
          Text('Attempt History', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...data.history.map(
            (attempt) => Card(
              child: ListTile(
                title: Text('Lesson: ${attempt.lessonId}'),
                subtitle: Text(DateFormat.yMMMd().add_jm().format(attempt.createdAt)),
                trailing: Text(attempt.result.pronunciationScore.toStringAsFixed(1)),
              ),
            ),
          ),
        ],
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Failed to load dashboard: $e')),
    );
  }
}
