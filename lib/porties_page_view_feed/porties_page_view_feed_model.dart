import '/flutter_flow/flutter_flow_util.dart';
import 'porties_page_view_feed_widget.dart' show PortiesPageViewFeedWidget;
import 'package:flutter/material.dart';

class PortiesPageViewFeedModel
    extends FlutterFlowModel<PortiesPageViewFeedWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for PageView widget.
  PageController? pageViewController;

  int get pageViewCurrentIndex => pageViewController != null &&
          pageViewController!.hasClients &&
          pageViewController!.page != null
      ? pageViewController!.page!.round()
      : 0;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
