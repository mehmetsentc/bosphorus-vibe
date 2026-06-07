import '/backend/api_requests/api_calls.dart';
import '/chat_g_p_t_component/writing_indicator/writing_indicator_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'ai_chat_component_widget.dart' show AiChatComponentWidget;
import 'package:flutter/material.dart';

class AiChatComponentModel extends FlutterFlowModel<AiChatComponentWidget> {
  ///  Local state fields for this component.

  List<String> chatHistory = [];
  void addToChatHistory(String item) => chatHistory.add(item);
  void removeFromChatHistory(String item) => chatHistory.remove(item);
  void removeAtIndexFromChatHistory(int index) => chatHistory.removeAt(index);
  void insertAtIndexInChatHistory(int index, String item) =>
      chatHistory.insert(index, item);
  void updateChatHistoryAtIndex(int index, Function(String) updateFn) =>
      chatHistory[index] = updateFn(chatHistory[index]);

  bool aiResponding = false;

  String threadId = '';

  ///  State fields for stateful widgets in this component.

  // State field(s) for ListView widget.
  ScrollController? listViewController;
  // Model for writingIndicator component.
  late WritingIndicatorModel writingIndicatorModel;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // Stores action output result for [Backend Call - API (Porty Assistant)] action in IconButton widget.
  ApiCallResponse? apiChatResult;

  @override
  void initState(BuildContext context) {
    listViewController = ScrollController();
    writingIndicatorModel = createModel(context, () => WritingIndicatorModel());
  }

  @override
  void dispose() {
    listViewController?.dispose();
    writingIndicatorModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
