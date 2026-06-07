import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/stories/stories_widget.dart';
import 'story_details_porty_ver1_widget.dart' show StoryDetailsPortyVer1Widget;
import 'package:flutter/material.dart';

class StoryDetailsPortyVer1Model
    extends FlutterFlowModel<StoryDetailsPortyVer1Widget> {
  ///  State fields for stateful widgets in this page.

  // Model for stories component.
  late StoriesModel storiesModel;

  @override
  void initState(BuildContext context) {
    storiesModel = createModel(context, () => StoriesModel());
  }

  @override
  void dispose() {
    storiesModel.dispose();
  }
}
