import '/backend/schema/structs/index.dart';
import '/components/input_value_field/input_value_field_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/actions/actions.dart' as action_blocks;
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import 'trigger_with_input_widget.dart' show TriggerWithInputWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class TriggerWithInputModel extends FlutterFlowModel<TriggerWithInputWidget> {
  ///  Local state fields for this component.

  List<String> decodedKeys = [];
  void addToDecodedKeys(String item) => decodedKeys.add(item);
  void removeFromDecodedKeys(String item) => decodedKeys.remove(item);
  void removeAtIndexFromDecodedKeys(int index) => decodedKeys.removeAt(index);
  void insertAtIndexInDecodedKeys(int index, String item) =>
      decodedKeys.insert(index, item);
  void updateDecodedKeysAtIndex(int index, Function(String) updateFn) =>
      decodedKeys[index] = updateFn(decodedKeys[index]);

  dynamic decodedJson;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Action Block - ParseBuildShipConfig] action in TriggerWithInput widget.
  BuildshipConfigJsonStruct? parseOnInit;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // Stores action output result for [Action Block - ParseBuildShipConfig] action in TextField widget.
  BuildshipConfigJsonStruct? parseOnChange;
  // Models for InputValueField dynamic component.
  late FlutterFlowDynamicModels<InputValueFieldModel> inputValueFieldModels;
  // Stores action output result for [Action Block - TriggerBuildShipWorkflow] action in Button widget.
  dynamic? workflowResponse;

  @override
  void initState(BuildContext context) {
    inputValueFieldModels =
        FlutterFlowDynamicModels(() => InputValueFieldModel());
  }

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();

    inputValueFieldModels.dispose();
  }

  /// Action blocks.
  Future<BuildshipConfigJsonStruct> parseBuildShipConfig(
    BuildContext context, {
    required String? jsonConfigString,
  }) async {
    dynamic? parseBuildshipJsonConfig;

    parseBuildshipJsonConfig = await actions.parseBuildshipConfig(
      jsonConfigString!,
    );
    return BuildshipConfigJsonStruct.maybeFromMap(parseBuildshipJsonConfig!)!;
  }
}
