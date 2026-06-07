import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'main_chat_widget.dart' show MainChatWidget;
import 'package:flutter/material.dart';

class MainChatModel extends FlutterFlowModel<MainChatWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
  }
}
