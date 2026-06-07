import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class UserDraftsRecord extends FirestoreRecord {
  UserDraftsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "draftPhoto" field.
  String? _draftPhoto;
  String get draftPhoto => _draftPhoto ?? '';
  bool hasDraftPhoto() => _draftPhoto != null;

  // "draftTitle" field.
  String? _draftTitle;
  String get draftTitle => _draftTitle ?? '';
  bool hasDraftTitle() => _draftTitle != null;

  // "draftUser" field.
  DocumentReference? _draftUser;
  DocumentReference? get draftUser => _draftUser;
  bool hasDraftUser() => _draftUser != null;

  // "isPrivate" field.
  bool? _isPrivate;
  bool get isPrivate => _isPrivate ?? false;
  bool hasIsPrivate() => _isPrivate != null;

  // "allowComments" field.
  bool? _allowComments;
  bool get allowComments => _allowComments ?? false;
  bool hasAllowComments() => _allowComments != null;

  // "savedAt" field.
  DateTime? _savedAt;
  DateTime? get savedAt => _savedAt;
  bool hasSavedAt() => _savedAt != null;

  // "draftVideo" field.
  String? _draftVideo;
  String get draftVideo => _draftVideo ?? '';
  bool hasDraftVideo() => _draftVideo != null;

  void _initializeFields() {
    _draftPhoto = snapshotData['draftPhoto'] as String?;
    _draftTitle = snapshotData['draftTitle'] as String?;
    _draftUser = snapshotData['draftUser'] as DocumentReference?;
    _isPrivate = snapshotData['isPrivate'] as bool?;
    _allowComments = snapshotData['allowComments'] as bool?;
    _savedAt = snapshotData['savedAt'] as DateTime?;
    _draftVideo = snapshotData['draftVideo'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('userDrafts');

  static Stream<UserDraftsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => UserDraftsRecord.fromSnapshot(s));

  static Future<UserDraftsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => UserDraftsRecord.fromSnapshot(s));

  static UserDraftsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      UserDraftsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static UserDraftsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      UserDraftsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'UserDraftsRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is UserDraftsRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createUserDraftsRecordData({
  String? draftPhoto,
  String? draftTitle,
  DocumentReference? draftUser,
  bool? isPrivate,
  bool? allowComments,
  DateTime? savedAt,
  String? draftVideo,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'draftPhoto': draftPhoto,
      'draftTitle': draftTitle,
      'draftUser': draftUser,
      'isPrivate': isPrivate,
      'allowComments': allowComments,
      'savedAt': savedAt,
      'draftVideo': draftVideo,
    }.withoutNulls,
  );

  return firestoreData;
}

class UserDraftsRecordDocumentEquality implements Equality<UserDraftsRecord> {
  const UserDraftsRecordDocumentEquality();

  @override
  bool equals(UserDraftsRecord? e1, UserDraftsRecord? e2) {
    return e1?.draftPhoto == e2?.draftPhoto &&
        e1?.draftTitle == e2?.draftTitle &&
        e1?.draftUser == e2?.draftUser &&
        e1?.isPrivate == e2?.isPrivate &&
        e1?.allowComments == e2?.allowComments &&
        e1?.savedAt == e2?.savedAt &&
        e1?.draftVideo == e2?.draftVideo;
  }

  @override
  int hash(UserDraftsRecord? e) => const ListEquality().hash([
        e?.draftPhoto,
        e?.draftTitle,
        e?.draftUser,
        e?.isPrivate,
        e?.allowComments,
        e?.savedAt,
        e?.draftVideo
      ]);

  @override
  bool isValidKey(Object? o) => o is UserDraftsRecord;
}
