import '/flutter_flow/flutter_flow_util.dart';
import 'user_stories_full_page_ver1_widget.dart'
    show UserStoriesFullPageVer1Widget;
import 'package:flutter/material.dart';

class UserStoriesFullPageVer1Model
    extends FlutterFlowModel<UserStoriesFullPageVer1Widget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for reelsVideoClone widget.
  PageController? reelsVideoCloneController;

  int get reelsVideoCloneCurrentIndex => reelsVideoCloneController != null &&
          reelsVideoCloneController!.hasClients &&
          reelsVideoCloneController!.page != null
      ? reelsVideoCloneController!.page!.round()
      : 0;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
