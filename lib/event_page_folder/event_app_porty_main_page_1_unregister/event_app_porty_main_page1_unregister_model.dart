import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'event_app_porty_main_page1_unregister_widget.dart'
    show EventAppPortyMainPage1UnregisterWidget;
import 'package:flutter/material.dart';

class EventAppPortyMainPage1UnregisterModel
    extends FlutterFlowModel<EventAppPortyMainPage1UnregisterWidget> {
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
