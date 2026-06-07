import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'responsible_post_feed_widget.dart' show ResponsiblePostFeedWidget;
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class ResponsiblePostFeedModel
    extends FlutterFlowModel<ResponsiblePostFeedWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  // State field(s) for Column widget.
  ScrollController? columnController;
  // State field(s) for ListView widget.
  ScrollController? listViewController0;

  PagingController<DocumentSnapshot?, UserPostsRecord>?
      listViewPagingController;
  Query? listViewPagingQuery;
  List<StreamSubscription?> listViewStreamSubscriptions = [];

  // Stores action output result for [Backend Call - Create Document] action in unselectedButton widget.
  NotificationRecord? likedNotification;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
    columnController = ScrollController();
    listViewController0 = ScrollController();
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    columnController?.dispose();
    listViewController0?.dispose();
    listViewStreamSubscriptions.forEach((s) => s?.cancel());
    listViewPagingController?.dispose();
  }

  /// Additional helper methods.
  PagingController<DocumentSnapshot?, UserPostsRecord> setListViewController(
    Query query, {
    DocumentReference<Object?>? parent,
  }) {
    listViewPagingController ??= _createListViewController(query, parent);
    if (listViewPagingQuery != query) {
      listViewPagingQuery = query;
      listViewPagingController?.refresh();
    }
    return listViewPagingController!;
  }

  PagingController<DocumentSnapshot?, UserPostsRecord>
      _createListViewController(
    Query query,
    DocumentReference<Object?>? parent,
  ) {
    final controller = PagingController<DocumentSnapshot?, UserPostsRecord>(
        firstPageKey: null);
    return controller
      ..addPageRequestListener(
        (nextPageMarker) => queryUserPostsRecordPage(
          queryBuilder: (_) => listViewPagingQuery ??= query,
          nextPageMarker: nextPageMarker,
          streamSubscriptions: listViewStreamSubscriptions,
          controller: controller,
          pageSize: 3,
          isStream: true,
        ),
      );
  }
}
