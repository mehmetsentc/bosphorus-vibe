import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import 'edit_user_profile_widget.dart' show EditUserProfileWidget;
import 'package:flutter/material.dart';

class EditUserProfileModel extends FlutterFlowModel<EditUserProfileWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for yourName widget.
  FocusNode? yourNameFocusNode;
  TextEditingController? yourNameTextController;
  String? Function(BuildContext, String?)? yourNameTextControllerValidator;
  // State field(s) for userName widget.
  FocusNode? userNameFocusNode;
  TextEditingController? userNameTextController;
  String? Function(BuildContext, String?)? userNameTextControllerValidator;
  // State field(s) for Rol widget.
  String? rolValue;
  FormFieldController<String>? rolValueController;
  // State field(s) for bio widget.
  FocusNode? bioFocusNode;
  TextEditingController? bioTextController;
  String? Function(BuildContext, String?)? bioTextControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    yourNameFocusNode?.dispose();
    yourNameTextController?.dispose();

    userNameFocusNode?.dispose();
    userNameTextController?.dispose();

    bioFocusNode?.dispose();
    bioTextController?.dispose();
  }
}
