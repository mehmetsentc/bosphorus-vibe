import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/event_page_component/event_menu_compinent/event_menu_compinent_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'main_feed_video_widget.dart' show MainFeedVideoWidget;
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class MainFeedVideoModel extends FlutterFlowModel<MainFeedVideoWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
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

  // Model for Event_menu_Compinent component.
  late EventMenuCompinentModel eventMenuCompinentModel;

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
    eventMenuCompinentModel =
        createModel(context, () => EventMenuCompinentModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
    pageViewStreamSubscriptions.forEach((s) => s?.cancel());
    pageViewPagingController?.dispose();

    eventMenuCompinentModel.dispose();
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
