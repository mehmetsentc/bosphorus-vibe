import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'view_page_other_usher_copy_widget.dart'
    show ViewPageOtherUsherCopyWidget;
import 'package:flutter/material.dart';

class ViewPageOtherUsherCopyModel
    extends FlutterFlowModel<ViewPageOtherUsherCopyWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // Stores action output result for [Backend Call - Create Document] action in follow widget.
  FriendsRecord? customFriendsDoc;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
  }
}
