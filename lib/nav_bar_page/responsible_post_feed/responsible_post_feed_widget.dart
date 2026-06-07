import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_expanded_image_view.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/user_compenents/comments_mondal/comments_mondal_widget.dart';
import '/user_compenents/delete_post/delete_post_widget.dart';
import '/user_compenents/post_modal_view/post_modal_view_widget.dart';
import '/index.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'responsible_post_feed_model.dart';
export 'responsible_post_feed_model.dart';

class ResponsiblePostFeedWidget extends StatefulWidget {
  const ResponsiblePostFeedWidget({super.key});

  static String routeName = 'responsible_post_feed';
  static String routePath = '/responsiblePostFeed';

  @override
  State<ResponsiblePostFeedWidget> createState() =>
      _ResponsiblePostFeedWidgetState();
}

class _ResponsiblePostFeedWidgetState extends State<ResponsiblePostFeedWidget>
    with TickerProviderStateMixin {
  late ResponsiblePostFeedModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();
  var hasIconButtonTriggered = false;
  final animationsMap = <String, AnimationInfo>{};

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ResponsiblePostFeedModel());

    animationsMap.addAll({
      'iconButtonOnActionTriggerAnimation': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: false,
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
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        floatingActionButton: FloatingActionButton(
          onPressed: () async {
            await _model.columnController?.animateTo(
              0,
              duration: Duration(milliseconds: 100),
              curve: Curves.ease,
            );
          },
          backgroundColor: FlutterFlowTheme.of(context).primary,
          elevation: 8.0,
          child: Icon(
            Icons.arrow_drop_up,
            color: FlutterFlowTheme.of(context).primaryBackground,
            size: 32.0,
          ),
        ),
        body: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            wrapWithModel(
              model: _model.sideNavNewModel,
              updateCallback: () => safeSetState(() {}),
              child: SideNavNewWidget(
                selectedNav: 1,
              ),
            ),
            if (responsiveVisibility(
              context: context,
              phone: false,
              tablet: false,
              desktop: false,
            ))
              Container(
                width: 100.0,
                height: 100.0,
                decoration: BoxDecoration(),
              ),
            if (responsiveVisibility(
              context: context,
              phone: false,
              tablet: false,
              tabletLandscape: false,
            ))
              Container(
                width: 225.0,
                height: 100.0,
                decoration: BoxDecoration(),
              ),
            Expanded(
              child: Align(
                alignment: AlignmentDirectional(0.0, -1.0),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 24.0, 0.0, 0.0),
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                      child: SingleChildScrollView(
                        controller: _model.columnController,
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Divider(
                              height: 1.0,
                              thickness: 1.0,
                              color: FlutterFlowTheme.of(context).accent4,
                            ),
                            Column(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Container(
                                  decoration: BoxDecoration(),
                                  child: PagedListView<
                                      DocumentSnapshot<Object?>?,
                                      UserPostsRecord>(
                                    pagingController:
                                        _model.setListViewController(
                                      UserPostsRecord.collection.orderBy(
                                          'timePosted',
                                          descending: true),
                                    ),
                                    padding: EdgeInsets.zero,
                                    primary: false,
                                    shrinkWrap: true,
                                    reverse: false,
                                    scrollDirection: Axis.vertical,
                                    builderDelegate: PagedChildBuilderDelegate<
                                        UserPostsRecord>(
                                      // Customize what your widget looks like when it's loading the first page.
                                      firstPageProgressIndicatorBuilder: (_) =>
                                          Center(
                                        child: SizedBox(
                                          width: 10.0,
                                          height: 10.0,
                                          child: SpinKitDoubleBounce(
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                            size: 10.0,
                                          ),
                                        ),
                                      ),
                                      // Customize what your widget looks like when it's loading another page.
                                      newPageProgressIndicatorBuilder: (_) =>
                                          Center(
                                        child: SizedBox(
                                          width: 10.0,
                                          height: 10.0,
                                          child: SpinKitDoubleBounce(
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                            size: 10.0,
                                          ),
                                        ),
                                      ),

                                      itemBuilder: (context, _, listViewIndex) {
                                        final listViewUserPostsRecord = _model
                                            .listViewPagingController!
                                            .itemList![listViewIndex];
                                        return Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 12.0, 0.0, 12.0),
                                          child: StreamBuilder<UsersRecord>(
                                            stream: UsersRecord.getDocument(
                                                listViewUserPostsRecord
                                                    .postUser!),
                                            builder: (context, snapshot) {
                                              // Customize what your widget looks like when it's loading.
                                              if (!snapshot.hasData) {
                                                return Center(
                                                  child: SizedBox(
                                                    width: 10.0,
                                                    height: 10.0,
                                                    child: SpinKitDoubleBounce(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .alternate,
                                                      size: 10.0,
                                                    ),
                                                  ),
                                                );
                                              }

                                              final columnUsersRecord =
                                                  snapshot.data!;

                                              return Column(
                                                mainAxisSize: MainAxisSize.max,
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.center,
                                                children: [
                                                  Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(0.0, 0.0,
                                                                0.0, 16.0),
                                                    child: InkWell(
                                                      splashColor:
                                                          Colors.transparent,
                                                      focusColor:
                                                          Colors.transparent,
                                                      hoverColor:
                                                          Colors.transparent,
                                                      highlightColor:
                                                          Colors.transparent,
                                                      onTap: () async {
                                                        context.pushNamed(
                                                          ViewPageOtherUsherWidget
                                                              .routeName,
                                                          queryParameters: {
                                                            'userDetails':
                                                                serializeParam(
                                                              columnUsersRecord,
                                                              ParamType
                                                                  .Document,
                                                            ),
                                                            'showPage':
                                                                serializeParam(
                                                              false,
                                                              ParamType.bool,
                                                            ),
                                                            'pageTitle':
                                                                serializeParam(
                                                              'Home',
                                                              ParamType.String,
                                                            ),
                                                          }.withoutNulls,
                                                          extra: <String,
                                                              dynamic>{
                                                            'userDetails':
                                                                columnUsersRecord,
                                                          },
                                                        );
                                                      },
                                                      child: Row(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              Container(
                                                                width: 40.0,
                                                                height: 40.0,
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primaryBackground,
                                                                  image:
                                                                      DecorationImage(
                                                                    fit: BoxFit
                                                                        .cover,
                                                                    image: Image
                                                                        .network(
                                                                      columnUsersRecord
                                                                          .photoUrl,
                                                                    ).image,
                                                                  ),
                                                                  shape: BoxShape
                                                                      .circle,
                                                                  border: Border
                                                                      .all(
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .success,
                                                                  ),
                                                                ),
                                                              ),
                                                              Column(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .max,
                                                                crossAxisAlignment:
                                                                    CrossAxisAlignment
                                                                        .start,
                                                                children: [
                                                                  Text(
                                                                    columnUsersRecord
                                                                        .displayName,
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.figtree(
                                                                            fontWeight:
                                                                                FontWeight.w600,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight:
                                                                              FontWeight.w600,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                  ),
                                                                  if (listViewUserPostsRecord
                                                                              .location !=
                                                                          '')
                                                                    Align(
                                                                      alignment:
                                                                          AlignmentDirectional(
                                                                              -1.0,
                                                                              0.0),
                                                                      child:
                                                                          Text(
                                                                        listViewUserPostsRecord
                                                                            .location,
                                                                        textAlign:
                                                                            TextAlign.start,
                                                                        style: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .override(
                                                                              font: GoogleFonts.figtree(
                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                      ),
                                                                    ),
                                                                ],
                                                              ),
                                                            ].divide(SizedBox(
                                                                width: 12.0)),
                                                          ),
                                                          if (columnUsersRecord
                                                                  .reference ==
                                                              currentUserReference)
                                                            FlutterFlowIconButton(
                                                              borderColor: Colors
                                                                  .transparent,
                                                              borderRadius:
                                                                  30.0,
                                                              borderWidth: 1.0,
                                                              buttonSize: 44.0,
                                                              icon: Icon(
                                                                Icons
                                                                    .more_vert_sharp,
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .primaryText,
                                                                size: 24.0,
                                                              ),
                                                              onPressed:
                                                                  () async {
                                                                showModalBottomSheet(
                                                                  isScrollControlled:
                                                                      true,
                                                                  backgroundColor:
                                                                      Color(
                                                                          0x00000000),
                                                                  barrierColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .accent4,
                                                                  context:
                                                                      context,
                                                                  builder:
                                                                      (context) {
                                                                    return GestureDetector(
                                                                      onTap:
                                                                          () {
                                                                        FocusScope.of(context)
                                                                            .unfocus();
                                                                        FocusManager
                                                                            .instance
                                                                            .primaryFocus
                                                                            ?.unfocus();
                                                                      },
                                                                      child:
                                                                          Padding(
                                                                        padding:
                                                                            MediaQuery.viewInsetsOf(context),
                                                                        child:
                                                                            Container(
                                                                          height:
                                                                              230.0,
                                                                          child:
                                                                              DeletePostWidget(
                                                                            postParameters:
                                                                                listViewUserPostsRecord,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    );
                                                                  },
                                                                ).then((value) =>
                                                                    safeSetState(
                                                                        () {}));
                                                              },
                                                            ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                  Stack(
                                                    children: [
                                                      if (listViewUserPostsRecord
                                                                  .postVideo !=
                                                              '')
                                                        Container(
                                                          width:
                                                              MediaQuery.sizeOf(
                                                                          context)
                                                                      .width *
                                                                  1.0,
                                                          decoration:
                                                              BoxDecoration(
                                                            color: Colors.white,
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        8.0),
                                                          ),
                                                          child: Builder(
                                                            builder:
                                                                (context) =>
                                                                    InkWell(
                                                              splashColor: Colors
                                                                  .transparent,
                                                              focusColor: Colors
                                                                  .transparent,
                                                              hoverColor: Colors
                                                                  .transparent,
                                                              highlightColor:
                                                                  Colors
                                                                      .transparent,
                                                              onTap: () async {
                                                                if (MediaQuery.sizeOf(
                                                                            context)
                                                                        .width >=
                                                                    1271.0) {
                                                                  await showDialog(
                                                                    context:
                                                                        context,
                                                                    builder:
                                                                        (dialogContext) {
                                                                      return Dialog(
                                                                        elevation:
                                                                            0,
                                                                        insetPadding:
                                                                            EdgeInsets.zero,
                                                                        backgroundColor:
                                                                            Colors.transparent,
                                                                        alignment:
                                                                            AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                        child:
                                                                            GestureDetector(
                                                                          onTap:
                                                                              () {
                                                                            FocusScope.of(dialogContext).unfocus();
                                                                            FocusManager.instance.primaryFocus?.unfocus();
                                                                          },
                                                                          child:
                                                                              PostModalViewWidget(
                                                                            postRef:
                                                                                listViewUserPostsRecord,
                                                                            userRef:
                                                                                columnUsersRecord,
                                                                          ),
                                                                        ),
                                                                      );
                                                                    },
                                                                  );
                                                                } else {
                                                                  context
                                                                      .pushNamed(
                                                                    PostDetailsPageWidget
                                                                        .routeName,
                                                                    queryParameters:
                                                                        {
                                                                      'userRecord':
                                                                          serializeParam(
                                                                        columnUsersRecord,
                                                                        ParamType
                                                                            .Document,
                                                                      ),
                                                                      'postReference':
                                                                          serializeParam(
                                                                        listViewUserPostsRecord,
                                                                        ParamType
                                                                            .Document,
                                                                      ),
                                                                    }.withoutNulls,
                                                                    extra: <String,
                                                                        dynamic>{
                                                                      'userRecord':
                                                                          columnUsersRecord,
                                                                      'postReference':
                                                                          listViewUserPostsRecord,
                                                                    },
                                                                  );
                                                                }
                                                              },
                                                              child:
                                                                  FlutterFlowVideoPlayer(
                                                                path: listViewUserPostsRecord
                                                                    .postVideo,
                                                                videoType:
                                                                    VideoType
                                                                        .network,
                                                                autoPlay: true,
                                                                looping: true,
                                                                showControls:
                                                                    true,
                                                                allowFullScreen:
                                                                    true,
                                                                allowPlaybackSpeedMenu:
                                                                    false,
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                      if (listViewUserPostsRecord
                                                                  .postPhoto !=
                                                              '')
                                                        Container(
                                                          width:
                                                              MediaQuery.sizeOf(
                                                                          context)
                                                                      .width *
                                                                  1.0,
                                                          decoration:
                                                              BoxDecoration(
                                                            color: Colors.white,
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        8.0),
                                                          ),
                                                          child: Builder(
                                                            builder:
                                                                (context) =>
                                                                    InkWell(
                                                              splashColor: Colors
                                                                  .transparent,
                                                              focusColor: Colors
                                                                  .transparent,
                                                              hoverColor: Colors
                                                                  .transparent,
                                                              highlightColor:
                                                                  Colors
                                                                      .transparent,
                                                              onTap: () async {
                                                                if (MediaQuery.sizeOf(
                                                                            context)
                                                                        .width >=
                                                                    1271.0) {
                                                                  await showDialog(
                                                                    context:
                                                                        context,
                                                                    builder:
                                                                        (dialogContext) {
                                                                      return Dialog(
                                                                        elevation:
                                                                            0,
                                                                        insetPadding:
                                                                            EdgeInsets.zero,
                                                                        backgroundColor:
                                                                            Colors.transparent,
                                                                        alignment:
                                                                            AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                        child:
                                                                            GestureDetector(
                                                                          onTap:
                                                                              () {
                                                                            FocusScope.of(dialogContext).unfocus();
                                                                            FocusManager.instance.primaryFocus?.unfocus();
                                                                          },
                                                                          child:
                                                                              PostModalViewWidget(
                                                                            postRef:
                                                                                listViewUserPostsRecord,
                                                                            userRef:
                                                                                columnUsersRecord,
                                                                          ),
                                                                        ),
                                                                      );
                                                                    },
                                                                  );
                                                                } else {
                                                                  context
                                                                      .pushNamed(
                                                                    PostDetailsPageWidget
                                                                        .routeName,
                                                                    queryParameters:
                                                                        {
                                                                      'userRecord':
                                                                          serializeParam(
                                                                        columnUsersRecord,
                                                                        ParamType
                                                                            .Document,
                                                                      ),
                                                                      'postReference':
                                                                          serializeParam(
                                                                        listViewUserPostsRecord,
                                                                        ParamType
                                                                            .Document,
                                                                      ),
                                                                    }.withoutNulls,
                                                                    extra: <String,
                                                                        dynamic>{
                                                                      'userRecord':
                                                                          columnUsersRecord,
                                                                      'postReference':
                                                                          listViewUserPostsRecord,
                                                                    },
                                                                  );
                                                                }

                                                                await Navigator
                                                                    .push(
                                                                  context,
                                                                  PageTransition(
                                                                    type: PageTransitionType
                                                                        .fade,
                                                                    child:
                                                                        FlutterFlowExpandedImageView(
                                                                      image:
                                                                          CachedNetworkImage(
                                                                        fadeInDuration:
                                                                            Duration(milliseconds: 500),
                                                                        fadeOutDuration:
                                                                            Duration(milliseconds: 500),
                                                                        imageUrl:
                                                                            valueOrDefault<String>(
                                                                          listViewUserPostsRecord
                                                                              .postPhoto,
                                                                          'https://i2.wp.com/blog.sunyulster.edu/wp-content/uploads/2019/07/girl-2696947_1920.jpg?fit=1024%2C1024',
                                                                        ),
                                                                        fit: BoxFit
                                                                            .contain,
                                                                        alignment: Alignment(
                                                                            0.0,
                                                                            0.0),
                                                                      ),
                                                                      allowRotation:
                                                                          false,
                                                                      tag: valueOrDefault<
                                                                          String>(
                                                                        listViewUserPostsRecord
                                                                            .postPhoto,
                                                                        'https://i2.wp.com/blog.sunyulster.edu/wp-content/uploads/2019/07/girl-2696947_1920.jpg?fit=1024%2C1024' +
                                                                            '$listViewIndex',
                                                                      ),
                                                                      useHeroAnimation:
                                                                          true,
                                                                    ),
                                                                  ),
                                                                );
                                                              },
                                                              child: Hero(
                                                                tag:
                                                                    valueOrDefault<
                                                                        String>(
                                                                  listViewUserPostsRecord
                                                                      .postPhoto,
                                                                  'https://i2.wp.com/blog.sunyulster.edu/wp-content/uploads/2019/07/girl-2696947_1920.jpg?fit=1024%2C1024' +
                                                                      '$listViewIndex',
                                                                ),
                                                                transitionOnUserGestures:
                                                                    true,
                                                                child:
                                                                    CachedNetworkImage(
                                                                  fadeInDuration:
                                                                      Duration(
                                                                          milliseconds:
                                                                              500),
                                                                  fadeOutDuration:
                                                                      Duration(
                                                                          milliseconds:
                                                                              500),
                                                                  imageUrl:
                                                                      valueOrDefault<
                                                                          String>(
                                                                    listViewUserPostsRecord
                                                                        .postPhoto,
                                                                    'https://i2.wp.com/blog.sunyulster.edu/wp-content/uploads/2019/07/girl-2696947_1920.jpg?fit=1024%2C1024',
                                                                  ),
                                                                  width: 400.0,
                                                                  height: 400.0,
                                                                  fit: BoxFit
                                                                      .cover,
                                                                  alignment:
                                                                      Alignment(
                                                                          0.0,
                                                                          0.0),
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                    ],
                                                  ),
                                                  Expanded(
                                                    child: Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  0.0,
                                                                  0.0,
                                                                  0.0,
                                                                  8.0),
                                                      child: Row(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Expanded(
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Row(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .max,
                                                                  children: [
                                                                    Stack(
                                                                      children: [
                                                                        if (!listViewUserPostsRecord
                                                                            .likes
                                                                            .contains(currentUserReference))
                                                                          FlutterFlowIconButton(
                                                                            borderColor:
                                                                                Colors.transparent,
                                                                            buttonSize:
                                                                                50.0,
                                                                            fillColor:
                                                                                Colors.transparent,
                                                                            icon:
                                                                                Icon(
                                                                              Icons.favorite_border,
                                                                              color: FlutterFlowTheme.of(context).primaryText,
                                                                              size: 30.0,
                                                                            ),
                                                                            onPressed:
                                                                                () async {
                                                                              await listViewUserPostsRecord.reference.update({
                                                                                ...mapToFirestore(
                                                                                  {
                                                                                    'likes': FieldValue.arrayUnion([
                                                                                      currentUserReference
                                                                                    ]),
                                                                                  },
                                                                                ),
                                                                              });

                                                                              var notificationRecordReference = NotificationRecord.collection.doc();
                                                                              await notificationRecordReference.set(createNotificationRecordData(
                                                                                isRead: false,
                                                                                postRef: listViewUserPostsRecord.reference,
                                                                                madeBy: currentUserReference,
                                                                                madeTo: listViewUserPostsRecord.postUser,
                                                                                time: getCurrentTimestamp,
                                                                                type: 'like',
                                                                                notificationText: 'liked your post',
                                                                              ));
                                                                              _model.likedNotification = NotificationRecord.getDocumentFromData(
                                                                                  createNotificationRecordData(
                                                                                    isRead: false,
                                                                                    postRef: listViewUserPostsRecord.reference,
                                                                                    madeBy: currentUserReference,
                                                                                    madeTo: listViewUserPostsRecord.postUser,
                                                                                    time: getCurrentTimestamp,
                                                                                    type: 'like',
                                                                                    notificationText: 'liked your post',
                                                                                  ),
                                                                                  notificationRecordReference);
                                                                              if (animationsMap['iconButtonOnActionTriggerAnimation'] != null) {
                                                                                safeSetState(() => hasIconButtonTriggered = true);
                                                                                SchedulerBinding.instance.addPostFrameCallback((_) async => await animationsMap['iconButtonOnActionTriggerAnimation']!.controller.forward(from: 0.0));
                                                                              }

                                                                              safeSetState(() {});
                                                                            },
                                                                          ),
                                                                        if (listViewUserPostsRecord
                                                                            .likes
                                                                            .contains(
                                                                                currentUserReference))
                                                                          FlutterFlowIconButton(
                                                                            borderColor:
                                                                                Colors.transparent,
                                                                            buttonSize:
                                                                                50.0,
                                                                            fillColor:
                                                                                Colors.transparent,
                                                                            icon:
                                                                                Icon(
                                                                              Icons.favorite,
                                                                              color: Color(0xFFFF5963),
                                                                              size: 30.0,
                                                                            ),
                                                                            onPressed:
                                                                                () async {
                                                                              await listViewUserPostsRecord.reference.update({
                                                                                ...mapToFirestore(
                                                                                  {
                                                                                    'likes': FieldValue.arrayRemove([
                                                                                      currentUserReference
                                                                                    ]),
                                                                                  },
                                                                                ),
                                                                              });
                                                                            },
                                                                          ).animateOnActionTrigger(
                                                                              animationsMap['iconButtonOnActionTriggerAnimation']!,
                                                                              hasBeenTriggered: hasIconButtonTriggered),
                                                                      ],
                                                                    ),
                                                                    Text(
                                                                      formatNumber(
                                                                        listViewUserPostsRecord
                                                                            .likes
                                                                            .length,
                                                                        formatType:
                                                                            FormatType.compact,
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.figtree(
                                                                              fontWeight: FontWeight.w600,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FontWeight.w600,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                          ),
                                                                    ),
                                                                  ],
                                                                ),
                                                                InkWell(
                                                                  splashColor:
                                                                      Colors
                                                                          .transparent,
                                                                  focusColor: Colors
                                                                      .transparent,
                                                                  hoverColor: Colors
                                                                      .transparent,
                                                                  highlightColor:
                                                                      Colors
                                                                          .transparent,
                                                                  onTap:
                                                                      () async {
                                                                    await showModalBottomSheet(
                                                                      isScrollControlled:
                                                                          true,
                                                                      backgroundColor:
                                                                          Colors
                                                                              .transparent,
                                                                      context:
                                                                          context,
                                                                      builder:
                                                                          (context) {
                                                                        return GestureDetector(
                                                                          onTap:
                                                                              () {
                                                                            FocusScope.of(context).unfocus();
                                                                            FocusManager.instance.primaryFocus?.unfocus();
                                                                          },
                                                                          child:
                                                                              Padding(
                                                                            padding:
                                                                                MediaQuery.viewInsetsOf(context),
                                                                            child:
                                                                                CommentsMondalWidget(
                                                                              userRefuserRef: columnUsersRecord,
                                                                              postRef: listViewUserPostsRecord.reference,
                                                                            ),
                                                                          ),
                                                                        );
                                                                      },
                                                                    ).then((value) =>
                                                                        safeSetState(
                                                                            () {}));
                                                                  },
                                                                  child: Icon(
                                                                    Icons
                                                                        .chat_bubble_outline,
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primaryText,
                                                                    size: 24.0,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  formatNumber(
                                                                    listViewUserPostsRecord
                                                                        .numComments,
                                                                    formatType:
                                                                        FormatType
                                                                            .compact,
                                                                  ),
                                                                  style: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .figtree(
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 16.0)),
                                                            ),
                                                          ),
                                                          Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              Stack(
                                                                children: [
                                                                  if (!listViewUserPostsRecord
                                                                      .postSavedBy
                                                                      .contains(
                                                                          currentUserReference))
                                                                    InkWell(
                                                                      splashColor:
                                                                          Colors
                                                                              .transparent,
                                                                      focusColor:
                                                                          Colors
                                                                              .transparent,
                                                                      hoverColor:
                                                                          Colors
                                                                              .transparent,
                                                                      highlightColor:
                                                                          Colors
                                                                              .transparent,
                                                                      onTap:
                                                                          () async {
                                                                        await listViewUserPostsRecord
                                                                            .reference
                                                                            .update({
                                                                          ...mapToFirestore(
                                                                            {
                                                                              'post_saved_by': FieldValue.arrayUnion([
                                                                                currentUserReference
                                                                              ]),
                                                                            },
                                                                          ),
                                                                        });
                                                                      },
                                                                      child:
                                                                          Icon(
                                                                        Icons
                                                                            .bookmark_border,
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
                                                                        size:
                                                                            24.0,
                                                                      ),
                                                                    ),
                                                                  if (listViewUserPostsRecord
                                                                      .postSavedBy
                                                                      .contains(
                                                                          currentUserReference))
                                                                    InkWell(
                                                                      splashColor:
                                                                          Colors
                                                                              .transparent,
                                                                      focusColor:
                                                                          Colors
                                                                              .transparent,
                                                                      hoverColor:
                                                                          Colors
                                                                              .transparent,
                                                                      highlightColor:
                                                                          Colors
                                                                              .transparent,
                                                                      onTap:
                                                                          () async {
                                                                        await listViewUserPostsRecord
                                                                            .reference
                                                                            .update({
                                                                          ...mapToFirestore(
                                                                            {
                                                                              'post_saved_by': FieldValue.arrayRemove([
                                                                                currentUserReference
                                                                              ]),
                                                                            },
                                                                          ),
                                                                        });
                                                                      },
                                                                      child:
                                                                          Icon(
                                                                        Icons
                                                                            .bookmark_sharp,
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
                                                                        size:
                                                                            24.0,
                                                                      ),
                                                                    ),
                                                                ],
                                                              ),
                                                            ],
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                  Expanded(
                                                    child: Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  16.0,
                                                                  8.0,
                                                                  16.0,
                                                                  0.0),
                                                      child: Column(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .stretch,
                                                        children: [
                                                          Expanded(
                                                            child: Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          8.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Text(
                                                                listViewUserPostsRecord
                                                                    .activityName,
                                                                textAlign:
                                                                    TextAlign
                                                                        .start,
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .figtree(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                            ),
                                                          ),
                                                          Expanded(
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Expanded(
                                                                  child:
                                                                      Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                    child: Text(
                                                                      listViewUserPostsRecord
                                                                          .postTitle,
                                                                      textAlign:
                                                                          TextAlign
                                                                              .start,
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.figtree(
                                                                              fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                          ),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        8.0,
                                                                        0.0,
                                                                        0.0),
                                                            child: InkWell(
                                                              splashColor: Colors
                                                                  .transparent,
                                                              focusColor: Colors
                                                                  .transparent,
                                                              hoverColor: Colors
                                                                  .transparent,
                                                              highlightColor:
                                                                  Colors
                                                                      .transparent,
                                                              onTap: () async {
                                                                context
                                                                    .pushNamed(
                                                                  PostDetailsPageWidget
                                                                      .routeName,
                                                                  queryParameters:
                                                                      {
                                                                    'postReference':
                                                                        serializeParam(
                                                                      listViewUserPostsRecord,
                                                                      ParamType
                                                                          .Document,
                                                                    ),
                                                                    'userRecord':
                                                                        serializeParam(
                                                                      columnUsersRecord,
                                                                      ParamType
                                                                          .Document,
                                                                    ),
                                                                  }.withoutNulls,
                                                                  extra: <String,
                                                                      dynamic>{
                                                                    'postReference':
                                                                        listViewUserPostsRecord,
                                                                    'userRecord':
                                                                        columnUsersRecord,
                                                                  },
                                                                );
                                                              },
                                                              child: Text(
                                                                'View all comments',
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodySmall
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .figtree(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodySmall
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodySmall
                                                                            .fontStyle,
                                                                      ),
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryText,
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodySmall
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodySmall
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                            ),
                                                          ),
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        4.0,
                                                                        0.0,
                                                                        0.0),
                                                            child: Text(
                                                              dateTimeFormat(
                                                                "relative",
                                                                listViewUserPostsRecord
                                                                    .timePosted!,
                                                                locale: FFLocalizations.of(
                                                                        context)
                                                                    .languageCode,
                                                              ),
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .bodySmall
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .figtree(
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodySmall
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodySmall
                                                                          .fontStyle,
                                                                    ),
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .secondaryText,
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              );
                                            },
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            if (responsiveVisibility(
              context: context,
              phone: false,
              tablet: false,
              tabletLandscape: false,
            ))
              Container(
                width: 225.0,
                height: 100.0,
                decoration: BoxDecoration(),
              ),
            if (responsiveVisibility(
              context: context,
              phone: false,
              tablet: false,
              desktop: false,
            ))
              Container(
                width: 100.0,
                height: 100.0,
                decoration: BoxDecoration(),
              ),
          ],
        ),
      ),
    );
  }
}
