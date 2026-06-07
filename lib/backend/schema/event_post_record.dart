import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class EventPostRecord extends FirestoreRecord {
  EventPostRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "eventPostUser" field.
  DocumentReference? _eventPostUser;
  DocumentReference? get eventPostUser => _eventPostUser;
  bool hasEventPostUser() => _eventPostUser != null;

  // "eventPostPhoto" field.
  String? _eventPostPhoto;
  String get eventPostPhoto => _eventPostPhoto ?? '';
  bool hasEventPostPhoto() => _eventPostPhoto != null;

  // "eventPostVideo" field.
  String? _eventPostVideo;
  String get eventPostVideo => _eventPostVideo ?? '';
  bool hasEventPostVideo() => _eventPostVideo != null;

  // "eventPostDesription" field.
  String? _eventPostDesription;
  String get eventPostDesription => _eventPostDesription ?? '';
  bool hasEventPostDesription() => _eventPostDesription != null;

  // "timePosted" field.
  DateTime? _timePosted;
  DateTime? get timePosted => _timePosted;
  bool hasTimePosted() => _timePosted != null;

  // "numComments" field.
  int? _numComments;
  int get numComments => _numComments ?? 0;
  bool hasNumComments() => _numComments != null;

  // "eventPostOwner" field.
  bool? _eventPostOwner;
  bool get eventPostOwner => _eventPostOwner ?? false;
  bool hasEventPostOwner() => _eventPostOwner != null;

  // "createdDate" field.
  DateTime? _createdDate;
  DateTime? get createdDate => _createdDate;
  bool hasCreatedDate() => _createdDate != null;

  // "locationEvent" field.
  String? _locationEvent;
  String get locationEvent => _locationEvent ?? '';
  bool hasLocationEvent() => _locationEvent != null;

  // "eventPostLikes" field.
  List<DocumentReference>? _eventPostLikes;
  List<DocumentReference> get eventPostLikes => _eventPostLikes ?? const [];
  bool hasEventPostLikes() => _eventPostLikes != null;

  // "postSavedBy" field.
  List<DocumentReference>? _postSavedBy;
  List<DocumentReference> get postSavedBy => _postSavedBy ?? const [];
  bool hasPostSavedBy() => _postSavedBy != null;

  // "eventName" field.
  List<DocumentReference>? _eventName;
  List<DocumentReference> get eventName => _eventName ?? const [];
  bool hasEventName() => _eventName != null;

  // "event_post_comment" field.
  String? _eventPostComment;
  String get eventPostComment => _eventPostComment ?? '';
  bool hasEventPostComment() => _eventPostComment != null;

  // "event_comment_time_posted" field.
  DateTime? _eventCommentTimePosted;
  DateTime? get eventCommentTimePosted => _eventCommentTimePosted;
  bool hasEventCommentTimePosted() => _eventCommentTimePosted != null;

  // "eventPost" field.
  DocumentReference? _eventPost;
  DocumentReference? get eventPost => _eventPost;
  bool hasEventPost() => _eventPost != null;

  void _initializeFields() {
    _eventPostUser = snapshotData['eventPostUser'] as DocumentReference?;
    _eventPostPhoto = snapshotData['eventPostPhoto'] as String?;
    _eventPostVideo = snapshotData['eventPostVideo'] as String?;
    _eventPostDesription = snapshotData['eventPostDesription'] as String?;
    _timePosted = snapshotData['timePosted'] as DateTime?;
    _numComments = castToType<int>(snapshotData['numComments']);
    _eventPostOwner = snapshotData['eventPostOwner'] as bool?;
    _createdDate = snapshotData['createdDate'] as DateTime?;
    _locationEvent = snapshotData['locationEvent'] as String?;
    _eventPostLikes = getDataList(snapshotData['eventPostLikes']);
    _postSavedBy = getDataList(snapshotData['postSavedBy']);
    _eventName = getDataList(snapshotData['eventName']);
    _eventPostComment = snapshotData['event_post_comment'] as String?;
    _eventCommentTimePosted =
        snapshotData['event_comment_time_posted'] as DateTime?;
    _eventPost = snapshotData['eventPost'] as DocumentReference?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('eventPost');

  static Stream<EventPostRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => EventPostRecord.fromSnapshot(s));

  static Future<EventPostRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => EventPostRecord.fromSnapshot(s));

  static EventPostRecord fromSnapshot(DocumentSnapshot snapshot) =>
      EventPostRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static EventPostRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      EventPostRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'EventPostRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is EventPostRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createEventPostRecordData({
  DocumentReference? eventPostUser,
  String? eventPostPhoto,
  String? eventPostVideo,
  String? eventPostDesription,
  DateTime? timePosted,
  int? numComments,
  bool? eventPostOwner,
  DateTime? createdDate,
  String? locationEvent,
  String? eventPostComment,
  DateTime? eventCommentTimePosted,
  DocumentReference? eventPost,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'eventPostUser': eventPostUser,
      'eventPostPhoto': eventPostPhoto,
      'eventPostVideo': eventPostVideo,
      'eventPostDesription': eventPostDesription,
      'timePosted': timePosted,
      'numComments': numComments,
      'eventPostOwner': eventPostOwner,
      'createdDate': createdDate,
      'locationEvent': locationEvent,
      'event_post_comment': eventPostComment,
      'event_comment_time_posted': eventCommentTimePosted,
      'eventPost': eventPost,
    }.withoutNulls,
  );

  return firestoreData;
}

class EventPostRecordDocumentEquality implements Equality<EventPostRecord> {
  const EventPostRecordDocumentEquality();

  @override
  bool equals(EventPostRecord? e1, EventPostRecord? e2) {
    const listEquality = ListEquality();
    return e1?.eventPostUser == e2?.eventPostUser &&
        e1?.eventPostPhoto == e2?.eventPostPhoto &&
        e1?.eventPostVideo == e2?.eventPostVideo &&
        e1?.eventPostDesription == e2?.eventPostDesription &&
        e1?.timePosted == e2?.timePosted &&
        e1?.numComments == e2?.numComments &&
        e1?.eventPostOwner == e2?.eventPostOwner &&
        e1?.createdDate == e2?.createdDate &&
        e1?.locationEvent == e2?.locationEvent &&
        listEquality.equals(e1?.eventPostLikes, e2?.eventPostLikes) &&
        listEquality.equals(e1?.postSavedBy, e2?.postSavedBy) &&
        listEquality.equals(e1?.eventName, e2?.eventName) &&
        e1?.eventPostComment == e2?.eventPostComment &&
        e1?.eventCommentTimePosted == e2?.eventCommentTimePosted &&
        e1?.eventPost == e2?.eventPost;
  }

  @override
  int hash(EventPostRecord? e) => const ListEquality().hash([
        e?.eventPostUser,
        e?.eventPostPhoto,
        e?.eventPostVideo,
        e?.eventPostDesription,
        e?.timePosted,
        e?.numComments,
        e?.eventPostOwner,
        e?.createdDate,
        e?.locationEvent,
        e?.eventPostLikes,
        e?.postSavedBy,
        e?.eventName,
        e?.eventPostComment,
        e?.eventCommentTimePosted,
        e?.eventPost
      ]);

  @override
  bool isValidKey(Object? o) => o is EventPostRecord;
}
