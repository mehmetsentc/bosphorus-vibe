import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'view_page_other_usher_widget.dart' show ViewPageOtherUsherWidget;
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class ViewPageOtherUsherModel
    extends FlutterFlowModel<ViewPageOtherUsherWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // State field(s) for mainColumn widget.
  ScrollController? mainColumnScrollController;
  // Stores action output result for [Backend Call - Create Document] action in follow widget.
  FriendsRecord? customFriendsDoc;
  // State field(s) for socialFeed widget.
  ScrollController? socialFeedScrollController0;

  PagingController<DocumentSnapshot?, UserPostsRecord>?
      socialFeedPagingController;
  Query? socialFeedPagingQuery;
  List<StreamSubscription?> socialFeedStreamSubscriptions = [];

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
    mainColumnScrollController = ScrollController();
    socialFeedScrollController0 = ScrollController();
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    mainColumnScrollController?.dispose();
    socialFeedScrollController0?.dispose();
    socialFeedStreamSubscriptions.forEach((s) => s?.cancel());
    socialFeedPagingController?.dispose();
  }

  /// Additional helper methods.
  PagingController<DocumentSnapshot?, UserPostsRecord> setSocialFeedController(
    Query query, {
    DocumentReference<Object?>? parent,
  }) {
    socialFeedPagingController ??= _createSocialFeedController(query, parent);
    if (socialFeedPagingQuery != query) {
      socialFeedPagingQuery = query;
      socialFeedPagingController?.refresh();
    }
    return socialFeedPagingController!;
  }

  PagingController<DocumentSnapshot?, UserPostsRecord>
      _createSocialFeedController(
    Query query,
    DocumentReference<Object?>? parent,
  ) {
    final controller = PagingController<DocumentSnapshot?, UserPostsRecord>(
        firstPageKey: null);
    return controller
      ..addPageRequestListener(
        (nextPageMarker) => queryUserPostsRecordPage(
          queryBuilder: (_) => socialFeedPagingQuery ??= query,
          nextPageMarker: nextPageMarker,
          streamSubscriptions: socialFeedStreamSubscriptions,
          controller: controller,
          pageSize: 3,
          isStream: true,
        ),
      );
  }
}
