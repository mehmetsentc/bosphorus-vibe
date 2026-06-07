import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/stories/stories_widget.dart';
import 'story_details_widget.dart' show StoryDetailsWidget;
import 'package:flutter/material.dart';

class StoryDetailsModel extends FlutterFlowModel<StoryDetailsWidget> {
  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - Create Document] action in storyDetails widget.
  StoryStatusRecord? storyStatusRecord;
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
