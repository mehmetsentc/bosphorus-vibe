// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class NotificationScheduleStruct extends FFFirebaseStruct {
  NotificationScheduleStruct({
    String? scheduleName,
    bool? randomTime,
    int? randomStartTime,
    int? randomEndTime,
    bool? sunday,
    bool? monday,
    bool? tuesday,
    bool? wednesday,
    bool? thursday,
    bool? friday,
    bool? saturday,
    bool? isActive,
    List<String>? notificationList,
    int? specificTime,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _scheduleName = scheduleName,
        _randomTime = randomTime,
        _randomStartTime = randomStartTime,
        _randomEndTime = randomEndTime,
        _sunday = sunday,
        _monday = monday,
        _tuesday = tuesday,
        _wednesday = wednesday,
        _thursday = thursday,
        _friday = friday,
        _saturday = saturday,
        _isActive = isActive,
        _notificationList = notificationList,
        _specificTime = specificTime,
        super(firestoreUtilData);

  // "scheduleName" field.
  String? _scheduleName;
  String get scheduleName => _scheduleName ?? '';
  set scheduleName(String? val) => _scheduleName = val;

  bool hasScheduleName() => _scheduleName != null;

  // "randomTime" field.
  bool? _randomTime;
  bool get randomTime => _randomTime ?? false;
  set randomTime(bool? val) => _randomTime = val;

  bool hasRandomTime() => _randomTime != null;

  // "randomStartTime" field.
  int? _randomStartTime;
  int get randomStartTime => _randomStartTime ?? 0;
  set randomStartTime(int? val) => _randomStartTime = val;

  void incrementRandomStartTime(int amount) =>
      randomStartTime = randomStartTime + amount;

  bool hasRandomStartTime() => _randomStartTime != null;

  // "randomEndTime" field.
  int? _randomEndTime;
  int get randomEndTime => _randomEndTime ?? 0;
  set randomEndTime(int? val) => _randomEndTime = val;

  void incrementRandomEndTime(int amount) =>
      randomEndTime = randomEndTime + amount;

  bool hasRandomEndTime() => _randomEndTime != null;

  // "sunday" field.
  bool? _sunday;
  bool get sunday => _sunday ?? false;
  set sunday(bool? val) => _sunday = val;

  bool hasSunday() => _sunday != null;

  // "monday" field.
  bool? _monday;
  bool get monday => _monday ?? false;
  set monday(bool? val) => _monday = val;

  bool hasMonday() => _monday != null;

  // "tuesday" field.
  bool? _tuesday;
  bool get tuesday => _tuesday ?? false;
  set tuesday(bool? val) => _tuesday = val;

  bool hasTuesday() => _tuesday != null;

  // "wednesday" field.
  bool? _wednesday;
  bool get wednesday => _wednesday ?? false;
  set wednesday(bool? val) => _wednesday = val;

  bool hasWednesday() => _wednesday != null;

  // "thursday" field.
  bool? _thursday;
  bool get thursday => _thursday ?? false;
  set thursday(bool? val) => _thursday = val;

  bool hasThursday() => _thursday != null;

  // "friday" field.
  bool? _friday;
  bool get friday => _friday ?? false;
  set friday(bool? val) => _friday = val;

  bool hasFriday() => _friday != null;

  // "saturday" field.
  bool? _saturday;
  bool get saturday => _saturday ?? false;
  set saturday(bool? val) => _saturday = val;

  bool hasSaturday() => _saturday != null;

  // "isActive" field.
  bool? _isActive;
  bool get isActive => _isActive ?? false;
  set isActive(bool? val) => _isActive = val;

  bool hasIsActive() => _isActive != null;

  // "notificationList" field.
  List<String>? _notificationList;
  List<String> get notificationList => _notificationList ?? const [];
  set notificationList(List<String>? val) => _notificationList = val;

  void updateNotificationList(Function(List<String>) updateFn) {
    updateFn(_notificationList ??= []);
  }

  bool hasNotificationList() => _notificationList != null;

  // "specificTime" field.
  int? _specificTime;
  int get specificTime => _specificTime ?? 0;
  set specificTime(int? val) => _specificTime = val;

  void incrementSpecificTime(int amount) =>
      specificTime = specificTime + amount;

  bool hasSpecificTime() => _specificTime != null;

  static NotificationScheduleStruct fromMap(Map<String, dynamic> data) =>
      NotificationScheduleStruct(
        scheduleName: data['scheduleName'] as String?,
        randomTime: data['randomTime'] as bool?,
        randomStartTime: castToType<int>(data['randomStartTime']),
        randomEndTime: castToType<int>(data['randomEndTime']),
        sunday: data['sunday'] as bool?,
        monday: data['monday'] as bool?,
        tuesday: data['tuesday'] as bool?,
        wednesday: data['wednesday'] as bool?,
        thursday: data['thursday'] as bool?,
        friday: data['friday'] as bool?,
        saturday: data['saturday'] as bool?,
        isActive: data['isActive'] as bool?,
        notificationList: getDataList(data['notificationList']),
        specificTime: castToType<int>(data['specificTime']),
      );

  static NotificationScheduleStruct? maybeFromMap(dynamic data) => data is Map
      ? NotificationScheduleStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'scheduleName': _scheduleName,
        'randomTime': _randomTime,
        'randomStartTime': _randomStartTime,
        'randomEndTime': _randomEndTime,
        'sunday': _sunday,
        'monday': _monday,
        'tuesday': _tuesday,
        'wednesday': _wednesday,
        'thursday': _thursday,
        'friday': _friday,
        'saturday': _saturday,
        'isActive': _isActive,
        'notificationList': _notificationList,
        'specificTime': _specificTime,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'scheduleName': serializeParam(
          _scheduleName,
          ParamType.String,
        ),
        'randomTime': serializeParam(
          _randomTime,
          ParamType.bool,
        ),
        'randomStartTime': serializeParam(
          _randomStartTime,
          ParamType.int,
        ),
        'randomEndTime': serializeParam(
          _randomEndTime,
          ParamType.int,
        ),
        'sunday': serializeParam(
          _sunday,
          ParamType.bool,
        ),
        'monday': serializeParam(
          _monday,
          ParamType.bool,
        ),
        'tuesday': serializeParam(
          _tuesday,
          ParamType.bool,
        ),
        'wednesday': serializeParam(
          _wednesday,
          ParamType.bool,
        ),
        'thursday': serializeParam(
          _thursday,
          ParamType.bool,
        ),
        'friday': serializeParam(
          _friday,
          ParamType.bool,
        ),
        'saturday': serializeParam(
          _saturday,
          ParamType.bool,
        ),
        'isActive': serializeParam(
          _isActive,
          ParamType.bool,
        ),
        'notificationList': serializeParam(
          _notificationList,
          ParamType.String,
          isList: true,
        ),
        'specificTime': serializeParam(
          _specificTime,
          ParamType.int,
        ),
      }.withoutNulls;

  static NotificationScheduleStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      NotificationScheduleStruct(
        scheduleName: deserializeParam(
          data['scheduleName'],
          ParamType.String,
          false,
        ),
        randomTime: deserializeParam(
          data['randomTime'],
          ParamType.bool,
          false,
        ),
        randomStartTime: deserializeParam(
          data['randomStartTime'],
          ParamType.int,
          false,
        ),
        randomEndTime: deserializeParam(
          data['randomEndTime'],
          ParamType.int,
          false,
        ),
        sunday: deserializeParam(
          data['sunday'],
          ParamType.bool,
          false,
        ),
        monday: deserializeParam(
          data['monday'],
          ParamType.bool,
          false,
        ),
        tuesday: deserializeParam(
          data['tuesday'],
          ParamType.bool,
          false,
        ),
        wednesday: deserializeParam(
          data['wednesday'],
          ParamType.bool,
          false,
        ),
        thursday: deserializeParam(
          data['thursday'],
          ParamType.bool,
          false,
        ),
        friday: deserializeParam(
          data['friday'],
          ParamType.bool,
          false,
        ),
        saturday: deserializeParam(
          data['saturday'],
          ParamType.bool,
          false,
        ),
        isActive: deserializeParam(
          data['isActive'],
          ParamType.bool,
          false,
        ),
        notificationList: deserializeParam<String>(
          data['notificationList'],
          ParamType.String,
          true,
        ),
        specificTime: deserializeParam(
          data['specificTime'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'NotificationScheduleStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is NotificationScheduleStruct &&
        scheduleName == other.scheduleName &&
        randomTime == other.randomTime &&
        randomStartTime == other.randomStartTime &&
        randomEndTime == other.randomEndTime &&
        sunday == other.sunday &&
        monday == other.monday &&
        tuesday == other.tuesday &&
        wednesday == other.wednesday &&
        thursday == other.thursday &&
        friday == other.friday &&
        saturday == other.saturday &&
        isActive == other.isActive &&
        listEquality.equals(notificationList, other.notificationList) &&
        specificTime == other.specificTime;
  }

  @override
  int get hashCode => const ListEquality().hash([
        scheduleName,
        randomTime,
        randomStartTime,
        randomEndTime,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        isActive,
        notificationList,
        specificTime
      ]);
}

NotificationScheduleStruct createNotificationScheduleStruct({
  String? scheduleName,
  bool? randomTime,
  int? randomStartTime,
  int? randomEndTime,
  bool? sunday,
  bool? monday,
  bool? tuesday,
  bool? wednesday,
  bool? thursday,
  bool? friday,
  bool? saturday,
  bool? isActive,
  int? specificTime,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    NotificationScheduleStruct(
      scheduleName: scheduleName,
      randomTime: randomTime,
      randomStartTime: randomStartTime,
      randomEndTime: randomEndTime,
      sunday: sunday,
      monday: monday,
      tuesday: tuesday,
      wednesday: wednesday,
      thursday: thursday,
      friday: friday,
      saturday: saturday,
      isActive: isActive,
      specificTime: specificTime,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

NotificationScheduleStruct? updateNotificationScheduleStruct(
  NotificationScheduleStruct? notificationSchedule, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    notificationSchedule
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addNotificationScheduleStructData(
  Map<String, dynamic> firestoreData,
  NotificationScheduleStruct? notificationSchedule,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (notificationSchedule == null) {
    return;
  }
  if (notificationSchedule.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && notificationSchedule.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final notificationScheduleData =
      getNotificationScheduleFirestoreData(notificationSchedule, forFieldValue);
  final nestedData =
      notificationScheduleData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      notificationSchedule.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getNotificationScheduleFirestoreData(
  NotificationScheduleStruct? notificationSchedule, [
  bool forFieldValue = false,
]) {
  if (notificationSchedule == null) {
    return {};
  }
  final firestoreData = mapToFirestore(notificationSchedule.toMap());

  // Add any Firestore field values
  mapToFirestore(notificationSchedule.firestoreUtilData.fieldValues)
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getNotificationScheduleListFirestoreData(
  List<NotificationScheduleStruct>? notificationSchedules,
) =>
    notificationSchedules
        ?.map((e) => getNotificationScheduleFirestoreData(e, true))
        .toList() ??
    [];
