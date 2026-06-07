import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:ff_commons/flutter_flow/lat_lng.dart';
import 'package:ff_commons/flutter_flow/place.dart';
import 'package:ff_commons/flutter_flow/uploaded_file.dart';
import '/backend/backend.dart';
import "package:community_testing_ryusdv/backend/schema/structs/index.dart"
    as community_testing_ryusdv_data_schema;
import "package:f_f_story_view_live_zhm3f3/backend/schema/structs/index.dart"
    as f_f_story_view_live_zhm3f3_data_schema;
import "package:build_ship_1r9r3f/backend/schema/structs/index.dart"
    as build_ship_1r9r3f_data_schema;
import "package:schedule_local_notifications_library_xpd9ia/backend/schema/structs/index.dart"
    as schedule_local_notifications_library_xpd9ia_data_schema;
import 'package:cloud_firestore/cloud_firestore.dart';
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import '/auth/firebase_auth/auth_util.dart';
import "package:community_testing_ryusdv/backend/schema/structs/index.dart"
    as community_testing_ryusdv_data_schema;
import "package:f_f_story_view_live_zhm3f3/backend/schema/structs/index.dart"
    as f_f_story_view_live_zhm3f3_data_schema;
import "package:build_ship_1r9r3f/backend/schema/structs/index.dart"
    as build_ship_1r9r3f_data_schema;
import "package:schedule_local_notifications_library_xpd9ia/backend/schema/structs/index.dart"
    as schedule_local_notifications_library_xpd9ia_data_schema;
import "package:community_testing_ryusdv/backend/schema/enums/enums.dart"
    as community_testing_ryusdv_enums;
import "package:f_f_story_view_live_zhm3f3/backend/schema/enums/enums.dart"
    as f_f_story_view_live_zhm3f3_enums;
import "package:build_ship_1r9r3f/backend/schema/enums/enums.dart"
    as build_ship_1r9r3f_enums;
import 'package:build_ship_1r9r3f/flutter_flow/custom_functions.dart'
    as build_ship_1r9r3f_functions;

int likes(UserPostsRecord? post) {
// Eğer post veya likes null ise 0 döndür
  return post?.likes?.length ?? 0;
}

bool hasUploadedMedia(String? mediaPath) {
  return mediaPath != null && mediaPath.isNotEmpty;
}

dynamic saveChatHistory(
  dynamic chatHistory,
  dynamic newChat,
) {
  // If chatHistory isn't a list, make it a list and then add newChat
  if (chatHistory is List) {
    chatHistory.add(newChat);
    return chatHistory;
  } else {
    return [newChat];
  }
}

dynamic convertToJSON(String prompt) {
  // custom function  kod
  try {
    dynamic json = jsonDecode(prompt);
    return json;
  } catch (e) {
    print('Error converting to JSON: $e');
    return null;
  }
}

DateTime? yesterdayDate(DateTime? currentTime) {
  if (currentTime == null) return null;
  final yesterday = currentTime.subtract(Duration(days: 1));
  return DateTime(yesterday.year, yesterday.month, yesterday.day);
}

DateTime? tomorrowDate(DateTime? currentTime) {
  if (currentTime == null) return null;
  return currentTime.add(Duration(days: 1));
}

int getPostIndexFromList(
  List<DocumentReference> postList,
  DocumentReference targetPost,
) {
  return postList.indexWhere((doc) => doc.id == targetPost.id);
}

DateTime addDaysToDate(
  DateTime date,
  int days,
) {
  return date.add(Duration(days: days));
}
