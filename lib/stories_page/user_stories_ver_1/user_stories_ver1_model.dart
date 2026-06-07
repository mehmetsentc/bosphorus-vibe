import '/flutter_flow/flutter_flow_util.dart';
import 'user_stories_ver1_widget.dart' show UserStoriesVer1Widget;
import 'package:flutter/material.dart';

class UserStoriesVer1Model extends FlutterFlowModel<UserStoriesVer1Widget> {
  ///  State fields for stateful widgets in this page.

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
