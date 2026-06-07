import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class StoryNotificationsRecord extends FirestoreRecord {
  StoryNotificationsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "story_id" field.
  DocumentReference? _storyId;
  DocumentReference? get storyId => _storyId;
  bool hasStoryId() => _storyId != null;

  // "user_id" field.
  DocumentReference? _userId;
  DocumentReference? get userId => _userId;
  bool hasUserId() => _userId != null;

  // "time" field.
  DateTime? _time;
  DateTime? get time => _time;
  bool hasTime() => _time != null;

  // "is_read" field.
  bool? _isRead;
  bool get isRead => _isRead ?? false;
  bool hasIsRead() => _isRead != null;

  // "notification_text" field.
  String? _notificationText;
  String get notificationText => _notificationText ?? '';
  bool hasNotificationText() => _notificationText != null;

  // "type" field.
  String? _type;
  String get type => _type ?? '';
  bool hasType() => _type != null;

  // "action_reference" field.
  DocumentReference? _actionReference;
  DocumentReference? get actionReference => _actionReference;
  bool hasActionReference() => _actionReference != null;

  // "seen_by" field.
  List<DocumentReference>? _seenBy;
  List<DocumentReference> get seenBy => _seenBy ?? const [];
  bool hasSeenBy() => _seenBy != null;

  // "priority" field.
  String? _priority;
  String get priority => _priority ?? '';
  bool hasPriority() => _priority != null;

  void _initializeFields() {
    _storyId = snapshotData['story_id'] as DocumentReference?;
    _userId = snapshotData['user_id'] as DocumentReference?;
    _time = snapshotData['time'] as DateTime?;
    _isRead = snapshotData['is_read'] as bool?;
    _notificationText = snapshotData['notification_text'] as String?;
    _type = snapshotData['type'] as String?;
    _actionReference = snapshotData['action_reference'] as DocumentReference?;
    _seenBy = getDataList(snapshotData['seen_by']);
    _priority = snapshotData['priority'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('storyNotifications');

  static Stream<StoryNotificationsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => StoryNotificationsRecord.fromSnapshot(s));

  static Future<StoryNotificationsRecord> getDocumentOnce(
          DocumentReference ref) =>
      ref.get().then((s) => StoryNotificationsRecord.fromSnapshot(s));

  static StoryNotificationsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      StoryNotificationsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static StoryNotificationsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      StoryNotificationsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'StoryNotificationsRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is StoryNotificationsRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createStoryNotificationsRecordData({
  DocumentReference? storyId,
  DocumentReference? userId,
  DateTime? time,
  bool? isRead,
  String? notificationText,
  String? type,
  DocumentReference? actionReference,
  String? priority,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'story_id': storyId,
      'user_id': userId,
      'time': time,
      'is_read': isRead,
      'notification_text': notificationText,
      'type': type,
      'action_reference': actionReference,
      'priority': priority,
    }.withoutNulls,
  );

  return firestoreData;
}

class StoryNotificationsRecordDocumentEquality
    implements Equality<StoryNotificationsRecord> {
  const StoryNotificationsRecordDocumentEquality();

  @override
  bool equals(StoryNotificationsRecord? e1, StoryNotificationsRecord? e2) {
    const listEquality = ListEquality();
    return e1?.storyId == e2?.storyId &&
        e1?.userId == e2?.userId &&
        e1?.time == e2?.time &&
        e1?.isRead == e2?.isRead &&
        e1?.notificationText == e2?.notificationText &&
        e1?.type == e2?.type &&
        e1?.actionReference == e2?.actionReference &&
        listEquality.equals(e1?.seenBy, e2?.seenBy) &&
        e1?.priority == e2?.priority;
  }

  @override
  int hash(StoryNotificationsRecord? e) => const ListEquality().hash([
        e?.storyId,
        e?.userId,
        e?.time,
        e?.isRead,
        e?.notificationText,
        e?.type,
        e?.actionReference,
        e?.seenBy,
        e?.priority
      ]);

  @override
  bool isValidKey(Object? o) => o is StoryNotificationsRecord;
}
