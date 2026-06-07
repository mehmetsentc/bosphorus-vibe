import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/user_stories_full_page_ver_1/user_stories_full_page_ver1_widget.dart';
import 'story_modal_view_full_ver_widget.dart' show StoryModalViewFullVerWidget;
import 'package:flutter/material.dart';

class StoryModalViewFullVerModel
    extends FlutterFlowModel<StoryModalViewFullVerWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for User_Stories_Full_Page_ver_1 component.
  late UserStoriesFullPageVer1Model userStoriesFullPageVer1Model;

  @override
  void initState(BuildContext context) {
    userStoriesFullPageVer1Model =
        createModel(context, () => UserStoriesFullPageVer1Model());
  }

  @override
  void dispose() {
    userStoriesFullPageVer1Model.dispose();
  }
}
