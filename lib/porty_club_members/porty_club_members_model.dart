import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'porty_club_members_widget.dart' show PortyClubMembersWidget;
import 'package:flutter/material.dart';

class PortyClubMembersModel extends FlutterFlowModel<PortyClubMembersWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // State field(s) for teammembers widget.
  TabController? teammembersController;
  int get teammembersCurrentIndex =>
      teammembersController != null ? teammembersController!.index : 0;
  int get teammembersPreviousIndex =>
      teammembersController != null ? teammembersController!.previousIndex : 0;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    teammembersController?.dispose();
  }
}
