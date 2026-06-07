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

import 'dart:convert';

Future<dynamic> parseBuildshipConfig(String config) async {
  try {
    if (config.isEmpty) {
      return {"path": "", "inputList": <String>[], "authOption": ""};
    }

    var processedConfig =
        config.replaceAll('\n', '').replaceAll('\r', '').trim();

    processedConfig = processedConfig
        .replaceAll(': projectId', ': "projectId"')
        .replaceAll(': collectionName', ': "collectionName"');

    final decoded = json.decode(processedConfig);

    if (decoded.containsKey('inputList')) {
      return {
        "path": decoded['path'] ?? "",
        "inputList": List<String>.from(decoded['inputList'] ?? []),
        "authOption": decoded['authOption'] ?? ""
      };
    } else if (decoded.containsKey('body') && decoded['body'] is Map) {
      final inputList = (decoded['body'] as Map).keys.toList().cast<String>();
      return {
        "path": decoded['path'] ?? "",
        "inputList": inputList,
        "authOption": decoded['authOption'] ?? ""
      };
    }
    return {
      "path": decoded['path'] ?? "",
      "inputList": <String>[],
      "authOption": decoded['authOption'] ?? ""
    };
  } catch (e) {
    print('Error parsing JSON: $e');
    return {"path": "", "inputList": <String>[], "authOption": ""};
  }
}
