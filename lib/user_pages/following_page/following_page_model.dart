import '/components/side_nav_new_widget.dart';
import '/event_page_component/event_menu_compinent/event_menu_compinent_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/user_list/user_list_widget.dart';
import 'following_page_widget.dart' show FollowingPageWidget;
import 'package:flutter/material.dart';

class FollowingPageModel extends FlutterFlowModel<FollowingPageWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // State field(s) for Saved widget.
  TabController? savedController;
  int get savedCurrentIndex =>
      savedController != null ? savedController!.index : 0;
  int get savedPreviousIndex =>
      savedController != null ? savedController!.previousIndex : 0;

  // Models for userList dynamic component.
  late FlutterFlowDynamicModels<UserListModel> userListModels;
  // Model for Event_menu_Compinent component.
  late EventMenuCompinentModel eventMenuCompinentModel;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
    userListModels = FlutterFlowDynamicModels(() => UserListModel());
    eventMenuCompinentModel =
        createModel(context, () => EventMenuCompinentModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    savedController?.dispose();
    userListModels.dispose();
    eventMenuCompinentModel.dispose();
  }
}
