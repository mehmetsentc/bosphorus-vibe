import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'stories_widget.dart' show StoriesWidget;
import 'package:flutter/material.dart';

class StoriesModel extends FlutterFlowModel<StoriesWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for PageView widget.
  PageController? pageViewController;

  int get pageViewCurrentIndex => pageViewController != null &&
          pageViewController!.hasClients &&
          pageViewController!.page != null
      ? pageViewController!.page!.round()
      : 0;
  // Stores action output result for [Firestore Query - Query a collection] action in PageView widget.
  int? storiesAction2;
  // Stores action output result for [Backend Call - Create Document] action in PageView widget.
  StoryStatusRecord? storySeenRecord;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
