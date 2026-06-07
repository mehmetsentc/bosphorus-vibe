import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class StoryStatusRecord extends FirestoreRecord {
  StoryStatusRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "storyRef" field.
  DocumentReference? _storyRef;
  DocumentReference? get storyRef => _storyRef;
  bool hasStoryRef() => _storyRef != null;

  // "userRef" field.
  DocumentReference? _userRef;
  DocumentReference? get userRef => _userRef;
  bool hasUserRef() => _userRef != null;

  // "status" field.
  String? _status;
  String get status => _status ?? '';
  bool hasStatus() => _status != null;

  // "createdAt" field.
  DateTime? _createdAt;
  DateTime? get createdAt => _createdAt;
  bool hasCreatedAt() => _createdAt != null;

  void _initializeFields() {
    _storyRef = snapshotData['storyRef'] as DocumentReference?;
    _userRef = snapshotData['userRef'] as DocumentReference?;
    _status = snapshotData['status'] as String?;
    _createdAt = snapshotData['createdAt'] as DateTime?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('storyStatus');

  static Stream<StoryStatusRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => StoryStatusRecord.fromSnapshot(s));

  static Future<StoryStatusRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => StoryStatusRecord.fromSnapshot(s));

  static StoryStatusRecord fromSnapshot(DocumentSnapshot snapshot) =>
      StoryStatusRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static StoryStatusRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      StoryStatusRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'StoryStatusRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is StoryStatusRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createStoryStatusRecordData({
  DocumentReference? storyRef,
  DocumentReference? userRef,
  String? status,
  DateTime? createdAt,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'storyRef': storyRef,
      'userRef': userRef,
      'status': status,
      'createdAt': createdAt,
    }.withoutNulls,
  );

  return firestoreData;
}

class StoryStatusRecordDocumentEquality implements Equality<StoryStatusRecord> {
  const StoryStatusRecordDocumentEquality();

  @override
  bool equals(StoryStatusRecord? e1, StoryStatusRecord? e2) {
    return e1?.storyRef == e2?.storyRef &&
        e1?.userRef == e2?.userRef &&
        e1?.status == e2?.status &&
        e1?.createdAt == e2?.createdAt;
  }

  @override
  int hash(StoryStatusRecord? e) => const ListEquality()
      .hash([e?.storyRef, e?.userRef, e?.status, e?.createdAt]);

  @override
  bool isValidKey(Object? o) => o is StoryStatusRecord;
}
