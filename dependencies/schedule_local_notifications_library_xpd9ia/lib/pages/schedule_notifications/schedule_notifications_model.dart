import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import 'schedule_notifications_widget.dart' show ScheduleNotificationsWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ScheduleNotificationsModel
    extends FlutterFlowModel<ScheduleNotificationsWidget> {
  ///  Local state fields for this page.

  bool isLoading = false;

  ///  State fields for stateful widgets in this page.

  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // State field(s) for Checkbox-Sun widget.
  bool? checkboxSunValue;
  // State field(s) for Checkbox-Mon widget.
  bool? checkboxMonValue;
  // State field(s) for Checkbox-Tue widget.
  bool? checkboxTueValue;
  // State field(s) for Checkbox-Wed widget.
  bool? checkboxWedValue;
  // State field(s) for Checkbox-Thu widget.
  bool? checkboxThuValue;
  // State field(s) for Checkbox-Fri widget.
  bool? checkboxFriValue;
  // State field(s) for Checkbox-Sat widget.
  bool? checkboxSatValue;
  // State field(s) for SwitchListTile widget.
  bool? switchListTileValue1;
  DateTime? datePicked1;
  DateTime? datePicked2;
  DateTime? datePicked3;
  // State field(s) for SwitchListTile widget.
  bool? switchListTileValue2;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
