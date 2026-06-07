// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ChunkStruct extends FFFirebaseStruct {
  ChunkStruct({
    String? id,
    String? object,
    DeltaStruct? delta,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _id = id,
        _object = object,
        _delta = delta,
        super(firestoreUtilData);

  // "id" field.
  String? _id;
  String get id => _id ?? '';
  set id(String? val) => _id = val;

  bool hasId() => _id != null;

  // "object" field.
  String? _object;
  String get object => _object ?? '';
  set object(String? val) => _object = val;

  bool hasObject() => _object != null;

  // "delta" field.
  DeltaStruct? _delta;
  DeltaStruct get delta => _delta ?? DeltaStruct();
  set delta(DeltaStruct? val) => _delta = val;

  void updateDelta(Function(DeltaStruct) updateFn) {
    updateFn(_delta ??= DeltaStruct());
  }

  bool hasDelta() => _delta != null;

  static ChunkStruct fromMap(Map<String, dynamic> data) => ChunkStruct(
        id: data['id'] as String?,
        object: data['object'] as String?,
        delta: data['delta'] is DeltaStruct
            ? data['delta']
            : DeltaStruct.maybeFromMap(data['delta']),
      );

  static ChunkStruct? maybeFromMap(dynamic data) =>
      data is Map ? ChunkStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'object': _object,
        'delta': _delta?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.String,
        ),
        'object': serializeParam(
          _object,
          ParamType.String,
        ),
        'delta': serializeParam(
          _delta,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static ChunkStruct fromSerializableMap(Map<String, dynamic> data) =>
      ChunkStruct(
        id: deserializeParam(
          data['id'],
          ParamType.String,
          false,
        ),
        object: deserializeParam(
          data['object'],
          ParamType.String,
          false,
        ),
        delta: deserializeStructParam(
          data['delta'],
          ParamType.DataStruct,
          false,
          structBuilder: DeltaStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'ChunkStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ChunkStruct &&
        id == other.id &&
        object == other.object &&
        delta == other.delta;
  }

  @override
  int get hashCode => const ListEquality().hash([id, object, delta]);
}

ChunkStruct createChunkStruct({
  String? id,
  String? object,
  DeltaStruct? delta,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    ChunkStruct(
      id: id,
      object: object,
      delta: delta ?? (clearUnsetFields ? DeltaStruct() : null),
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

ChunkStruct? updateChunkStruct(
  ChunkStruct? chunk, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    chunk
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addChunkStructData(
  Map<String, dynamic> firestoreData,
  ChunkStruct? chunk,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (chunk == null) {
    return;
  }
  if (chunk.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && chunk.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final chunkData = getChunkFirestoreData(chunk, forFieldValue);
  final nestedData = chunkData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = chunk.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getChunkFirestoreData(
  ChunkStruct? chunk, [
  bool forFieldValue = false,
]) {
  if (chunk == null) {
    return {};
  }
  final firestoreData = mapToFirestore(chunk.toMap());

  // Handle nested data for "delta" field.
  addDeltaStructData(
    firestoreData,
    chunk.hasDelta() ? chunk.delta : null,
    'delta',
    forFieldValue,
  );

  // Add any Firestore field values
  mapToFirestore(chunk.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getChunkListFirestoreData(
  List<ChunkStruct>? chunks,
) =>
    chunks?.map((e) => getChunkFirestoreData(e, true)).toList() ?? [];
