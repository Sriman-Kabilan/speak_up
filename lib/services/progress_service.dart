import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/practice_attempt.dart';

class ProgressService {
  ProgressService(this._firestore);

  final FirebaseFirestore _firestore;

  Future<void> saveAttempt(PracticeAttempt attempt) async {
    await _firestore.collection('attempts').add(attempt.toFirestore());
  }

  Stream<List<PracticeAttempt>> watchAttempts(String userId) {
    return _firestore
        .collection('attempts')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => PracticeAttempt.fromFirestore(doc.data()))
              .toList(),
        );
  }
}
