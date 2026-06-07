import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class NotificationRecord extends FirestoreRecord {
  NotificationRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "is_read" field.
  bool? _isRead;
  bool get isRead => _isRead ?? false;
  bool hasIsRead() => _isRead != null;

  // "post_ref" field.
  DocumentReference? _postRef;
  DocumentReference? get postRef => _postRef;
  bool hasPostRef() => _postRef != null;

  // "made_by" field.
  DocumentReference? _madeBy;
  DocumentReference? get madeBy => _madeBy;
  bool hasMadeBy() => _madeBy != null;

  // "made_to" field.
  DocumentReference? _madeTo;
  DocumentReference? get madeTo => _madeTo;
  bool hasMadeTo() => _madeTo != null;

  // "time" field.
  DateTime? _time;
  DateTime? get time => _time;
  bool hasTime() => _time != null;

  // "type" field.
  String? _type;
  String get type => _type ?? '';
  bool hasType() => _type != null;

  // "comment_ref" field.
  DocumentReference? _commentRef;
  DocumentReference? get commentRef => _commentRef;
  bool hasCommentRef() => _commentRef != null;

  // "notification_text" field.
  String? _notificationText;
  String get notificationText => _notificationText ?? '';
  bool hasNotificationText() => _notificationText != null;

  void _initializeFields() {
    _isRead = snapshotData['is_read'] as bool?;
    _postRef = snapshotData['post_ref'] as DocumentReference?;
    _madeBy = snapshotData['made_by'] as DocumentReference?;
    _madeTo = snapshotData['made_to'] as DocumentReference?;
    _time = snapshotData['time'] as DateTime?;
    _type = snapshotData['type'] as String?;
    _commentRef = snapshotData['comment_ref'] as DocumentReference?;
    _notificationText = snapshotData['notification_text'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('Notification');

  static Stream<NotificationRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => NotificationRecord.fromSnapshot(s));

  static Future<NotificationRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => NotificationRecord.fromSnapshot(s));

  static NotificationRecord fromSnapshot(DocumentSnapshot snapshot) =>
      NotificationRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static NotificationRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      NotificationRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'NotificationRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is NotificationRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createNotificationRecordData({
  bool? isRead,
  DocumentReference? postRef,
  DocumentReference? madeBy,
  DocumentReference? madeTo,
  DateTime? time,
  String? type,
  DocumentReference? commentRef,
  String? notificationText,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'is_read': isRead,
      'post_ref': postRef,
      'made_by': madeBy,
      'made_to': madeTo,
      'time': time,
      'type': type,
      'comment_ref': commentRef,
      'notification_text': notificationText,
    }.withoutNulls,
  );

  return firestoreData;
}

class NotificationRecordDocumentEquality
    implements Equality<NotificationRecord> {
  const NotificationRecordDocumentEquality();

  @override
  bool equals(NotificationRecord? e1, NotificationRecord? e2) {
    return e1?.isRead == e2?.isRead &&
        e1?.postRef == e2?.postRef &&
        e1?.madeBy == e2?.madeBy &&
        e1?.madeTo == e2?.madeTo &&
        e1?.time == e2?.time &&
        e1?.type == e2?.type &&
        e1?.commentRef == e2?.commentRef &&
        e1?.notificationText == e2?.notificationText;
  }

  @override
  int hash(NotificationRecord? e) => const ListEquality().hash([
        e?.isRead,
        e?.postRef,
        e?.madeBy,
        e?.madeTo,
        e?.time,
        e?.type,
        e?.commentRef,
        e?.notificationText
      ]);

  @override
  bool isValidKey(Object? o) => o is NotificationRecord;
}
