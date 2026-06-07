// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;

Future<void> cancelExistingSchedule(String scheduleName) async {
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // Cancel all notifications with IDs based on this schedule name
  for (int weekday = DateTime.monday; weekday <= DateTime.sunday; weekday++) {
    int notificationId = scheduleName.hashCode + weekday;
    await flutterLocalNotificationsPlugin.cancel(notificationId);
  }
}
