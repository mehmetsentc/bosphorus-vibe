import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';

import 'package:build_ship_1r9r3f/backend/schema/enums/enums.dart';
import 'package:build_ship_1r9r3f/backend/schema/structs/index.dart';

class FFLibraryValues {
  static FFLibraryValues _instance = FFLibraryValues._internal();

  factory FFLibraryValues() {
    return _instance;
  }

  FFLibraryValues._internal();

  static void reset() {
    _instance = FFLibraryValues._internal();
  }

  AuthOption Authentication = AuthOption.None;
  String? AuthValue = '';
  String BuildShipConfiguration = '{}';
  String? InputValues = '[]';
}
