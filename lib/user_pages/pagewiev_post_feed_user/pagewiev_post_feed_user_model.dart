import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'pagewiev_post_feed_user_widget.dart' show PagewievPostFeedUserWidget;
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class PagewievPostFeedUserModel
    extends FlutterFlowModel<PagewievPostFeedUserWidget> {
  ///  Local state fields for this page.

  bool isMuted = true;

  ///  State fields for stateful widgets in this page.

  // State field(s) for postFeedViewOtherUser widget.
  PageController? postFeedViewOtherUserController;
  int postFeedViewOtherUserLoadedLength = 25;
  int get postFeedViewOtherUserCurrentIndex =>
      postFeedViewOtherUserController != null &&
              postFeedViewOtherUserController!.hasClients &&
              postFeedViewOtherUserController!.page != null
          ? postFeedViewOtherUserController!.page!.round()
          : 0;
  PagingController<DocumentSnapshot?, UserPostsRecord>?
      postFeedViewOtherUserPagingController;
  Query? postFeedViewOtherUserPagingQuery;
  List<StreamSubscription?> postFeedViewOtherUserStreamSubscriptions = [];

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    postFeedViewOtherUserStreamSubscriptions.forEach((s) => s?.cancel());
    postFeedViewOtherUserPagingController?.dispose();
  }

  /// Additional helper methods.
  PagingController<DocumentSnapshot?, UserPostsRecord>
      setPostFeedViewOtherUserController(
    Query query, {
    DocumentReference<Object?>? parent,
  }) {
    postFeedViewOtherUserPagingController ??=
        _createPostFeedViewOtherUserController(query, parent);
    if (postFeedViewOtherUserPagingQuery != query) {
      postFeedViewOtherUserPagingQuery = query;
      postFeedViewOtherUserPagingController?.refresh();
    }
    return postFeedViewOtherUserPagingController!;
  }

  PagingController<DocumentSnapshot?, UserPostsRecord>
      _createPostFeedViewOtherUserController(
    Query query,
    DocumentReference<Object?>? parent,
  ) {
    final controller = PagingController<DocumentSnapshot?, UserPostsRecord>(
        firstPageKey: null);
    return controller
      ..addPageRequestListener(
        (nextPageMarker) => queryUserPostsRecordPage(
          queryBuilder: (_) => postFeedViewOtherUserPagingQuery ??= query,
          nextPageMarker: nextPageMarker,
          streamSubscriptions: postFeedViewOtherUserStreamSubscriptions,
          controller: controller,
          pageSize: 25,
          isStream: true,
        ),
      );
  }
}
