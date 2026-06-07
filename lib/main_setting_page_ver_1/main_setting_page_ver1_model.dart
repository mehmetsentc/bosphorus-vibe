import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import 'main_setting_page_ver1_widget.dart' show MainSettingPageVer1Widget;
import 'package:flutter/material.dart';

class MainSettingPageVer1Model
    extends FlutterFlowModel<MainSettingPageVer1Widget> {
  ///  State fields for stateful widgets in this page.

  final formKey = GlobalKey<FormState>();
  // State field(s) for DisplayName widget.
  FocusNode? displayNameFocusNode;
  TextEditingController? displayNameTextController;
  String? Function(BuildContext, String?)? displayNameTextControllerValidator;
  // State field(s) for UserName widget.
  FocusNode? userNameFocusNode;
  TextEditingController? userNameTextController;
  String? Function(BuildContext, String?)? userNameTextControllerValidator;
  // State field(s) for ChooseYourRole widget.
  String? chooseYourRoleValue;
  FormFieldController<String>? chooseYourRoleValueController;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController3;
  String? Function(BuildContext, String?)? textController3Validator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    displayNameFocusNode?.dispose();
    displayNameTextController?.dispose();

    userNameFocusNode?.dispose();
    userNameTextController?.dispose();

    textFieldFocusNode?.dispose();
    textController3?.dispose();
  }
}
