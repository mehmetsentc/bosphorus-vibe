import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import '/index.dart';
import 'settings_yeni_sayfa_widget.dart' show SettingsYeniSayfaWidget;
import 'package:flutter/material.dart';

class SettingsYeniSayfaModel extends FlutterFlowModel<SettingsYeniSayfaWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for likes widget.
  bool? likesValue;
  // State field(s) for comment widget.
  bool? commentValue;
  // State field(s) for followers widget.
  bool? followersValue;
  // State field(s) for darkMode widget.
  bool? darkModeValue;
  // State field(s) for Switch widget.
  bool? switchValue;
  // State field(s) for DropDown widget.
  String? dropDownValue1;
  FormFieldController<String>? dropDownValueController1;
  // State field(s) for DropDown widget.
  String? dropDownValue2;
  FormFieldController<String>? dropDownValueController2;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
