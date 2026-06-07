import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'responsible_reels_clone_copy_widget.dart'
    show ResponsibleReelsCloneCopyWidget;
import 'package:flutter/material.dart';

class ResponsibleReelsCloneCopyModel
    extends FlutterFlowModel<ResponsibleReelsCloneCopyWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // State field(s) for reelsVideoClone widget.
  PageController? reelsVideoCloneController;

  int get reelsVideoCloneCurrentIndex => reelsVideoCloneController != null &&
          reelsVideoCloneController!.hasClients &&
          reelsVideoCloneController!.page != null
      ? reelsVideoCloneController!.page!.round()
      : 0;
  // Stores action output result for [Backend Call - Create Document] action in unselectedButton widget.
  NotificationRecord? likedNotification;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
  }
}
