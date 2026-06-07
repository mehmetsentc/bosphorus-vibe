// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';
import '/backend/schema/enums/enums.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class StoryItemStruct extends FFFirebaseStruct {
  StoryItemStruct({
    StoryItemEnum? type,
    String? title,
    String? url,
    Color? backgroundColor,
    String? caption,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _type = type,
        _title = title,
        _url = url,
        _backgroundColor = backgroundColor,
        _caption = caption,
        super(firestoreUtilData);

  // "type" field.
  StoryItemEnum? _type;
  StoryItemEnum get type => _type ?? StoryItemEnum.text;
  set type(StoryItemEnum? val) => _type = val;

  bool hasType() => _type != null;

  // "title" field.
  String? _title;
  String get title => _title ?? '';
  set title(String? val) => _title = val;

  bool hasTitle() => _title != null;

  // "url" field.
  String? _url;
  String get url => _url ?? '';
  set url(String? val) => _url = val;

  bool hasUrl() => _url != null;

  // "backgroundColor" field.
  Color? _backgroundColor;
  Color? get backgroundColor => _backgroundColor;
  set backgroundColor(Color? val) => _backgroundColor = val;

  bool hasBackgroundColor() => _backgroundColor != null;

  // "caption" field.
  String? _caption;
  String get caption => _caption ?? '';
  set caption(String? val) => _caption = val;

  bool hasCaption() => _caption != null;

  static StoryItemStruct fromMap(Map<String, dynamic> data) => StoryItemStruct(
        type: data['type'] is StoryItemEnum
            ? data['type']
            : deserializeEnum<StoryItemEnum>(data['type']),
        title: data['title'] as String?,
        url: data['url'] as String?,
        backgroundColor: getSchemaColor(data['backgroundColor']),
        caption: data['caption'] as String?,
      );

  static StoryItemStruct? maybeFromMap(dynamic data) => data is Map
      ? StoryItemStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'type': _type?.serialize(),
        'title': _title,
        'url': _url,
        'backgroundColor': _backgroundColor,
        'caption': _caption,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'type': serializeParam(
          _type,
          ParamType.Enum,
        ),
        'title': serializeParam(
          _title,
          ParamType.String,
        ),
        'url': serializeParam(
          _url,
          ParamType.String,
        ),
        'backgroundColor': serializeParam(
          _backgroundColor,
          ParamType.Color,
        ),
        'caption': serializeParam(
          _caption,
          ParamType.String,
        ),
      }.withoutNulls;

  static StoryItemStruct fromSerializableMap(Map<String, dynamic> data) =>
      StoryItemStruct(
        type: deserializeParam<StoryItemEnum>(
          data['type'],
          ParamType.Enum,
          false,
        ),
        title: deserializeParam(
          data['title'],
          ParamType.String,
          false,
        ),
        url: deserializeParam(
          data['url'],
          ParamType.String,
          false,
        ),
        backgroundColor: deserializeParam(
          data['backgroundColor'],
          ParamType.Color,
          false,
        ),
        caption: deserializeParam(
          data['caption'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'StoryItemStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is StoryItemStruct &&
        type == other.type &&
        title == other.title &&
        url == other.url &&
        backgroundColor == other.backgroundColor &&
        caption == other.caption;
  }

  @override
  int get hashCode =>
      const ListEquality().hash([type, title, url, backgroundColor, caption]);
}

StoryItemStruct createStoryItemStruct({
  StoryItemEnum? type,
  String? title,
  String? url,
  Color? backgroundColor,
  String? caption,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    StoryItemStruct(
      type: type,
      title: title,
      url: url,
      backgroundColor: backgroundColor,
      caption: caption,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

StoryItemStruct? updateStoryItemStruct(
  StoryItemStruct? storyItem, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    storyItem
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addStoryItemStructData(
  Map<String, dynamic> firestoreData,
  StoryItemStruct? storyItem,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (storyItem == null) {
    return;
  }
  if (storyItem.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && storyItem.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final storyItemData = getStoryItemFirestoreData(storyItem, forFieldValue);
  final nestedData = storyItemData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = storyItem.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getStoryItemFirestoreData(
  StoryItemStruct? storyItem, [
  bool forFieldValue = false,
]) {
  if (storyItem == null) {
    return {};
  }
  final firestoreData = mapToFirestore(storyItem.toMap());

  // Add any Firestore field values
  mapToFirestore(storyItem.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getStoryItemListFirestoreData(
  List<StoryItemStruct>? storyItems,
) =>
    storyItems?.map((e) => getStoryItemFirestoreData(e, true)).toList() ?? [];
