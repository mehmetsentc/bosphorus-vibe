import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class KaraokeParticapitionListRecord extends FirestoreRecord {
  KaraokeParticapitionListRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "full_Name" field.
  String? _fullName;
  String get fullName => _fullName ?? '';
  bool hasFullName() => _fullName != null;

  // "roomNumber" field.
  String? _roomNumber;
  String get roomNumber => _roomNumber ?? '';
  bool hasRoomNumber() => _roomNumber != null;

  // "songTitle" field.
  String? _songTitle;
  String get songTitle => _songTitle ?? '';
  bool hasSongTitle() => _songTitle != null;

  // "youTubeLink" field.
  String? _youTubeLink;
  String get youTubeLink => _youTubeLink ?? '';
  bool hasYouTubeLink() => _youTubeLink != null;

  // "reqUser" field.
  DocumentReference? _reqUser;
  DocumentReference? get reqUser => _reqUser;
  bool hasReqUser() => _reqUser != null;

  // "requestUserMessage" field.
  String? _requestUserMessage;
  String get requestUserMessage => _requestUserMessage ?? '';
  bool hasRequestUserMessage() => _requestUserMessage != null;

  // "request_Date_time" field.
  DateTime? _requestDateTime;
  DateTime? get requestDateTime => _requestDateTime;
  bool hasRequestDateTime() => _requestDateTime != null;

  void _initializeFields() {
    _fullName = snapshotData['full_Name'] as String?;
    _roomNumber = snapshotData['roomNumber'] as String?;
    _songTitle = snapshotData['songTitle'] as String?;
    _youTubeLink = snapshotData['youTubeLink'] as String?;
    _reqUser = snapshotData['reqUser'] as DocumentReference?;
    _requestUserMessage = snapshotData['requestUserMessage'] as String?;
    _requestDateTime = snapshotData['request_Date_time'] as DateTime?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('Karaoke_Particapition_List');

  static Stream<KaraokeParticapitionListRecord> getDocument(
          DocumentReference ref) =>
      ref
          .snapshots()
          .map((s) => KaraokeParticapitionListRecord.fromSnapshot(s));

  static Future<KaraokeParticapitionListRecord> getDocumentOnce(
          DocumentReference ref) =>
      ref.get().then((s) => KaraokeParticapitionListRecord.fromSnapshot(s));

  static KaraokeParticapitionListRecord fromSnapshot(
          DocumentSnapshot snapshot) =>
      KaraokeParticapitionListRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static KaraokeParticapitionListRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      KaraokeParticapitionListRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'KaraokeParticapitionListRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is KaraokeParticapitionListRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createKaraokeParticapitionListRecordData({
  String? fullName,
  String? roomNumber,
  String? songTitle,
  String? youTubeLink,
  DocumentReference? reqUser,
  String? requestUserMessage,
  DateTime? requestDateTime,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'full_Name': fullName,
      'roomNumber': roomNumber,
      'songTitle': songTitle,
      'youTubeLink': youTubeLink,
      'reqUser': reqUser,
      'requestUserMessage': requestUserMessage,
      'request_Date_time': requestDateTime,
    }.withoutNulls,
  );

  return firestoreData;
}

class KaraokeParticapitionListRecordDocumentEquality
    implements Equality<KaraokeParticapitionListRecord> {
  const KaraokeParticapitionListRecordDocumentEquality();

  @override
  bool equals(
      KaraokeParticapitionListRecord? e1, KaraokeParticapitionListRecord? e2) {
    return e1?.fullName == e2?.fullName &&
        e1?.roomNumber == e2?.roomNumber &&
        e1?.songTitle == e2?.songTitle &&
        e1?.youTubeLink == e2?.youTubeLink &&
        e1?.reqUser == e2?.reqUser &&
        e1?.requestUserMessage == e2?.requestUserMessage &&
        e1?.requestDateTime == e2?.requestDateTime;
  }

  @override
  int hash(KaraokeParticapitionListRecord? e) => const ListEquality().hash([
        e?.fullName,
        e?.roomNumber,
        e?.songTitle,
        e?.youTubeLink,
        e?.reqUser,
        e?.requestUserMessage,
        e?.requestDateTime
      ]);

  @override
  bool isValidKey(Object? o) => o is KaraokeParticapitionListRecord;
}
