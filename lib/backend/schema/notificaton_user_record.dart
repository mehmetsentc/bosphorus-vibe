import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class NotificatonUserRecord extends FirestoreRecord {
  NotificatonUserRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "time" field.
  DateTime? _time;
  DateTime? get time => _time;
  bool hasTime() => _time != null;

  // "is_read" field.
  bool? _isRead;
  bool get isRead => _isRead ?? false;
  bool hasIsRead() => _isRead != null;

  // "made_by" field.
  DocumentReference? _madeBy;
  DocumentReference? get madeBy => _madeBy;
  bool hasMadeBy() => _madeBy != null;

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  // "type" field.
  String? _type;
  String get type => _type ?? '';
  bool hasType() => _type != null;

  void _initializeFields() {
    _time = snapshotData['time'] as DateTime?;
    _isRead = snapshotData['is_read'] as bool?;
    _madeBy = snapshotData['made_by'] as DocumentReference?;
    _user = snapshotData['user'] as DocumentReference?;
    _type = snapshotData['type'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('notificaton_user');

  static Stream<NotificatonUserRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => NotificatonUserRecord.fromSnapshot(s));

  static Future<NotificatonUserRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => NotificatonUserRecord.fromSnapshot(s));

  static NotificatonUserRecord fromSnapshot(DocumentSnapshot snapshot) =>
      NotificatonUserRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static NotificatonUserRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      NotificatonUserRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'NotificatonUserRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is NotificatonUserRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createNotificatonUserRecordData({
  DateTime? time,
  bool? isRead,
  DocumentReference? madeBy,
  DocumentReference? user,
  String? type,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'time': time,
      'is_read': isRead,
      'made_by': madeBy,
      'user': user,
      'type': type,
    }.withoutNulls,
  );

  return firestoreData;
}

class NotificatonUserRecordDocumentEquality
    implements Equality<NotificatonUserRecord> {
  const NotificatonUserRecordDocumentEquality();

  @override
  bool equals(NotificatonUserRecord? e1, NotificatonUserRecord? e2) {
    return e1?.time == e2?.time &&
        e1?.isRead == e2?.isRead &&
        e1?.madeBy == e2?.madeBy &&
        e1?.user == e2?.user &&
        e1?.type == e2?.type;
  }

  @override
  int hash(NotificatonUserRecord? e) => const ListEquality()
      .hash([e?.time, e?.isRead, e?.madeBy, e?.user, e?.type]);

  @override
  bool isValidKey(Object? o) => o is NotificatonUserRecord;
}
