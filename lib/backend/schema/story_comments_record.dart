import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class StoryCommentsRecord extends FirestoreRecord {
  StoryCommentsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "storyAssociation" field.
  DocumentReference? _storyAssociation;
  DocumentReference? get storyAssociation => _storyAssociation;
  bool hasStoryAssociation() => _storyAssociation != null;

  // "commentUser" field.
  DocumentReference? _commentUser;
  DocumentReference? get commentUser => _commentUser;
  bool hasCommentUser() => _commentUser != null;

  // "comment" field.
  String? _comment;
  String get comment => _comment ?? '';
  bool hasComment() => _comment != null;

  // "timePosted" field.
  DateTime? _timePosted;
  DateTime? get timePosted => _timePosted;
  bool hasTimePosted() => _timePosted != null;

  // "notification_text" field.
  String? _notificationText;
  String get notificationText => _notificationText ?? '';
  bool hasNotificationText() => _notificationText != null;

  // "is_read" field.
  bool? _isRead;
  bool get isRead => _isRead ?? false;
  bool hasIsRead() => _isRead != null;

  // "type" field.
  String? _type;
  String get type => _type ?? '';
  bool hasType() => _type != null;

  void _initializeFields() {
    _storyAssociation = snapshotData['storyAssociation'] as DocumentReference?;
    _commentUser = snapshotData['commentUser'] as DocumentReference?;
    _comment = snapshotData['comment'] as String?;
    _timePosted = snapshotData['timePosted'] as DateTime?;
    _notificationText = snapshotData['notification_text'] as String?;
    _isRead = snapshotData['is_read'] as bool?;
    _type = snapshotData['type'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('storyComments');

  static Stream<StoryCommentsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => StoryCommentsRecord.fromSnapshot(s));

  static Future<StoryCommentsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => StoryCommentsRecord.fromSnapshot(s));

  static StoryCommentsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      StoryCommentsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static StoryCommentsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      StoryCommentsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'StoryCommentsRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is StoryCommentsRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createStoryCommentsRecordData({
  DocumentReference? storyAssociation,
  DocumentReference? commentUser,
  String? comment,
  DateTime? timePosted,
  String? notificationText,
  bool? isRead,
  String? type,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'storyAssociation': storyAssociation,
      'commentUser': commentUser,
      'comment': comment,
      'timePosted': timePosted,
      'notification_text': notificationText,
      'is_read': isRead,
      'type': type,
    }.withoutNulls,
  );

  return firestoreData;
}

class StoryCommentsRecordDocumentEquality
    implements Equality<StoryCommentsRecord> {
  const StoryCommentsRecordDocumentEquality();

  @override
  bool equals(StoryCommentsRecord? e1, StoryCommentsRecord? e2) {
    return e1?.storyAssociation == e2?.storyAssociation &&
        e1?.commentUser == e2?.commentUser &&
        e1?.comment == e2?.comment &&
        e1?.timePosted == e2?.timePosted &&
        e1?.notificationText == e2?.notificationText &&
        e1?.isRead == e2?.isRead &&
        e1?.type == e2?.type;
  }

  @override
  int hash(StoryCommentsRecord? e) => const ListEquality().hash([
        e?.storyAssociation,
        e?.commentUser,
        e?.comment,
        e?.timePosted,
        e?.notificationText,
        e?.isRead,
        e?.type
      ]);

  @override
  bool isValidKey(Object? o) => o is StoryCommentsRecord;
}
