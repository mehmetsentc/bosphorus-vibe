// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import '/actions/actions.dart' as action_blocks;
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

Future<dynamic> buildJsonBodyForBuildShip(
  List<String> keys,
  List<String> values,
  String authOption,
) async {
  if (keys.isEmpty || values.isEmpty || keys.length != values.length) {
    return {
      'buildship': {},
      'authOption': authOption,
    };
  }

  try {
    final Map<String, dynamic> buildshipData = {};
    for (var i = 0; i < keys.length; i++) {
      buildshipData[keys[i]] = values[i];
    }

    return {
      'buildship': buildshipData,
      'authOption': authOption,
    };
  } catch (e) {
    print('Error building JSON: $e');
    return {
      'buildship': {},
      'authOption': authOption,
    };
  }
}
