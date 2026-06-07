import 'package:flutter/material.dart';
import '/backend/schema/structs/index.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'flutter_flow/flutter_flow_util.dart';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    prefs = await SharedPreferences.getInstance();
    _safeInit(() {
      if (prefs.containsKey('ff_sampleSchedule')) {
        try {
          final serializedData = prefs.getString('ff_sampleSchedule') ?? '{}';
          _sampleSchedule = NotificationScheduleStruct.fromSerializableMap(
              jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late SharedPreferences prefs;

  /// A notification schedule with its settings
  NotificationScheduleStruct _sampleSchedule =
      NotificationScheduleStruct.fromSerializableMap(jsonDecode(
          '{\"scheduleName\":\"sampleSchedule\",\"randomStartTime\":\"9\",\"randomEndTime\":\"18\",\"monday\":\"true\",\"tuesday\":\"true\",\"wednesday\":\"true\",\"thursday\":\"false\",\"friday\":\"true\",\"saturday\":\"true\",\"isActive\":\"true\",\"notificationList\":\"[\\\"This is a random notification about good eating habits\\\",\\\"This is a random notification about good health habits\\\",\\\"Good day, how are you feeling today?\\\",\\\"This is a random notification about good financial habits\\\",\\\"This is a random notification about exercise\\\",\\\"Elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\\\"]\",\"specificTime\":\"8\"}'));
  NotificationScheduleStruct get sampleSchedule => _sampleSchedule;
  set sampleSchedule(NotificationScheduleStruct value) {
    _sampleSchedule = value;
    prefs.setString('ff_sampleSchedule', value.serialize());
  }

  void updateSampleScheduleStruct(
      Function(NotificationScheduleStruct) updateFn) {
    updateFn(_sampleSchedule);
    prefs.setString('ff_sampleSchedule', _sampleSchedule.serialize());
  }
}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}
