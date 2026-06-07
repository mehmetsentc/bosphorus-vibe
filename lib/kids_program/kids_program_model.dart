import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'kids_program_widget.dart' show KidsProgramWidget;
import 'package:flutter/material.dart';

class KidsProgramModel extends FlutterFlowModel<KidsProgramWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // State field(s) for kids_club_weekly widget.
  TabController? kidsClubWeeklyController;
  int get kidsClubWeeklyCurrentIndex =>
      kidsClubWeeklyController != null ? kidsClubWeeklyController!.index : 0;
  int get kidsClubWeeklyPreviousIndex => kidsClubWeeklyController != null
      ? kidsClubWeeklyController!.previousIndex
      : 0;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    kidsClubWeeklyController?.dispose();
  }
}
