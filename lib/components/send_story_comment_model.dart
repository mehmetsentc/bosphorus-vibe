import '/flutter_flow/flutter_flow_util.dart';
import 'send_story_comment_widget.dart' show SendStoryCommentWidget;
import 'package:flutter/material.dart';

class SendStoryCommentModel extends FlutterFlowModel<SendStoryCommentWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
