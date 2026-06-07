import '/flutter_flow/flutter_flow_util.dart';
import 'reels_style_post_card_widget.dart' show ReelsStylePostCardWidget;
import 'package:flutter/material.dart';

class ReelsStylePostCardModel
    extends FlutterFlowModel<ReelsStylePostCardWidget> {
  ///  State fields for stateful widgets in this component.

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
