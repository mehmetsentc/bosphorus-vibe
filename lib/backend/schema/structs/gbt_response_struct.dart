// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class GbtResponseStruct extends FFFirebaseStruct {
  GbtResponseStruct({
    String? id,
    String? object,
    int? created,
    String? model,
    List<ChoicesStruct>? choices,
    UsageStruct? usage,
    String? serviceTier,
    String? systemFingerprint,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _id = id,
        _object = object,
        _created = created,
        _model = model,
        _choices = choices,
        _usage = usage,
        _serviceTier = serviceTier,
        _systemFingerprint = systemFingerprint,
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

  // "created" field.
  int? _created;
  int get created => _created ?? 0;
  set created(int? val) => _created = val;

  void incrementCreated(int amount) => created = created + amount;

  bool hasCreated() => _created != null;

  // "model" field.
  String? _model;
  String get model => _model ?? '';
  set model(String? val) => _model = val;

  bool hasModel() => _model != null;

  // "choices" field.
  List<ChoicesStruct>? _choices;
  List<ChoicesStruct> get choices => _choices ?? const [];
  set choices(List<ChoicesStruct>? val) => _choices = val;

  void updateChoices(Function(List<ChoicesStruct>) updateFn) {
    updateFn(_choices ??= []);
  }

  bool hasChoices() => _choices != null;

  // "usage" field.
  UsageStruct? _usage;
  UsageStruct get usage => _usage ?? UsageStruct();
  set usage(UsageStruct? val) => _usage = val;

  void updateUsage(Function(UsageStruct) updateFn) {
    updateFn(_usage ??= UsageStruct());
  }

  bool hasUsage() => _usage != null;

  // "service_tier" field.
  String? _serviceTier;
  String get serviceTier => _serviceTier ?? '';
  set serviceTier(String? val) => _serviceTier = val;

  bool hasServiceTier() => _serviceTier != null;

  // "system_fingerprint" field.
  String? _systemFingerprint;
  String get systemFingerprint => _systemFingerprint ?? '';
  set systemFingerprint(String? val) => _systemFingerprint = val;

  bool hasSystemFingerprint() => _systemFingerprint != null;

  static GbtResponseStruct fromMap(Map<String, dynamic> data) =>
      GbtResponseStruct(
        id: data['id'] as String?,
        object: data['object'] as String?,
        created: castToType<int>(data['created']),
        model: data['model'] as String?,
        choices: getStructList(
          data['choices'],
          ChoicesStruct.fromMap,
        ),
        usage: data['usage'] is UsageStruct
            ? data['usage']
            : UsageStruct.maybeFromMap(data['usage']),
        serviceTier: data['service_tier'] as String?,
        systemFingerprint: data['system_fingerprint'] as String?,
      );

  static GbtResponseStruct? maybeFromMap(dynamic data) => data is Map
      ? GbtResponseStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'object': _object,
        'created': _created,
        'model': _model,
        'choices': _choices?.map((e) => e.toMap()).toList(),
        'usage': _usage?.toMap(),
        'service_tier': _serviceTier,
        'system_fingerprint': _systemFingerprint,
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
        'created': serializeParam(
          _created,
          ParamType.int,
        ),
        'model': serializeParam(
          _model,
          ParamType.String,
        ),
        'choices': serializeParam(
          _choices,
          ParamType.DataStruct,
          isList: true,
        ),
        'usage': serializeParam(
          _usage,
          ParamType.DataStruct,
        ),
        'service_tier': serializeParam(
          _serviceTier,
          ParamType.String,
        ),
        'system_fingerprint': serializeParam(
          _systemFingerprint,
          ParamType.String,
        ),
      }.withoutNulls;

  static GbtResponseStruct fromSerializableMap(Map<String, dynamic> data) =>
      GbtResponseStruct(
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
        created: deserializeParam(
          data['created'],
          ParamType.int,
          false,
        ),
        model: deserializeParam(
          data['model'],
          ParamType.String,
          false,
        ),
        choices: deserializeStructParam<ChoicesStruct>(
          data['choices'],
          ParamType.DataStruct,
          true,
          structBuilder: ChoicesStruct.fromSerializableMap,
        ),
        usage: deserializeStructParam(
          data['usage'],
          ParamType.DataStruct,
          false,
          structBuilder: UsageStruct.fromSerializableMap,
        ),
        serviceTier: deserializeParam(
          data['service_tier'],
          ParamType.String,
          false,
        ),
        systemFingerprint: deserializeParam(
          data['system_fingerprint'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'GbtResponseStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is GbtResponseStruct &&
        id == other.id &&
        object == other.object &&
        created == other.created &&
        model == other.model &&
        listEquality.equals(choices, other.choices) &&
        usage == other.usage &&
        serviceTier == other.serviceTier &&
        systemFingerprint == other.systemFingerprint;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        object,
        created,
        model,
        choices,
        usage,
        serviceTier,
        systemFingerprint
      ]);
}

GbtResponseStruct createGbtResponseStruct({
  String? id,
  String? object,
  int? created,
  String? model,
  UsageStruct? usage,
  String? serviceTier,
  String? systemFingerprint,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    GbtResponseStruct(
      id: id,
      object: object,
      created: created,
      model: model,
      usage: usage ?? (clearUnsetFields ? UsageStruct() : null),
      serviceTier: serviceTier,
      systemFingerprint: systemFingerprint,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

GbtResponseStruct? updateGbtResponseStruct(
  GbtResponseStruct? gbtResponse, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    gbtResponse
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addGbtResponseStructData(
  Map<String, dynamic> firestoreData,
  GbtResponseStruct? gbtResponse,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (gbtResponse == null) {
    return;
  }
  if (gbtResponse.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && gbtResponse.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final gbtResponseData =
      getGbtResponseFirestoreData(gbtResponse, forFieldValue);
  final nestedData =
      gbtResponseData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = gbtResponse.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getGbtResponseFirestoreData(
  GbtResponseStruct? gbtResponse, [
  bool forFieldValue = false,
]) {
  if (gbtResponse == null) {
    return {};
  }
  final firestoreData = mapToFirestore(gbtResponse.toMap());

  // Handle nested data for "usage" field.
  addUsageStructData(
    firestoreData,
    gbtResponse.hasUsage() ? gbtResponse.usage : null,
    'usage',
    forFieldValue,
  );

  // Add any Firestore field values
  mapToFirestore(gbtResponse.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getGbtResponseListFirestoreData(
  List<GbtResponseStruct>? gbtResponses,
) =>
    gbtResponses?.map((e) => getGbtResponseFirestoreData(e, true)).toList() ??
    [];
