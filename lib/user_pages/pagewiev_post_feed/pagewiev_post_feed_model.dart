import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'pagewiev_post_feed_widget.dart' show PagewievPostFeedWidget;
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class PagewievPostFeedModel extends FlutterFlowModel<PagewievPostFeedWidget> {
  ///  Local state fields for this page.

  bool isMuted = true;

  ///  State fields for stateful widgets in this page.

  // State field(s) for PageView widget.
  PageController? pageViewController;
  int pageViewLoadedLength = 25;
  int get pageViewCurrentIndex => pageViewController != null &&
          pageViewController!.hasClients &&
          pageViewController!.page != null
      ? pageViewController!.page!.round()
      : 0;
  PagingController<DocumentSnapshot?, UserPostsRecord>?
      pageViewPagingController;
  Query? pageViewPagingQuery;
  List<StreamSubscription?> pageViewStreamSubscriptions = [];

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    pageViewStreamSubscriptions.forEach((s) => s?.cancel());
    pageViewPagingController?.dispose();
  }

  /// Additional helper methods.
  PagingController<DocumentSnapshot?, UserPostsRecord> setPageViewController(
    Query query, {
    DocumentReference<Object?>? parent,
  }) {
    pageViewPagingController ??= _createPageViewController(query, parent);
    if (pageViewPagingQuery != query) {
      pageViewPagingQuery = query;
      pageViewPagingController?.refresh();
    }
    return pageViewPagingController!;
  }

  PagingController<DocumentSnapshot?, UserPostsRecord>
      _createPageViewController(
    Query query,
    DocumentReference<Object?>? parent,
  ) {
    final controller = PagingController<DocumentSnapshot?, UserPostsRecord>(
        firstPageKey: null);
    return controller
      ..addPageRequestListener(
        (nextPageMarker) => queryUserPostsRecordPage(
          queryBuilder: (_) => pageViewPagingQuery ??= query,
          nextPageMarker: nextPageMarker,
          streamSubscriptions: pageViewStreamSubscriptions,
          controller: controller,
          pageSize: 25,
          isStream: true,
        ),
      );
  }
}
