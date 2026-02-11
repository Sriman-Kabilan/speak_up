import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/evaluation_result.dart';
import '../models/lesson.dart';
import 'services_providers.dart';

const int maxAttempts = 3;

class PracticeState {
  const PracticeState({
    this.audioPath,
    this.attemptCount = 0,
    this.isRecording = false,
    this.isSubmitting = false,
    this.evaluationResult,
    this.error,
  });

  final String? audioPath;
  final int attemptCount;
  final bool isRecording;
  final bool isSubmitting;
  final EvaluationResult? evaluationResult;
  final String? error;

  bool get canRetry => attemptCount < maxAttempts;

  PracticeState copyWith({
    String? audioPath,
    int? attemptCount,
    bool? isRecording,
    bool? isSubmitting,
    EvaluationResult? evaluationResult,
    String? error,
  }) {
    return PracticeState(
      audioPath: audioPath ?? this.audioPath,
      attemptCount: attemptCount ?? this.attemptCount,
      isRecording: isRecording ?? this.isRecording,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      evaluationResult: evaluationResult ?? this.evaluationResult,
      error: error,
    );
  }
}

class PracticeController extends StateNotifier<PracticeState> {
  PracticeController(this.ref) : super(const PracticeState());

  final Ref ref;

  Future<void> startRecording() async {
    final audioService = ref.read(audioServiceProvider);
    final permitted = await audioService.hasPermission();
    if (!permitted) {
      state = state.copyWith(error: 'Microphone permission denied.');
      return;
    }

    final path = await audioService.startRecording();
    state = state.copyWith(isRecording: true, audioPath: path, error: null);
  }

  Future<void> stopRecording() async {
    final audioService = ref.read(audioServiceProvider);
    final path = await audioService.stopRecording();
    state = state.copyWith(isRecording: false, audioPath: path ?? state.audioPath);
  }

  Future<void> submitForEvaluation(Lesson lesson) async {
    if (!state.canRetry || state.audioPath == null) return;
    state = state.copyWith(isSubmitting: true, error: null);

    try {
      final result = await ref.read(apiServiceProvider).evaluatePronunciation(
            audioFile: File(state.audioPath!),
            lessonText: lesson.promptText,
          );

      state = state.copyWith(
        isSubmitting: false,
        evaluationResult: result,
        attemptCount: state.attemptCount + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Failed to evaluate pronunciation: $e',
      );
    }
  }

  void clearResult() {
    state = state.copyWith(evaluationResult: null, error: null);
  }
}

final practiceControllerProvider =
    StateNotifierProvider<PracticeController, PracticeState>((ref) {
  return PracticeController(ref);
});
