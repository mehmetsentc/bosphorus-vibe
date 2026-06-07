import '/chat_g_p_t_component/ai_chat_component/ai_chat_component_widget.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'chat_ai_screen_widget.dart' show ChatAiScreenWidget;
import 'package:flutter/material.dart';

class ChatAiScreenModel extends FlutterFlowModel<ChatAiScreenWidget> {
  ///  Local state fields for this page.

  String? inputContent = '';

  dynamic chatHistory;

  bool aiResponding = false;

  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // Model for aiChat_Component component.
  late AiChatComponentModel aiChatComponentModel;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
    aiChatComponentModel = createModel(context, () => AiChatComponentModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    aiChatComponentModel.dispose();
  }
}
