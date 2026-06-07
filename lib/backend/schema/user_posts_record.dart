import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class UserPostsRecord extends FirestoreRecord {
  UserPostsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "postPhoto" field.
  String? _postPhoto;
  String get postPhoto => _postPhoto ?? '';
  bool hasPostPhoto() => _postPhoto != null;

  // "postTitle" field.
  String? _postTitle;
  String get postTitle => _postTitle ?? '';
  bool hasPostTitle() => _postTitle != null;

  // "postDescription" field.
  String? _postDescription;
  String get postDescription => _postDescription ?? '';
  bool hasPostDescription() => _postDescription != null;

  // "postUser" field.
  DocumentReference? _postUser;
  DocumentReference? get postUser => _postUser;
  bool hasPostUser() => _postUser != null;

  // "timePosted" field.
  DateTime? _timePosted;
  DateTime? get timePosted => _timePosted;
  bool hasTimePosted() => _timePosted != null;

  // "likes" field.
  List<DocumentReference>? _likes;
  List<DocumentReference> get likes => _likes ?? const [];
  bool hasLikes() => _likes != null;

  // "numComments" field.
  int? _numComments;
  int get numComments => _numComments ?? 0;
  bool hasNumComments() => _numComments != null;

  // "postOwner" field.
  bool? _postOwner;
  bool get postOwner => _postOwner ?? false;
  bool hasPostOwner() => _postOwner != null;

  // "num_votes" field.
  int? _numVotes;
  int get numVotes => _numVotes ?? 0;
  bool hasNumVotes() => _numVotes != null;

  // "Post_liked_by" field.
  List<DocumentReference>? _postLikedBy;
  List<DocumentReference> get postLikedBy => _postLikedBy ?? const [];
  bool hasPostLikedBy() => _postLikedBy != null;

  // "postVideo" field.
  String? _postVideo;
  String get postVideo => _postVideo ?? '';
  bool hasPostVideo() => _postVideo != null;

  // "DateCreated" field.
  DateTime? _dateCreated;
  DateTime? get dateCreated => _dateCreated;
  bool hasDateCreated() => _dateCreated != null;

  // "DateUpdated" field.
  DateTime? _dateUpdated;
  DateTime? get dateUpdated => _dateUpdated;
  bool hasDateUpdated() => _dateUpdated != null;

  // "post_saved_by" field.
  List<DocumentReference>? _postSavedBy;
  List<DocumentReference> get postSavedBy => _postSavedBy ?? const [];
  bool hasPostSavedBy() => _postSavedBy != null;

  // "AdditionalPhoto" field.
  List<String>? _additionalPhoto;
  List<String> get additionalPhoto => _additionalPhoto ?? const [];
  bool hasAdditionalPhoto() => _additionalPhoto != null;

  // "AdditionalVideo" field.
  List<String>? _additionalVideo;
  List<String> get additionalVideo => _additionalVideo ?? const [];
  bool hasAdditionalVideo() => _additionalVideo != null;

  // "allowComments" field.
  bool? _allowComments;
  bool get allowComments => _allowComments ?? false;
  bool hasAllowComments() => _allowComments != null;

  // "isPrivate" field.
  bool? _isPrivate;
  bool get isPrivate => _isPrivate ?? false;
  bool hasIsPrivate() => _isPrivate != null;

  // "location" field.
  String? _location;
  String get location => _location ?? '';
  bool hasLocation() => _location != null;

  // "postFrom" field.
  String? _postFrom;
  String get postFrom => _postFrom ?? '';
  bool hasPostFrom() => _postFrom != null;

  // "postVideoURL" field.
  String? _postVideoURL;
  String get postVideoURL => _postVideoURL ?? '';
  bool hasPostVideoURL() => _postVideoURL != null;

  // "postPhotoURL" field.
  String? _postPhotoURL;
  String get postPhotoURL => _postPhotoURL ?? '';
  bool hasPostPhotoURL() => _postPhotoURL != null;

  // "category" field.
  String? _category;
  String get category => _category ?? '';
  bool hasCategory() => _category != null;

  // "postVideothumbnail" field.
  String? _postVideothumbnail;
  String get postVideothumbnail => _postVideothumbnail ?? '';
  bool hasPostVideothumbnail() => _postVideothumbnail != null;

  // "Activity_Name" field.
  String? _activityName;
  String get activityName => _activityName ?? '';
  bool hasActivityName() => _activityName != null;

  void _initializeFields() {
    _postPhoto = snapshotData['postPhoto'] as String?;
    _postTitle = snapshotData['postTitle'] as String?;
    _postDescription = snapshotData['postDescription'] as String?;
    _postUser = snapshotData['postUser'] as DocumentReference?;
    _timePosted = snapshotData['timePosted'] as DateTime?;
    _likes = getDataList(snapshotData['likes']);
    _numComments = castToType<int>(snapshotData['numComments']);
    _postOwner = snapshotData['postOwner'] as bool?;
    _numVotes = castToType<int>(snapshotData['num_votes']);
    _postLikedBy = getDataList(snapshotData['Post_liked_by']);
    _postVideo = snapshotData['postVideo'] as String?;
    _dateCreated = snapshotData['DateCreated'] as DateTime?;
    _dateUpdated = snapshotData['DateUpdated'] as DateTime?;
    _postSavedBy = getDataList(snapshotData['post_saved_by']);
    _additionalPhoto = getDataList(snapshotData['AdditionalPhoto']);
    _additionalVideo = getDataList(snapshotData['AdditionalVideo']);
    _allowComments = snapshotData['allowComments'] as bool?;
    _isPrivate = snapshotData['isPrivate'] as bool?;
    _location = snapshotData['location'] as String?;
    _postFrom = snapshotData['postFrom'] as String?;
    _postVideoURL = snapshotData['postVideoURL'] as String?;
    _postPhotoURL = snapshotData['postPhotoURL'] as String?;
    _category = snapshotData['category'] as String?;
    _postVideothumbnail = snapshotData['postVideothumbnail'] as String?;
    _activityName = snapshotData['Activity_Name'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('userPosts');

  static Stream<UserPostsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => UserPostsRecord.fromSnapshot(s));

  static Future<UserPostsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => UserPostsRecord.fromSnapshot(s));

  static UserPostsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      UserPostsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static UserPostsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      UserPostsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'UserPostsRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is UserPostsRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createUserPostsRecordData({
  String? postPhoto,
  String? postTitle,
  String? postDescription,
  DocumentReference? postUser,
  DateTime? timePosted,
  int? numComments,
  bool? postOwner,
  int? numVotes,
  String? postVideo,
  DateTime? dateCreated,
  DateTime? dateUpdated,
  bool? allowComments,
  bool? isPrivate,
  String? location,
  String? postFrom,
  String? postVideoURL,
  String? postPhotoURL,
  String? category,
  String? postVideothumbnail,
  String? activityName,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'postPhoto': postPhoto,
      'postTitle': postTitle,
      'postDescription': postDescription,
      'postUser': postUser,
      'timePosted': timePosted,
      'numComments': numComments,
      'postOwner': postOwner,
      'num_votes': numVotes,
      'postVideo': postVideo,
      'DateCreated': dateCreated,
      'DateUpdated': dateUpdated,
      'allowComments': allowComments,
      'isPrivate': isPrivate,
      'location': location,
      'postFrom': postFrom,
      'postVideoURL': postVideoURL,
      'postPhotoURL': postPhotoURL,
      'category': category,
      'postVideothumbnail': postVideothumbnail,
      'Activity_Name': activityName,
    }.withoutNulls,
  );

  return firestoreData;
}

class UserPostsRecordDocumentEquality implements Equality<UserPostsRecord> {
  const UserPostsRecordDocumentEquality();

  @override
  bool equals(UserPostsRecord? e1, UserPostsRecord? e2) {
    const listEquality = ListEquality();
    return e1?.postPhoto == e2?.postPhoto &&
        e1?.postTitle == e2?.postTitle &&
        e1?.postDescription == e2?.postDescription &&
        e1?.postUser == e2?.postUser &&
        e1?.timePosted == e2?.timePosted &&
        listEquality.equals(e1?.likes, e2?.likes) &&
        e1?.numComments == e2?.numComments &&
        e1?.postOwner == e2?.postOwner &&
        e1?.numVotes == e2?.numVotes &&
        listEquality.equals(e1?.postLikedBy, e2?.postLikedBy) &&
        e1?.postVideo == e2?.postVideo &&
        e1?.dateCreated == e2?.dateCreated &&
        e1?.dateUpdated == e2?.dateUpdated &&
        listEquality.equals(e1?.postSavedBy, e2?.postSavedBy) &&
        listEquality.equals(e1?.additionalPhoto, e2?.additionalPhoto) &&
        listEquality.equals(e1?.additionalVideo, e2?.additionalVideo) &&
        e1?.allowComments == e2?.allowComments &&
        e1?.isPrivate == e2?.isPrivate &&
        e1?.location == e2?.location &&
        e1?.postFrom == e2?.postFrom &&
        e1?.postVideoURL == e2?.postVideoURL &&
        e1?.postPhotoURL == e2?.postPhotoURL &&
        e1?.category == e2?.category &&
        e1?.postVideothumbnail == e2?.postVideothumbnail &&
        e1?.activityName == e2?.activityName;
  }

  @override
  int hash(UserPostsRecord? e) => const ListEquality().hash([
        e?.postPhoto,
        e?.postTitle,
        e?.postDescription,
        e?.postUser,
        e?.timePosted,
        e?.likes,
        e?.numComments,
        e?.postOwner,
        e?.numVotes,
        e?.postLikedBy,
        e?.postVideo,
        e?.dateCreated,
        e?.dateUpdated,
        e?.postSavedBy,
        e?.additionalPhoto,
        e?.additionalVideo,
        e?.allowComments,
        e?.isPrivate,
        e?.location,
        e?.postFrom,
        e?.postVideoURL,
        e?.postPhotoURL,
        e?.category,
        e?.postVideothumbnail,
        e?.activityName
      ]);

  @override
  bool isValidKey(Object? o) => o is UserPostsRecord;
}
