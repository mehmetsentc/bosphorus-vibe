import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';


import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class UsersRecord extends FirestoreRecord {
  UsersRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "display_name" field.
  String? _displayName;
  String get displayName => _displayName ?? '';
  bool hasDisplayName() => _displayName != null;

  // "email" field.
  String? _email;
  String get email => _email ?? '';
  bool hasEmail() => _email != null;

  // "photo_url" field.
  String? _photoUrl;
  String get photoUrl => _photoUrl ?? '';
  bool hasPhotoUrl() => _photoUrl != null;

  // "uid" field.
  String? _uid;
  String get uid => _uid ?? '';
  bool hasUid() => _uid != null;

  // "created_time" field.
  DateTime? _createdTime;
  DateTime? get createdTime => _createdTime;
  bool hasCreatedTime() => _createdTime != null;

  // "phone_number" field.
  String? _phoneNumber;
  String get phoneNumber => _phoneNumber ?? '';
  bool hasPhoneNumber() => _phoneNumber != null;

  // "userName" field.
  String? _userName;
  String get userName => _userName ?? '';
  bool hasUserName() => _userName != null;

  // "bio" field.
  String? _bio;
  String get bio => _bio ?? '';
  bool hasBio() => _bio != null;

  // "isFollowed" field.
  bool? _isFollowed;
  bool get isFollowed => _isFollowed ?? false;
  bool hasIsFollowed() => _isFollowed != null;

  // "shortDescription" field.
  String? _shortDescription;
  String get shortDescription => _shortDescription ?? '';
  bool hasShortDescription() => _shortDescription != null;

  // "last_active_time" field.
  DateTime? _lastActiveTime;
  DateTime? get lastActiveTime => _lastActiveTime;
  bool hasLastActiveTime() => _lastActiveTime != null;

  // "role" field.
  String? _role;
  String get role => _role ?? '';
  bool hasRole() => _role != null;

  // "title" field.
  String? _title;
  String get title => _title ?? '';
  bool hasTitle() => _title != null;

  // "is_private" field.
  bool? _isPrivate;
  bool get isPrivate => _isPrivate ?? false;
  bool hasIsPrivate() => _isPrivate != null;

  // "blocked_user" field.
  List<DocumentReference>? _blockedUser;
  List<DocumentReference> get blockedUser => _blockedUser ?? const [];
  bool hasBlockedUser() => _blockedUser != null;

  // "follow_request" field.
  List<DocumentReference>? _followRequest;
  List<DocumentReference> get followRequest => _followRequest ?? const [];
  bool hasFollowRequest() => _followRequest != null;

  // "profile_visibility" field.
  String? _profileVisibility;
  String get profileVisibility => _profileVisibility ?? '';
  bool hasProfileVisibility() => _profileVisibility != null;

  // "comment_permission" field.
  String? _commentPermission;
  String get commentPermission => _commentPermission ?? '';
  bool hasCommentPermission() => _commentPermission != null;

  // "notif_likes" field.
  bool? _notifLikes;
  bool get notifLikes => _notifLikes ?? false;
  bool hasNotifLikes() => _notifLikes != null;

  // "notif_comments" field.
  bool? _notifComments;
  bool get notifComments => _notifComments ?? false;
  bool hasNotifComments() => _notifComments != null;

  // "notif_new_followers" field.
  bool? _notifNewFollowers;
  bool get notifNewFollowers => _notifNewFollowers ?? false;
  bool hasNotifNewFollowers() => _notifNewFollowers != null;

  void _initializeFields() {
    _displayName = snapshotData['display_name'] as String?;
    _email = snapshotData['email'] as String?;
    _photoUrl = snapshotData['photo_url'] as String?;
    _uid = snapshotData['uid'] as String?;
    _createdTime = snapshotData['created_time'] as DateTime?;
    _phoneNumber = snapshotData['phone_number'] as String?;
    _userName = snapshotData['userName'] as String?;
    _bio = snapshotData['bio'] as String?;
    _isFollowed = snapshotData['isFollowed'] as bool?;
    _shortDescription = snapshotData['shortDescription'] as String?;
    _lastActiveTime = snapshotData['last_active_time'] as DateTime?;
    _role = snapshotData['role'] as String?;
    _title = snapshotData['title'] as String?;
    _isPrivate = snapshotData['is_private'] as bool?;
    _blockedUser = getDataList(snapshotData['blocked_user']);
    _followRequest = getDataList(snapshotData['follow_request']);
    _profileVisibility = snapshotData['profile_visibility'] as String?;
    _commentPermission = snapshotData['comment_permission'] as String?;
    _notifLikes = snapshotData['notif_likes'] as bool?;
    _notifComments = snapshotData['notif_comments'] as bool?;
    _notifNewFollowers = snapshotData['notif_new_followers'] as bool?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('users');

  static Stream<UsersRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => UsersRecord.fromSnapshot(s));

  static Future<UsersRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => UsersRecord.fromSnapshot(s));

  static UsersRecord fromSnapshot(DocumentSnapshot snapshot) => UsersRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static UsersRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      UsersRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'UsersRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is UsersRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createUsersRecordData({
  String? displayName,
  String? email,
  String? photoUrl,
  String? uid,
  DateTime? createdTime,
  String? phoneNumber,
  String? userName,
  String? bio,
  bool? isFollowed,
  String? shortDescription,
  DateTime? lastActiveTime,
  String? role,
  String? title,
  bool? isPrivate,
  String? profileVisibility,
  String? commentPermission,
  bool? notifLikes,
  bool? notifComments,
  bool? notifNewFollowers,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'display_name': displayName,
      'email': email,
      'photo_url': photoUrl,
      'uid': uid,
      'created_time': createdTime,
      'phone_number': phoneNumber,
      'userName': userName,
      'bio': bio,
      'isFollowed': isFollowed,
      'shortDescription': shortDescription,
      'last_active_time': lastActiveTime,
      'role': role,
      'title': title,
      'is_private': isPrivate,
      'profile_visibility': profileVisibility,
      'comment_permission': commentPermission,
      'notif_likes': notifLikes,
      'notif_comments': notifComments,
      'notif_new_followers': notifNewFollowers,
    }.withoutNulls,
  );

  return firestoreData;
}

class UsersRecordDocumentEquality implements Equality<UsersRecord> {
  const UsersRecordDocumentEquality();

  @override
  bool equals(UsersRecord? e1, UsersRecord? e2) {
    const listEquality = ListEquality();
    return e1?.displayName == e2?.displayName &&
        e1?.email == e2?.email &&
        e1?.photoUrl == e2?.photoUrl &&
        e1?.uid == e2?.uid &&
        e1?.createdTime == e2?.createdTime &&
        e1?.phoneNumber == e2?.phoneNumber &&
        e1?.userName == e2?.userName &&
        e1?.bio == e2?.bio &&
        e1?.isFollowed == e2?.isFollowed &&
        e1?.shortDescription == e2?.shortDescription &&
        e1?.lastActiveTime == e2?.lastActiveTime &&
        e1?.role == e2?.role &&
        e1?.title == e2?.title &&
        e1?.isPrivate == e2?.isPrivate &&
        listEquality.equals(e1?.blockedUser, e2?.blockedUser) &&
        listEquality.equals(e1?.followRequest, e2?.followRequest) &&
        e1?.profileVisibility == e2?.profileVisibility &&
        e1?.commentPermission == e2?.commentPermission &&
        e1?.notifLikes == e2?.notifLikes &&
        e1?.notifComments == e2?.notifComments &&
        e1?.notifNewFollowers == e2?.notifNewFollowers;
  }

  @override
  int hash(UsersRecord? e) => const ListEquality().hash([
        e?.displayName,
        e?.email,
        e?.photoUrl,
        e?.uid,
        e?.createdTime,
        e?.phoneNumber,
        e?.userName,
        e?.bio,
        e?.isFollowed,
        e?.shortDescription,
        e?.lastActiveTime,
        e?.role,
        e?.title,
        e?.isPrivate,
        e?.blockedUser,
        e?.followRequest,
        e?.profileVisibility,
        e?.commentPermission,
        e?.notifLikes,
        e?.notifComments,
        e?.notifNewFollowers
      ]);

  @override
  bool isValidKey(Object? o) => o is UsersRecord;
}
