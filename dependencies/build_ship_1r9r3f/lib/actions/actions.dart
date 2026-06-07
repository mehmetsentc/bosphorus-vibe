import '/backend/api_requests/api_calls.dart';
import '/backend/schema/enums/enums.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/custom_code/actions/index.dart' as actions;
import 'package:ff_commons/api_requests/api_manager.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';

Future<dynamic> triggerBuildShipWorkflow(
  BuildContext context, {
  required String? buildshipConfig,
  required String? authOption,
  String? authValue,
  List<String>? valuesList,
}) async {
  dynamic? buildShipJSONConfig;
  dynamic? buildBodyForBuildShip;
  ApiCallResponse? buildshipTriggerOutputFirebase;
  ApiCallResponse? buildshipTriggerOutputSupabase;
  ApiCallResponse? buildshipTriggerOutput;

  buildShipJSONConfig = await actions.parseBuildshipConfig(
    buildshipConfig!,
  );
  buildBodyForBuildShip = await actions.buildJsonBodyForBuildShip(
    (getJsonField(
      buildShipJSONConfig,
      r'''$.inputList''',
      true,
    ) as List?)!
        .map<String>((e) => e.toString())
        .toList()
        .cast<String>(),
    valuesList!.toList(),
    authOption!,
  );
  if (authOption == 'firebase') {
    buildshipTriggerOutputFirebase =
        await BuildShipTriggerFirebaseSupabaseCall.call(
      path: getJsonField(
        buildShipJSONConfig,
        r'''$.path''',
      ).toString(),
      buildshipJson: buildBodyForBuildShip,
      authOption: valueOrDefault<String>(
        authOption,
        'Firebase',
      ),
      authValue: authValue,
    );

    if ((buildshipTriggerOutputFirebase?.succeeded ?? true)) {
      return <String, dynamic>{
        'response': (buildshipTriggerOutputFirebase?.bodyText ?? ''),
      };
    }

    return <String, dynamic>{
      'buildshipResponse': (buildshipTriggerOutputFirebase?.jsonBody ?? ''),
      'error': (buildshipTriggerOutputFirebase?.exceptionMessage ?? ''),
    };
  } else if (authOption == 'supabase') {
    buildshipTriggerOutputSupabase =
        await BuildShipTriggerFirebaseSupabaseCall.call(
      path: getJsonField(
        buildShipJSONConfig,
        r'''$.path''',
      ).toString(),
      buildshipJson: buildBodyForBuildShip,
      authOption: valueOrDefault<String>(
        authOption,
        'Supabase',
      ),
      authValue: authValue,
    );

    if ((buildshipTriggerOutputSupabase?.succeeded ?? true)) {
      return <String, dynamic>{
        'response': (buildshipTriggerOutputSupabase?.bodyText ?? ''),
      };
    }

    return <String, dynamic>{
      'buildshipResponse': (buildshipTriggerOutputSupabase?.jsonBody ?? ''),
      'error': (buildshipTriggerOutputSupabase?.exceptionMessage ?? ''),
    };
  } else {
    buildshipTriggerOutput = await BuildShipTriggerCall.call(
      path: getJsonField(
        buildShipJSONConfig,
        r'''$.path''',
      ).toString(),
      buildshipJson: buildBodyForBuildShip,
    );

    if ((buildshipTriggerOutput?.succeeded ?? true)) {
      return <String, dynamic>{
        'response': (buildshipTriggerOutput?.bodyText ?? ''),
      };
    }

    return <String, dynamic>{
      'buildshipResponse': (buildshipTriggerOutput?.jsonBody ?? ''),
      'error': (buildshipTriggerOutput?.exceptionMessage ?? ''),
    };
  }
}
