import 'dart:convert';
import 'dart:typed_data';
import '../schema/structs/index.dart';

import 'package:flutter/foundation.dart';

import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_commons/api_requests/api_manager.dart';

import 'package:ff_commons/api_requests/api_paging_params.dart';

export 'package:ff_commons/api_requests/api_manager.dart' show ApiCallResponse;

const _kPrivateApiFunctionName = 'buildshipFFPrivateApiCall';

class BuildShipTriggerCall {
  static Future<ApiCallResponse> call({
    String? path = '',
    dynamic? buildshipJson,
  }) async {
    final buildship = _serializeJson(buildshipJson);
    final ffApiRequestBody = '''
{
  "buildship": ${buildship}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'BuildShipTrigger',
      apiUrl: '${path}',
      callType: ApiCallType.POST,
      headers: {
        'Content-type': 'application/json',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class BuildShipTriggerFirebaseSupabaseCall {
  static Future<ApiCallResponse> call({
    String? path = '',
    dynamic? buildshipJson,
    String? authOption = 'none',
    String? authValue = '',
  }) async {
    final buildship = _serializeJson(buildshipJson);
    final ffApiRequestBody = '''
{
  "buildship": ${buildship},
  "authOption": "${escapeStringForJson(authOption)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'BuildShipTrigger FirebaseSupabase',
      apiUrl: '${path}',
      callType: ApiCallType.POST,
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ${authValue}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

String _toEncodable(dynamic item) {
  return item;
}

String _serializeList(List? list) {
  list ??= <String>[];
  try {
    return json.encode(list, toEncodable: _toEncodable);
  } catch (_) {
    if (kDebugMode) {
      print("List serialization failed. Returning empty list.");
    }
    return '[]';
  }
}

String _serializeJson(dynamic jsonVar, [bool isList = false]) {
  jsonVar ??= (isList ? [] : {});
  try {
    return json.encode(jsonVar, toEncodable: _toEncodable);
  } catch (_) {
    if (kDebugMode) {
      print("Json serialization failed. Returning empty json.");
    }
    return isList ? '[]' : '{}';
  }
}

String? escapeStringForJson(String? input) {
  if (input == null) {
    return null;
  }
  return input
      .replaceAll('\\', '\\\\')
      .replaceAll('"', '\\"')
      .replaceAll('\n', '\\n')
      .replaceAll('\t', '\\t');
}
