import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/lesson.dart';

final lessonListProvider = Provider<List<Lesson>>((ref) {
  return const [
    Lesson(
      id: 'lesson_1',
      title: 'Warm-up: Greetings',
      promptText: 'Hello, how are you doing today?',
    ),
    Lesson(
      id: 'lesson_2',
      title: 'Travel Phrase',
      promptText: 'Could you show me the way to the train station?',
    ),
    Lesson(
      id: 'lesson_3',
      title: 'Business Intro',
      promptText: 'I appreciate the opportunity to present my proposal.',
    ),
  ];
});
