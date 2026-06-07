// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';
import '/backend/schema/enums/enums.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class BuildshipConfigJsonStruct extends FFFirebaseStruct {
  BuildshipConfigJsonStruct({
    String? path,
    String? authOption,
    List<String>? inputList,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _path = path,
        _authOption = authOption,
        _inputList = inputList,
        super(firestoreUtilData);

  // "path" field.
  String? _path;
  String get path => _path ?? '';
  set path(String? val) => _path = val;

  bool hasPath() => _path != null;

  // "authOption" field.
  String? _authOption;
  String get authOption => _authOption ?? '';
  set authOption(String? val) => _authOption = val;

  bool hasAuthOption() => _authOption != null;

  // "inputList" field.
  List<String>? _inputList;
  List<String> get inputList => _inputList ?? const [];
  set inputList(List<String>? val) => _inputList = val;

  void updateInputList(Function(List<String>) updateFn) {
    updateFn(_inputList ??= []);
  }

  bool hasInputList() => _inputList != null;

  static BuildshipConfigJsonStruct fromMap(Map<String, dynamic> data) =>
      BuildshipConfigJsonStruct(
        path: data['path'] as String?,
        authOption: data['authOption'] as String?,
        inputList: getDataList(data['inputList']),
      );

  static BuildshipConfigJsonStruct? maybeFromMap(dynamic data) => data is Map
      ? BuildshipConfigJsonStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'path': _path,
        'authOption': _authOption,
        'inputList': _inputList,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'path': serializeParam(
          _path,
          ParamType.String,
        ),
        'authOption': serializeParam(
          _authOption,
          ParamType.String,
        ),
        'inputList': serializeParam(
          _inputList,
          ParamType.String,
          isList: true,
        ),
      }.withoutNulls;

  static BuildshipConfigJsonStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      BuildshipConfigJsonStruct(
        path: deserializeParam(
          data['path'],
          ParamType.String,
          false,
        ),
        authOption: deserializeParam(
          data['authOption'],
          ParamType.String,
          false,
        ),
        inputList: deserializeParam<String>(
          data['inputList'],
          ParamType.String,
          true,
        ),
      );

  @override
  String toString() => 'BuildshipConfigJsonStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is BuildshipConfigJsonStruct &&
        path == other.path &&
        authOption == other.authOption &&
        listEquality.equals(inputList, other.inputList);
  }

  @override
  int get hashCode => const ListEquality().hash([path, authOption, inputList]);
}

BuildshipConfigJsonStruct createBuildshipConfigJsonStruct({
  String? path,
  String? authOption,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    BuildshipConfigJsonStruct(
      path: path,
      authOption: authOption,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

BuildshipConfigJsonStruct? updateBuildshipConfigJsonStruct(
  BuildshipConfigJsonStruct? buildshipConfigJson, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    buildshipConfigJson
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addBuildshipConfigJsonStructData(
  Map<String, dynamic> firestoreData,
  BuildshipConfigJsonStruct? buildshipConfigJson,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (buildshipConfigJson == null) {
    return;
  }
  if (buildshipConfigJson.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && buildshipConfigJson.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final buildshipConfigJsonData =
      getBuildshipConfigJsonFirestoreData(buildshipConfigJson, forFieldValue);
  final nestedData =
      buildshipConfigJsonData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      buildshipConfigJson.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getBuildshipConfigJsonFirestoreData(
  BuildshipConfigJsonStruct? buildshipConfigJson, [
  bool forFieldValue = false,
]) {
  if (buildshipConfigJson == null) {
    return {};
  }
  final firestoreData = mapToFirestore(buildshipConfigJson.toMap());

  // Add any Firestore field values
  mapToFirestore(buildshipConfigJson.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getBuildshipConfigJsonListFirestoreData(
  List<BuildshipConfigJsonStruct>? buildshipConfigJsons,
) =>
    buildshipConfigJsons
        ?.map((e) => getBuildshipConfigJsonFirestoreData(e, true))
        .toList() ??
    [];
