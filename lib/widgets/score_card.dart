import 'package:flutter/material.dart';

class ScoreCard extends StatelessWidget {
  const ScoreCard({super.key, required this.score});

  final double score;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: const Text('Pronunciation Score'),
        subtitle: Text('${score.toStringAsFixed(1)} / 100'),
        trailing: Icon(
          score >= 60 ? Icons.check_circle : Icons.warning,
          color: score >= 60 ? Colors.green : Colors.orange,
        ),
      ),
    );
  }
}
