// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

// Import necessary packages
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'dart:math';
import 'dart:io' show Platform;
import 'package:permission_handler/permission_handler.dart';

Future<void> scheduleNotifications(
  BuildContext context,
  String scheduleName,
  List<String> notificationList,
  bool random,
  int randomStartTime,
  int randomEndTime,
  bool sunday,
  bool monday,
  bool tuesday,
  bool wednesday,
  bool thursday,
  bool friday,
  bool saturday,
  bool active,
  int timeOfDay,
) async {
  // Initialize FlutterLocalNotificationsPlugin
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // Initialize time zones
  tz.initializeTimeZones();
  final String? timeZoneName = await FlutterTimezone.getLocalTimezone();
  tz.setLocalLocation(tz.getLocation(timeZoneName!));

  // Check if schedule is active
  if (!active) {
    print('Schedule inactive, exiting');
    return;
  }

  // Create list of active days
  List<int> activeDays = [];
  if (sunday) activeDays.add(DateTime.sunday);
  if (monday) activeDays.add(DateTime.monday);
  if (tuesday) activeDays.add(DateTime.tuesday);
  if (wednesday) activeDays.add(DateTime.wednesday);
  if (thursday) activeDays.add(DateTime.thursday);
  if (friday) activeDays.add(DateTime.friday);
  if (saturday) activeDays.add(DateTime.saturday);

  // If no active days or no notifications, exit
  if (activeDays.isEmpty || notificationList.isEmpty) {
    print('No active days or notifications, exiting');
    return;
  }

  print('Scheduling for active days: $activeDays');
  print('Using notifications: $notificationList');

  // Cancel existing notifications for this schedule
  for (int weekday = DateTime.monday; weekday <= DateTime.sunday; weekday++) {
    int notificationId = scheduleName.hashCode + weekday;
    await flutterLocalNotificationsPlugin.cancel(notificationId);
  }

  // Process each active day
  for (int dayIndex = 0; dayIndex < activeDays.length; dayIndex++) {
    int weekday = activeDays[dayIndex];

    // Calculate scheduled time for each day
    int scheduledHour;
    int scheduledMinute = 0; // Default to 0 minutes

    if (random) {
      // Generate new random hour for each day
      final rand = Random();
      scheduledHour =
          rand.nextInt(randomEndTime - randomStartTime + 1) + randomStartTime;
    } else {
      // Use the provided timeOfDay as hours
      scheduledHour = timeOfDay;
    }

    // Use modulo to cycle through notifications
    List<String> notificationsToUse = List<String>.from(notificationList);
    if (random) {
      notificationsToUse.shuffle();
    }
    int notificationIndex = dayIndex % notificationsToUse.length;
    String notificationForDay = notificationsToUse[notificationIndex];

    // Calculate next instance of this day and time
    DateTime now = DateTime.now();
    DateTime scheduledDate = DateTime(
      now.year,
      now.month,
      now.day,
      scheduledHour,
      scheduledMinute,
    );

    // Adjust the date to the correct weekday
    int daysUntilTargetDay = weekday - scheduledDate.weekday;
    if (daysUntilTargetDay < 0) {
      daysUntilTargetDay += 7;
    }

    // If it's the same day, check if the time has passed
    if (daysUntilTargetDay == 0) {
      if (scheduledDate.isBefore(now)) {
        // If time has passed today, schedule for next week
        daysUntilTargetDay = 7;
      }
    }

    // Add the required days
    scheduledDate = scheduledDate.add(Duration(days: daysUntilTargetDay));

    // Create unique notification ID
    int notificationId = scheduleName.hashCode + weekday;

    print(
        'Scheduling notification for ${scheduledDate.toString()} with notification: $notificationForDay');

    // Schedule the notification
    await flutterLocalNotificationsPlugin.zonedSchedule(
        notificationId,
        'Daily Quote',
        notificationForDay,
        tz.TZDateTime.from(scheduledDate, tz.local),
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'quote_channel',
            'Daily Quotes',
            channelDescription: 'Daily motivational quotes',
            importance: Importance.max,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime);
  }

  print('Notification scheduling complete');
}
