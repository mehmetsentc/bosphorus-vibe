import '/components/light_mode_dark_mode_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'side_nav_new_widget.dart' show SideNavNewWidget;
import 'package:flutter/material.dart';

class SideNavNewModel extends FlutterFlowModel<SideNavNewWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion_1 widget.
  bool mouseRegion1Hovered = false;
  // State field(s) for MouseRegion_1_2 widget.
  bool mouseRegion12Hovered = false;
  // State field(s) for MouseRegion_2 widget.
  bool mouseRegion2Hovered = false;
  // State field(s) for MouseRegion_4 widget.
  bool mouseRegion4Hovered = false;
  // Model for lightMode_darkMode component.
  late LightModeDarkModeModel lightModeDarkModeModel;

  @override
  void initState(BuildContext context) {
    lightModeDarkModeModel =
        createModel(context, () => LightModeDarkModeModel());
  }

  @override
  void dispose() {
    lightModeDarkModeModel.dispose();
  }
}
