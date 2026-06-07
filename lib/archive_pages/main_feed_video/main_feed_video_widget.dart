import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/event_page_component/event_menu_compinent/event_menu_compinent_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_media_display.dart';
import '/flutter_flow/flutter_flow_toggle_icon.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/user_compenents/post_modal_view/post_modal_view_widget.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'main_feed_video_model.dart';
export 'main_feed_video_model.dart';

class MainFeedVideoWidget extends StatefulWidget {
  const MainFeedVideoWidget({
    super.key,
    this.postDett,
    required this.selectedIndex,
  });

  final UserPostsRecord? postDett;
  final int? selectedIndex;

  static String routeName = 'main_feed_Video';
  static String routePath = '/mainFeedVideo';

  @override
  State<MainFeedVideoWidget> createState() => _MainFeedVideoWidgetState();
}

class _MainFeedVideoWidgetState extends State<MainFeedVideoWidget>
    with TickerProviderStateMixin {
  late MainFeedVideoModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  final animationsMap = <String, AnimationInfo>{};

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => MainFeedVideoModel());

    animationsMap.addAll({
      'floatingActionButtonOnActionTriggerAnimation': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: true,
        effectsBuilder: () => [
          ScaleEffect(
            curve: Curves.easeInOut,
            delay: 0.0.ms,
            duration: 600.0.ms,
            begin: Offset(1.0, 1.0),
            end: Offset(1.0, 1.0),
          ),
        ],
      ),
      'containerOnActionTriggerAnimation': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: true,
        effectsBuilder: () => [
          MoveEffect(
            curve: Curves.easeInOut,
            delay: 0.0.ms,
            duration: 300.0.ms,
            begin: Offset(-40.0, 0.0),
            end: Offset(0.0, 0.0),
          ),
        ],
      ),
    });
    setupAnimations(
      animationsMap.values.where((anim) =>
          anim.trigger == AnimationTrigger.onActionTrigger ||
          !anim.applyInitialState),
      this,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<UsersRecord>(
      stream: UsersRecord.getDocument(currentUserReference!),
      builder: (context, snapshot) {
        // Customize what your widget looks like when it's loading.
        if (!snapshot.hasData) {
          return Scaffold(
            backgroundColor: FlutterFlowTheme.of(context).secondaryBackground,
            body: Center(
              child: SizedBox(
                width: 10.0,
                height: 10.0,
                child: SpinKitDoubleBounce(
                  color: FlutterFlowTheme.of(context).alternate,
                  size: 10.0,
                ),
              ),
            ),
          );
        }

        final mainFeedVideoUsersRecord = snapshot.data!;

        return Scaffold(
          key: scaffoldKey,
          backgroundColor: FlutterFlowTheme.of(context).secondaryBackground,
          floatingActionButton: Align(
            alignment: AlignmentDirectional(1.0, 1.0),
            child: Padding(
              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 20.0, 50.0),
              child: FloatingActionButton(
                onPressed: () async {
                  scaffoldKey.currentState!.openDrawer();
                },
                backgroundColor: FlutterFlowTheme.of(context).alternate,
                elevation: 8.0,
                child: Icon(
                  Icons.event,
                  color: FlutterFlowTheme.of(context).primary,
                  size: 24.0,
                ),
              ).animateOnActionTrigger(
                animationsMap['floatingActionButtonOnActionTriggerAnimation']!,
              ),
            ),
          ),
          drawer: Drawer(
            elevation: 16.0,
            child: wrapWithModel(
              model: _model.eventMenuCompinentModel,
              updateCallback: () => safeSetState(() {}),
              child: EventMenuCompinentWidget(
                navSelected: 11,
              ),
            ),
          ),
          endDrawer:
              // Drawer you can pop open by hitting the hamburger menu in the app bar.  This allows you to toggle the theme in the drawer.  You can add additional settings to that column as well.
              Drawer(
            elevation: 16.0,
            child: Container(
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).primaryBackground,
              ),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Container(
                      height: 50.0,
                      decoration: BoxDecoration(),
                      child: Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Theme',
                              style: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                    fontSize: 20.0,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 12.0, 0.0),
                              child: InkWell(
                                splashColor: Colors.transparent,
                                focusColor: Colors.transparent,
                                hoverColor: Colors.transparent,
                                highlightColor: Colors.transparent,
                                onTap: () async {
                                  if ((Theme.of(context).brightness ==
                                          Brightness.dark) ==
                                      false) {
                                    setDarkModeSetting(context, ThemeMode.dark);
                                    if (animationsMap[
                                            'containerOnActionTriggerAnimation'] !=
                                        null) {
                                      animationsMap[
                                              'containerOnActionTriggerAnimation']!
                                          .controller
                                          .forward(from: 0.0);
                                    }
                                  } else {
                                    setDarkModeSetting(
                                        context, ThemeMode.light);
                                    if (animationsMap[
                                            'containerOnActionTriggerAnimation'] !=
                                        null) {
                                      animationsMap[
                                              'containerOnActionTriggerAnimation']!
                                          .controller
                                          .reverse();
                                    }
                                  }
                                },
                                child: Container(
                                  width: 80.0,
                                  height: 40.0,
                                  decoration: BoxDecoration(
                                    color: Color(0xFFF1F4F8),
                                    borderRadius: BorderRadius.circular(20.0),
                                    border: Border.all(
                                      color: Color(0xFFE0E3E7),
                                      width: 1.0,
                                    ),
                                  ),
                                  child: Padding(
                                    padding: EdgeInsets.all(2.0),
                                    child: Stack(
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      children: [
                                        Align(
                                          alignment:
                                              AlignmentDirectional(-0.9, 0.0),
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    6.0, 0.0, 0.0, 0.0),
                                            child: Icon(
                                              Icons.wb_sunny_rounded,
                                              color: Color(0xFF57636C),
                                              size: 24.0,
                                            ),
                                          ),
                                        ),
                                        Align(
                                          alignment:
                                              AlignmentDirectional(1.0, 0.0),
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 6.0, 0.0),
                                            child: Icon(
                                              Icons.mode_night_rounded,
                                              color: Color(0xFF57636C),
                                              size: 24.0,
                                            ),
                                          ),
                                        ),
                                        Align(
                                          alignment:
                                              AlignmentDirectional(1.0, 0.0),
                                          child: Container(
                                            width: 36.0,
                                            height: 36.0,
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              boxShadow: [
                                                BoxShadow(
                                                  blurRadius: 4.0,
                                                  color: Color(0x430B0D0F),
                                                  offset: Offset(
                                                    0.0,
                                                    2.0,
                                                  ),
                                                )
                                              ],
                                              borderRadius:
                                                  BorderRadius.circular(30.0),
                                              shape: BoxShape.rectangle,
                                            ),
                                          ).animateOnActionTrigger(
                                            animationsMap[
                                                'containerOnActionTriggerAnimation']!,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          body: Row(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              wrapWithModel(
                model: _model.sideNavNewModel,
                updateCallback: () => safeSetState(() {}),
                child: SideNavNewWidget(
                  selectedNav: 1,
                ),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 30.0, 0.0, 0.0),
                  child: Container(
                    width: double.infinity,
                    height: double.infinity,
                    constraints: BoxConstraints(
                      maxWidth: 1070.0,
                    ),
                    decoration: BoxDecoration(),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Container(
                              width: double.infinity,
                              height: MediaQuery.sizeOf(context).height * 1.0,
                              constraints: BoxConstraints(
                                maxWidth: 870.0,
                              ),
                              decoration: BoxDecoration(
                                color: FlutterFlowTheme.of(context)
                                    .secondaryBackground,
                              ),
                              child: Container(
                                width: double.infinity,
                                decoration: BoxDecoration(),
                                child: Column(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    if (responsiveVisibility(
                                      context: context,
                                      tabletLandscape: false,
                                      desktop: false,
                                    ))
                                      Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            8.0, 0.0, 8.0, 0.0),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      0.0, 0.0, 0.0, 20.0),
                                              child: InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  context.safePop();
                                                },
                                                child: Icon(
                                                  Icons.chevron_left_sharp,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primaryText,
                                                  size: 24.0,
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              child: Align(
                                                alignment: AlignmentDirectional(
                                                    0.0, -1.0),
                                                child: Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          0.0, 0.0, 0.0, 20.0),
                                                  child: Text(
                                                    'Porty Club',
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .bodyMedium
                                                        .override(
                                                          font: GoogleFonts
                                                              .figtree(
                                                            fontWeight:
                                                                FontWeight.w600,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .fontStyle,
                                                          ),
                                                          fontSize: 18.0,
                                                          letterSpacing: 0.0,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .bodyMedium
                                                                  .fontStyle,
                                                        ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    Expanded(
                                      child: Stack(
                                        children: [
                                          Container(
                                            width: double.infinity,
                                            height: double.infinity,
                                            child: Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      0.0, 0.0, 0.0, 40.0),
                                              child: PagedPageView<
                                                  DocumentSnapshot<Object?>?,
                                                  UserPostsRecord>(
                                                pagingController: _model
                                                    .setPageViewController(
                                                  UserPostsRecord.collection
                                                      .where(
                                                        'postVideo',
                                                        isEqualTo: '',
                                                      )
                                                      .orderBy('timePosted',
                                                          descending: true),
                                                ),
                                                pageController: _model
                                                        .pageViewController ??=
                                                    PageController(
                                                        initialPage: max(
                                                            0,
                                                            min(
                                                                valueOrDefault<
                                                                    int>(
                                                                  widget
                                                                      .selectedIndex,
                                                                  0,
                                                                ),
                                                                _model.pageViewLoadedLength -
                                                                    1))),
                                                onPageChanged: (_) =>
                                                    safeSetState(() {
                                                  _model.pageViewLoadedLength =
                                                      _model
                                                          .pageViewPagingController!
                                                          .itemList!
                                                          .length;
                                                }),
                                                scrollDirection: Axis.vertical,
                                                builderDelegate:
                                                    PagedChildBuilderDelegate<
                                                        UserPostsRecord>(
                                                  // Customize what your widget looks like when it's loading the first page.
                                                  firstPageProgressIndicatorBuilder:
                                                      (_) => Center(
                                                    child: SizedBox(
                                                      width: 10.0,
                                                      height: 10.0,
                                                      child:
                                                          SpinKitDoubleBounce(
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .alternate,
                                                        size: 10.0,
                                                      ),
                                                    ),
                                                  ),
                                                  // Customize what your widget looks like when it's loading another page.
                                                  newPageProgressIndicatorBuilder:
                                                      (_) => Center(
                                                    child: SizedBox(
                                                      width: 10.0,
                                                      height: 10.0,
                                                      child:
                                                          SpinKitDoubleBounce(
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .alternate,
                                                        size: 10.0,
                                                      ),
                                                    ),
                                                  ),

                                                  itemBuilder: (context, _,
                                                      pageViewIndex) {
                                                    final pageViewUserPostsRecord =
                                                        _model.pageViewPagingController!
                                                                .itemList![
                                                            pageViewIndex];
                                                    return StreamBuilder<
                                                        UsersRecord>(
                                                      stream: UsersRecord
                                                          .getDocument(
                                                              pageViewUserPostsRecord
                                                                  .postUser!),
                                                      builder:
                                                          (context, snapshot) {
                                                        // Customize what your widget looks like when it's loading.
                                                        if (!snapshot.hasData) {
                                                          return Center(
                                                            child: SizedBox(
                                                              width: 10.0,
                                                              height: 10.0,
                                                              child:
                                                                  SpinKitDoubleBounce(
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .alternate,
                                                                size: 10.0,
                                                              ),
                                                            ),
                                                          );
                                                        }

                                                        final stackUsersRecord =
                                                            snapshot.data!;

                                                        return Stack(
                                                          children: [
                                                            Column(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .spaceAround,
                                                              children: [
                                                                Stack(
                                                                  children: [
                                                                    if (pageViewUserPostsRecord.postVideo !=
                                                                            '')
                                                                      FlutterFlowMediaDisplay(
                                                                        path: pageViewUserPostsRecord
                                                                            .postVideo,
                                                                        imageBuilder:
                                                                            (path) =>
                                                                                CachedNetworkImage(
                                                                          fadeInDuration:
                                                                              Duration(milliseconds: 0),
                                                                          fadeOutDuration:
                                                                              Duration(milliseconds: 0),
                                                                          imageUrl:
                                                                              path,
                                                                          width:
                                                                              MediaQuery.sizeOf(context).width * 1.0,
                                                                          height:
                                                                              MediaQuery.sizeOf(context).height * 0.75,
                                                                          fit: BoxFit
                                                                              .contain,
                                                                        ),
                                                                        videoPlayerBuilder:
                                                                            (path) =>
                                                                                FlutterFlowVideoPlayer(
                                                                          path:
                                                                              path,
                                                                          width:
                                                                              double.infinity,
                                                                          height:
                                                                              double.infinity,
                                                                          autoPlay:
                                                                              true,
                                                                          looping:
                                                                              false,
                                                                          showControls:
                                                                              true,
                                                                          allowFullScreen:
                                                                              true,
                                                                          allowPlaybackSpeedMenu:
                                                                              false,
                                                                        ),
                                                                      ),
                                                                  ],
                                                                ),
                                                              ],
                                                            ),
                                                            Container(
                                                              width: double
                                                                  .infinity,
                                                              height: double
                                                                  .infinity,
                                                              child: Stack(
                                                                children: [
                                                                  Align(
                                                                    alignment:
                                                                        AlignmentDirectional(
                                                                            0.0,
                                                                            1.0),
                                                                    child:
                                                                        Padding(
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          16.0,
                                                                          0.0),
                                                                      child:
                                                                          Container(
                                                                        decoration:
                                                                            BoxDecoration(),
                                                                        child:
                                                                            Padding(
                                                                          padding: EdgeInsetsDirectional.fromSTEB(
                                                                              0.0,
                                                                              0.0,
                                                                              0.0,
                                                                              80.0),
                                                                          child:
                                                                              Column(
                                                                            mainAxisSize:
                                                                                MainAxisSize.min,
                                                                            crossAxisAlignment:
                                                                                CrossAxisAlignment.stretch,
                                                                            children:
                                                                                [
                                                                              Text(
                                                                                stackUsersRecord.userName,
                                                                                style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                      font: GoogleFonts.figtree(
                                                                                        fontWeight: FontWeight.bold,
                                                                                        fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                      ),
                                                                                      color: FlutterFlowTheme.of(context).primaryText,
                                                                                      letterSpacing: 0.0,
                                                                                      fontWeight: FontWeight.bold,
                                                                                      fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                    ),
                                                                              ),
                                                                              Flexible(
                                                                                child: Text(
                                                                                  pageViewUserPostsRecord.postTitle,
                                                                                  style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                        font: GoogleFonts.figtree(
                                                                                          fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                          fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                        ),
                                                                                        color: FlutterFlowTheme.of(context).secondaryText,
                                                                                        letterSpacing: 0.0,
                                                                                        fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                        fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                      ),
                                                                                ),
                                                                              ),
                                                                            ].divide(SizedBox(height: 4.0)),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Align(
                                                                    alignment:
                                                                        AlignmentDirectional(
                                                                            1.0,
                                                                            0.0),
                                                                    child:
                                                                        Padding(
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          25.0,
                                                                          0.0),
                                                                      child:
                                                                          Container(
                                                                        height: MediaQuery.sizeOf(context).height *
                                                                            0.3,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          color:
                                                                              Color(0x08F2F6F9),
                                                                          borderRadius:
                                                                              BorderRadius.circular(12.0),
                                                                          shape:
                                                                              BoxShape.rectangle,
                                                                          border:
                                                                              Border.all(
                                                                            color:
                                                                                Color(0x7F757575),
                                                                            width:
                                                                                0.2,
                                                                          ),
                                                                        ),
                                                                        child:
                                                                            Padding(
                                                                          padding: EdgeInsetsDirectional.fromSTEB(
                                                                              0.0,
                                                                              0.0,
                                                                              16.0,
                                                                              0.0),
                                                                          child:
                                                                              Column(
                                                                            mainAxisSize:
                                                                                MainAxisSize.min,
                                                                            mainAxisAlignment:
                                                                                MainAxisAlignment.spaceAround,
                                                                            crossAxisAlignment:
                                                                                CrossAxisAlignment.center,
                                                                            children:
                                                                                [
                                                                              Stack(
                                                                                children: [
                                                                                  ToggleIcon(
                                                                                    onPressed: () async {
                                                                                      final likesElement = pageViewUserPostsRecord.reference;
                                                                                      final likesUpdate = pageViewUserPostsRecord.likes.contains(likesElement) ? FieldValue.arrayRemove([likesElement]) : FieldValue.arrayUnion([likesElement]);
                                                                                      await pageViewUserPostsRecord.reference.update({
                                                                                        ...mapToFirestore(
                                                                                          {
                                                                                            'likes': likesUpdate,
                                                                                          },
                                                                                        ),
                                                                                      });
                                                                                    },
                                                                                    value: pageViewUserPostsRecord.likes.contains(pageViewUserPostsRecord.reference),
                                                                                    onIcon: Icon(
                                                                                      Icons.favorite_rounded,
                                                                                      color: Color(0xFFDF3700),
                                                                                      size: 25.0,
                                                                                    ),
                                                                                    offIcon: Icon(
                                                                                      Icons.favorite_border,
                                                                                      color: FlutterFlowTheme.of(context).primaryText,
                                                                                      size: 25.0,
                                                                                    ),
                                                                                  ),
                                                                                ],
                                                                              ),
                                                                              Text(
                                                                                valueOrDefault<String>(
                                                                                  functions.likes(pageViewUserPostsRecord).toString(),
                                                                                  'o',
                                                                                ),
                                                                                style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                      font: GoogleFonts.figtree(
                                                                                        fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                        fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                      ),
                                                                                      color: FlutterFlowTheme.of(context).primaryText,
                                                                                      letterSpacing: 0.0,
                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                    ),
                                                                              ),
                                                                              Builder(
                                                                                builder: (context) => FlutterFlowIconButton(
                                                                                  borderColor: Color(0x001A1F24),
                                                                                  borderRadius: 30.0,
                                                                                  borderWidth: 1.0,
                                                                                  buttonSize: 40.0,
                                                                                  fillColor: Colors.transparent,
                                                                                  icon: Icon(
                                                                                    Icons.chat_bubble_outline,
                                                                                    color: FlutterFlowTheme.of(context).primaryText,
                                                                                    size: 28.0,
                                                                                  ),
                                                                                  onPressed: () async {
                                                                                    if (MediaQuery.sizeOf(context).width >= 1271.0) {
                                                                                      await showDialog(
                                                                                        context: context,
                                                                                        builder: (dialogContext) {
                                                                                          return Dialog(
                                                                                            elevation: 0,
                                                                                            insetPadding: EdgeInsets.zero,
                                                                                            backgroundColor: Colors.transparent,
                                                                                            alignment: AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                                            child: PostModalViewWidget(
                                                                                              postRef: pageViewUserPostsRecord,
                                                                                              userRef: stackUsersRecord,
                                                                                            ),
                                                                                          );
                                                                                        },
                                                                                      );
                                                                                    } else {
                                                                                      context.pushNamed(
                                                                                        PostDetailsPageWidget.routeName,
                                                                                        queryParameters: {
                                                                                          'userRecord': serializeParam(
                                                                                            stackUsersRecord,
                                                                                            ParamType.Document,
                                                                                          ),
                                                                                          'postReference': serializeParam(
                                                                                            pageViewUserPostsRecord,
                                                                                            ParamType.Document,
                                                                                          ),
                                                                                        }.withoutNulls,
                                                                                        extra: <String, dynamic>{
                                                                                          'userRecord': stackUsersRecord,
                                                                                          'postReference': pageViewUserPostsRecord,
                                                                                        },
                                                                                      );
                                                                                    }
                                                                                  },
                                                                                ),
                                                                              ),
                                                                              Text(
                                                                                valueOrDefault<String>(
                                                                                  pageViewUserPostsRecord.numComments.toString(),
                                                                                  '0',
                                                                                ),
                                                                                style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                      font: GoogleFonts.figtree(
                                                                                        fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                        fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                      ),
                                                                                      color: FlutterFlowTheme.of(context).primaryText,
                                                                                      letterSpacing: 0.0,
                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                    ),
                                                                              ),
                                                                              FlutterFlowIconButton(
                                                                                borderColor: Colors.transparent,
                                                                                borderRadius: 30.0,
                                                                                borderWidth: 1.0,
                                                                                buttonSize: 40.0,
                                                                                fillColor: Colors.transparent,
                                                                                icon: Icon(
                                                                                  Icons.share,
                                                                                  color: FlutterFlowTheme.of(context).primaryText,
                                                                                  size: 28.0,
                                                                                ),
                                                                                onPressed: () {
                                                                                  print('share pressed ...');
                                                                                },
                                                                              ),
                                                                            ].divide(SizedBox(height: 12.0)),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ],
                                                              ),
                                                            ),
                                                          ],
                                                        );
                                                      },
                                                    );
                                                  },
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
