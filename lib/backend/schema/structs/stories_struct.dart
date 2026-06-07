// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class StoriesStruct extends FFFirebaseStruct {
  StoriesStruct({
    DocumentReference? user,
    String? storyvideo,
    String? storyPhoto,
    String? storyDescription,
    DateTime? storyPostedAt,
    List<DocumentReference>? likes,
    int? numCommets,
    bool? isOwber,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _user = user,
        _storyvideo = storyvideo,
        _storyPhoto = storyPhoto,
        _storyDescription = storyDescription,
        _storyPostedAt = storyPostedAt,
        _likes = likes,
        _numCommets = numCommets,
        _isOwber = isOwber,
        super(firestoreUtilData);

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  set user(DocumentReference? val) => _user = val;

  bool hasUser() => _user != null;

  // "storyvideo" field.
  String? _storyvideo;
  String get storyvideo => _storyvideo ?? '';
  set storyvideo(String? val) => _storyvideo = val;

  bool hasStoryvideo() => _storyvideo != null;

  // "storyPhoto" field.
  String? _storyPhoto;
  String get storyPhoto => _storyPhoto ?? '';
  set storyPhoto(String? val) => _storyPhoto = val;

  bool hasStoryPhoto() => _storyPhoto != null;

  // "storyDescription" field.
  String? _storyDescription;
  String get storyDescription => _storyDescription ?? '';
  set storyDescription(String? val) => _storyDescription = val;

  bool hasStoryDescription() => _storyDescription != null;

  // "storyPostedAt" field.
  DateTime? _storyPostedAt;
  DateTime? get storyPostedAt => _storyPostedAt;
  set storyPostedAt(DateTime? val) => _storyPostedAt = val;

  bool hasStoryPostedAt() => _storyPostedAt != null;

  // "likes" field.
  List<DocumentReference>? _likes;
  List<DocumentReference> get likes => _likes ?? const [];
  set likes(List<DocumentReference>? val) => _likes = val;

  void updateLikes(Function(List<DocumentReference>) updateFn) {
    updateFn(_likes ??= []);
  }

  bool hasLikes() => _likes != null;

  // "numCommets" field.
  int? _numCommets;
  int get numCommets => _numCommets ?? 0;
  set numCommets(int? val) => _numCommets = val;

  void incrementNumCommets(int amount) => numCommets = numCommets + amount;

  bool hasNumCommets() => _numCommets != null;

  // "isOwber" field.
  bool? _isOwber;
  bool get isOwber => _isOwber ?? false;
  set isOwber(bool? val) => _isOwber = val;

  bool hasIsOwber() => _isOwber != null;

  static StoriesStruct fromMap(Map<String, dynamic> data) => StoriesStruct(
        user: data['user'] as DocumentReference?,
        storyvideo: data['storyvideo'] as String?,
        storyPhoto: data['storyPhoto'] as String?,
        storyDescription: data['storyDescription'] as String?,
        storyPostedAt: data['storyPostedAt'] as DateTime?,
        likes: getDataList(data['likes']),
        numCommets: castToType<int>(data['numCommets']),
        isOwber: data['isOwber'] as bool?,
      );

  static StoriesStruct? maybeFromMap(dynamic data) =>
      data is Map ? StoriesStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'user': _user,
        'storyvideo': _storyvideo,
        'storyPhoto': _storyPhoto,
        'storyDescription': _storyDescription,
        'storyPostedAt': _storyPostedAt,
        'likes': _likes,
        'numCommets': _numCommets,
        'isOwber': _isOwber,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'user': serializeParam(
          _user,
          ParamType.DocumentReference,
        ),
        'storyvideo': serializeParam(
          _storyvideo,
          ParamType.String,
        ),
        'storyPhoto': serializeParam(
          _storyPhoto,
          ParamType.String,
        ),
        'storyDescription': serializeParam(
          _storyDescription,
          ParamType.String,
        ),
        'storyPostedAt': serializeParam(
          _storyPostedAt,
          ParamType.DateTime,
        ),
        'likes': serializeParam(
          _likes,
          ParamType.DocumentReference,
          isList: true,
        ),
        'numCommets': serializeParam(
          _numCommets,
          ParamType.int,
        ),
        'isOwber': serializeParam(
          _isOwber,
          ParamType.bool,
        ),
      }.withoutNulls;

  static StoriesStruct fromSerializableMap(Map<String, dynamic> data) =>
      StoriesStruct(
        user: deserializeParam(
          data['user'],
          ParamType.DocumentReference,
          false,
          collectionNamePath: ['users'],
        ),
        storyvideo: deserializeParam(
          data['storyvideo'],
          ParamType.String,
          false,
        ),
        storyPhoto: deserializeParam(
          data['storyPhoto'],
          ParamType.String,
          false,
        ),
        storyDescription: deserializeParam(
          data['storyDescription'],
          ParamType.String,
          false,
        ),
        storyPostedAt: deserializeParam(
          data['storyPostedAt'],
          ParamType.DateTime,
          false,
        ),
        likes: deserializeParam<DocumentReference>(
          data['likes'],
          ParamType.DocumentReference,
          true,
          collectionNamePath: ['users'],
        ),
        numCommets: deserializeParam(
          data['numCommets'],
          ParamType.int,
          false,
        ),
        isOwber: deserializeParam(
          data['isOwber'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'StoriesStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is StoriesStruct &&
        user == other.user &&
        storyvideo == other.storyvideo &&
        storyPhoto == other.storyPhoto &&
        storyDescription == other.storyDescription &&
        storyPostedAt == other.storyPostedAt &&
        listEquality.equals(likes, other.likes) &&
        numCommets == other.numCommets &&
        isOwber == other.isOwber;
  }

  @override
  int get hashCode => const ListEquality().hash([
        user,
        storyvideo,
        storyPhoto,
        storyDescription,
        storyPostedAt,
        likes,
        numCommets,
        isOwber
      ]);
}

StoriesStruct createStoriesStruct({
  DocumentReference? user,
  String? storyvideo,
  String? storyPhoto,
  String? storyDescription,
  DateTime? storyPostedAt,
  int? numCommets,
  bool? isOwber,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    StoriesStruct(
      user: user,
      storyvideo: storyvideo,
      storyPhoto: storyPhoto,
      storyDescription: storyDescription,
      storyPostedAt: storyPostedAt,
      numCommets: numCommets,
      isOwber: isOwber,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

StoriesStruct? updateStoriesStruct(
  StoriesStruct? stories, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    stories
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addStoriesStructData(
  Map<String, dynamic> firestoreData,
  StoriesStruct? stories,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (stories == null) {
    return;
  }
  if (stories.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && stories.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final storiesData = getStoriesFirestoreData(stories, forFieldValue);
  final nestedData = storiesData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = stories.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getStoriesFirestoreData(
  StoriesStruct? stories, [
  bool forFieldValue = false,
]) {
  if (stories == null) {
    return {};
  }
  final firestoreData = mapToFirestore(stories.toMap());

  // Add any Firestore field values
  mapToFirestore(stories.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getStoriesListFirestoreData(
  List<StoriesStruct>? storiess,
) =>
    storiess?.map((e) => getStoriesFirestoreData(e, true)).toList() ?? [];
