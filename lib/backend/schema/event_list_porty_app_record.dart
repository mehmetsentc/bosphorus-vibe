import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class EventListPortyAppRecord extends FirestoreRecord {
  EventListPortyAppRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "event_liked_by" field.
  List<DocumentReference>? _eventLikedBy;
  List<DocumentReference> get eventLikedBy => _eventLikedBy ?? const [];
  bool hasEventLikedBy() => _eventLikedBy != null;

  // "event_saved_by" field.
  List<DocumentReference>? _eventSavedBy;
  List<DocumentReference> get eventSavedBy => _eventSavedBy ?? const [];
  bool hasEventSavedBy() => _eventSavedBy != null;

  // "Event_Name" field.
  String? _eventName;
  String get eventName => _eventName ?? '';
  bool hasEventName() => _eventName != null;

  // "Event_Time" field.
  String? _eventTime;
  String get eventTime => _eventTime ?? '';
  bool hasEventTime() => _eventTime != null;

  // "Event_Location" field.
  String? _eventLocation;
  String get eventLocation => _eventLocation ?? '';
  bool hasEventLocation() => _eventLocation != null;

  // "Event_Date" field.
  DateTime? _eventDate;
  DateTime? get eventDate => _eventDate;
  bool hasEventDate() => _eventDate != null;

  // "Event_image" field.
  String? _eventImage;
  String get eventImage => _eventImage ?? '';
  bool hasEventImage() => _eventImage != null;

  // "Category" field.
  String? _category;
  String get category => _category ?? '';
  bool hasCategory() => _category != null;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  bool hasId() => _id != null;

  // "aboutEvent" field.
  String? _aboutEvent;
  String get aboutEvent => _aboutEvent ?? '';
  bool hasAboutEvent() => _aboutEvent != null;

  // "view" field.
  int? _view;
  int get view => _view ?? 0;
  bool hasView() => _view != null;

  // "eventComment" field.
  String? _eventComment;
  String get eventComment => _eventComment ?? '';
  bool hasEventComment() => _eventComment != null;

  // "eventComment_time_posted" field.
  DateTime? _eventCommentTimePosted;
  DateTime? get eventCommentTimePosted => _eventCommentTimePosted;
  bool hasEventCommentTimePosted() => _eventCommentTimePosted != null;

  // "event_comment_user" field.
  DocumentReference? _eventCommentUser;
  DocumentReference? get eventCommentUser => _eventCommentUser;
  bool hasEventCommentUser() => _eventCommentUser != null;

  // "event" field.
  DocumentReference? _event;
  DocumentReference? get event => _event;
  bool hasEvent() => _event != null;

  // "number_event_comment" field.
  int? _numberEventComment;
  int get numberEventComment => _numberEventComment ?? 0;
  bool hasNumberEventComment() => _numberEventComment != null;

  void _initializeFields() {
    _eventLikedBy = getDataList(snapshotData['event_liked_by']);
    _eventSavedBy = getDataList(snapshotData['event_saved_by']);
    _eventName = snapshotData['Event_Name'] as String?;
    _eventTime = snapshotData['Event_Time'] as String?;
    _eventLocation = snapshotData['Event_Location'] as String?;
    _eventDate = snapshotData['Event_Date'] as DateTime?;
    _eventImage = snapshotData['Event_image'] as String?;
    _category = snapshotData['Category'] as String?;
    _id = castToType<int>(snapshotData['id']);
    _aboutEvent = snapshotData['aboutEvent'] as String?;
    _view = castToType<int>(snapshotData['view']);
    _eventComment = snapshotData['eventComment'] as String?;
    _eventCommentTimePosted =
        snapshotData['eventComment_time_posted'] as DateTime?;
    _eventCommentUser =
        snapshotData['event_comment_user'] as DocumentReference?;
    _event = snapshotData['event'] as DocumentReference?;
    _numberEventComment = castToType<int>(snapshotData['number_event_comment']);
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('eventListPortyApp');

  static Stream<EventListPortyAppRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => EventListPortyAppRecord.fromSnapshot(s));

  static Future<EventListPortyAppRecord> getDocumentOnce(
          DocumentReference ref) =>
      ref.get().then((s) => EventListPortyAppRecord.fromSnapshot(s));

  static EventListPortyAppRecord fromSnapshot(DocumentSnapshot snapshot) =>
      EventListPortyAppRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static EventListPortyAppRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      EventListPortyAppRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'EventListPortyAppRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is EventListPortyAppRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createEventListPortyAppRecordData({
  String? eventName,
  String? eventTime,
  String? eventLocation,
  DateTime? eventDate,
  String? eventImage,
  String? category,
  int? id,
  String? aboutEvent,
  int? view,
  String? eventComment,
  DateTime? eventCommentTimePosted,
  DocumentReference? eventCommentUser,
  DocumentReference? event,
  int? numberEventComment,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'Event_Name': eventName,
      'Event_Time': eventTime,
      'Event_Location': eventLocation,
      'Event_Date': eventDate,
      'Event_image': eventImage,
      'Category': category,
      'id': id,
      'aboutEvent': aboutEvent,
      'view': view,
      'eventComment': eventComment,
      'eventComment_time_posted': eventCommentTimePosted,
      'event_comment_user': eventCommentUser,
      'event': event,
      'number_event_comment': numberEventComment,
    }.withoutNulls,
  );

  return firestoreData;
}

class EventListPortyAppRecordDocumentEquality
    implements Equality<EventListPortyAppRecord> {
  const EventListPortyAppRecordDocumentEquality();

  @override
  bool equals(EventListPortyAppRecord? e1, EventListPortyAppRecord? e2) {
    const listEquality = ListEquality();
    return listEquality.equals(e1?.eventLikedBy, e2?.eventLikedBy) &&
        listEquality.equals(e1?.eventSavedBy, e2?.eventSavedBy) &&
        e1?.eventName == e2?.eventName &&
        e1?.eventTime == e2?.eventTime &&
        e1?.eventLocation == e2?.eventLocation &&
        e1?.eventDate == e2?.eventDate &&
        e1?.eventImage == e2?.eventImage &&
        e1?.category == e2?.category &&
        e1?.id == e2?.id &&
        e1?.aboutEvent == e2?.aboutEvent &&
        e1?.view == e2?.view &&
        e1?.eventComment == e2?.eventComment &&
        e1?.eventCommentTimePosted == e2?.eventCommentTimePosted &&
        e1?.eventCommentUser == e2?.eventCommentUser &&
        e1?.event == e2?.event &&
        e1?.numberEventComment == e2?.numberEventComment;
  }

  @override
  int hash(EventListPortyAppRecord? e) => const ListEquality().hash([
        e?.eventLikedBy,
        e?.eventSavedBy,
        e?.eventName,
        e?.eventTime,
        e?.eventLocation,
        e?.eventDate,
        e?.eventImage,
        e?.category,
        e?.id,
        e?.aboutEvent,
        e?.view,
        e?.eventComment,
        e?.eventCommentTimePosted,
        e?.eventCommentUser,
        e?.event,
        e?.numberEventComment
      ]);

  @override
  bool isValidKey(Object? o) => o is EventListPortyAppRecord;
}
