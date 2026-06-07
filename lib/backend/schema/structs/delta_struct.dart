// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class DeltaStruct extends FFFirebaseStruct {
  DeltaStruct({
    List<ContentStruct>? content,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _content = content,
        super(firestoreUtilData);

  // "content" field.
  List<ContentStruct>? _content;
  List<ContentStruct> get content => _content ?? const [];
  set content(List<ContentStruct>? val) => _content = val;

  void updateContent(Function(List<ContentStruct>) updateFn) {
    updateFn(_content ??= []);
  }

  bool hasContent() => _content != null;

  static DeltaStruct fromMap(Map<String, dynamic> data) => DeltaStruct(
        content: getStructList(
          data['content'],
          ContentStruct.fromMap,
        ),
      );

  static DeltaStruct? maybeFromMap(dynamic data) =>
      data is Map ? DeltaStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'content': _content?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'content': serializeParam(
          _content,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static DeltaStruct fromSerializableMap(Map<String, dynamic> data) =>
      DeltaStruct(
        content: deserializeStructParam<ContentStruct>(
          data['content'],
          ParamType.DataStruct,
          true,
          structBuilder: ContentStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'DeltaStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is DeltaStruct && listEquality.equals(content, other.content);
  }

  @override
  int get hashCode => const ListEquality().hash([content]);
}

DeltaStruct createDeltaStruct({
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    DeltaStruct(
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

DeltaStruct? updateDeltaStruct(
  DeltaStruct? delta, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    delta
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addDeltaStructData(
  Map<String, dynamic> firestoreData,
  DeltaStruct? delta,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (delta == null) {
    return;
  }
  if (delta.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && delta.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final deltaData = getDeltaFirestoreData(delta, forFieldValue);
  final nestedData = deltaData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = delta.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getDeltaFirestoreData(
  DeltaStruct? delta, [
  bool forFieldValue = false,
]) {
  if (delta == null) {
    return {};
  }
  final firestoreData = mapToFirestore(delta.toMap());

  // Add any Firestore field values
  mapToFirestore(delta.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getDeltaListFirestoreData(
  List<DeltaStruct>? deltas,
) =>
    deltas?.map((e) => getDeltaFirestoreData(e, true)).toList() ?? [];
