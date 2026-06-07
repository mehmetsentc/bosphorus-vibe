import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/user_compenents/delete_post/delete_post_widget.dart';
import '/user_compenents/post_modal_view/post_modal_view_widget.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'responsible_reels_clone_model.dart';
export 'responsible_reels_clone_model.dart';

class ResponsibleReelsCloneWidget extends StatefulWidget {
  const ResponsibleReelsCloneWidget({
    super.key,
    this.selectedIndex,
    this.postDet,
  });

  final int? selectedIndex;
  final UserPostsRecord? postDet;

  static String routeName = 'responsible_Reels_Clone';
  static String routePath = '/responsibleReelsClone';

  @override
  State<ResponsibleReelsCloneWidget> createState() =>
      _ResponsibleReelsCloneWidgetState();
}

class _ResponsibleReelsCloneWidgetState
    extends State<ResponsibleReelsCloneWidget> with TickerProviderStateMixin {
  late ResponsibleReelsCloneModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();
  var hasIconButtonTriggered = false;
  final animationsMap = <String, AnimationInfo>{};

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ResponsibleReelsCloneModel());

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
        body: Row(
          mainAxisSize: MainAxisSize.max,
          children: [
            wrapWithModel(
              model: _model.sideNavNewModel,
              updateCallback: () => safeSetState(() {}),
              child: SideNavNewWidget(),
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
                width: 300.0,
                height: 100.0,
                decoration: BoxDecoration(),
              ),
            Expanded(
              child: Container(
                width: 100.0,
                height: double.infinity,
                decoration: BoxDecoration(
                  color: FlutterFlowTheme.of(context).secondaryBackground,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                        width: 100.0,
                        height: double.infinity,
                        decoration: BoxDecoration(
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                        ),
                        child: StreamBuilder<List<UserPostsRecord>>(
                          stream: queryUserPostsRecord(
                            queryBuilder: (userPostsRecord) => userPostsRecord
                                .orderBy('timePosted', descending: true),
                          ),
                          builder: (context, snapshot) {
                            // Customize what your widget looks like when it's loading.
                            if (!snapshot.hasData) {
                              return Center(
                                child: SizedBox(
                                  width: 10.0,
                                  height: 10.0,
                                  child: SpinKitDoubleBounce(
                                    color:
                                        FlutterFlowTheme.of(context).alternate,
                                    size: 10.0,
                                  ),
                                ),
                              );
                            }
                            List<UserPostsRecord>
                                reelsVideoCloneUserPostsRecordList =
                                snapshot.data!;

                            return Container(
                              width: double.infinity,
                              height: double.infinity,
                              child: PageView.builder(
                                controller: _model.reelsVideoCloneController ??=
                                    PageController(
                                        initialPage: max(
                                            0,
                                            min(
                                                0,
                                                reelsVideoCloneUserPostsRecordList
                                                        .length -
                                                    1))),
                                scrollDirection: Axis.vertical,
                                itemCount:
                                    reelsVideoCloneUserPostsRecordList.length,
                                itemBuilder: (context, reelsVideoCloneIndex) {
                                  final reelsVideoCloneUserPostsRecord =
                                      reelsVideoCloneUserPostsRecordList[
                                          reelsVideoCloneIndex];
                                  return StreamBuilder<UsersRecord>(
                                    stream: UsersRecord.getDocument(
                                        reelsVideoCloneUserPostsRecord
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
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                              size: 10.0,
                                            ),
                                          ),
                                        );
                                      }

                                      final usersPostUsersRecord =
                                          snapshot.data!;

                                      return Container(
                                        decoration: BoxDecoration(
                                          color: Colors.transparent,
                                        ),
                                        child: Container(
                                          width:
                                              MediaQuery.sizeOf(context).width *
                                                  1.0,
                                          height: MediaQuery.sizeOf(context)
                                                  .height *
                                              1.0,
                                          child: Stack(
                                            children: [
                                              if (reelsVideoCloneUserPostsRecord
                                                          .postPhoto !=
                                                      '')
                                                Container(
                                                  width: double.infinity,
                                                  height: double.infinity,
                                                  decoration: BoxDecoration(
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                  ),
                                                  child: ClipRRect(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            0.0),
                                                    child: Image.network(
                                                      reelsVideoCloneUserPostsRecord
                                                          .postPhoto,
                                                      width: 400.0,
                                                      height: 400.0,
                                                      fit: BoxFit.contain,
                                                    ),
                                                  ),
                                                ),
                                              if (reelsVideoCloneUserPostsRecord
                                                          .postVideo !=
                                                      '')
                                                Align(
                                                  alignment:
                                                      AlignmentDirectional(
                                                          0.0, 0.0),
                                                  child: Container(
                                                    width: double.infinity,
                                                    height: MediaQuery.sizeOf(
                                                                context)
                                                            .height *
                                                        0.8,
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        colors: [
                                                          Color(0x66000000),
                                                          Colors.transparent
                                                        ],
                                                        stops: [0.0, 0.5],
                                                        begin:
                                                            AlignmentDirectional(
                                                                0.0, 1.0),
                                                        end:
                                                            AlignmentDirectional(
                                                                0, -1.0),
                                                      ),
                                                    ),
                                                    child:
                                                        FlutterFlowVideoPlayer(
                                                      path:
                                                          reelsVideoCloneUserPostsRecord
                                                              .postVideo,
                                                      videoType:
                                                          VideoType.network,
                                                      width: double.infinity,
                                                      height: double.infinity,
                                                      autoPlay: true,
                                                      looping: true,
                                                      showControls: true,
                                                      allowFullScreen: false,
                                                      allowPlaybackSpeedMenu:
                                                          false,
                                                    ),
                                                  ),
                                                ),
                                              Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 16.0, 16.0, 0.0),
                                                child: Column(
                                                  mainAxisSize:
                                                      MainAxisSize.max,
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    SingleChildScrollView(
                                                      scrollDirection:
                                                          Axis.horizontal,
                                                      child: Row(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .center,
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        8.0,
                                                                        8.0,
                                                                        8.0,
                                                                        8.0),
                                                            child: Container(
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: Color(
                                                                    0x33000000),
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            20.0),
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
                                                                  0.0,
                                                                  0.0,
                                                                  20.0),
                                                      child: Column(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .start,
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .end,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .center,
                                                            children: [
                                                              Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: Color(
                                                                      0x4D1A1A1A),
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .only(
                                                                    topLeft: Radius
                                                                        .circular(
                                                                            30.0),
                                                                    topRight: Radius
                                                                        .circular(
                                                                            30.0),
                                                                    bottomLeft:
                                                                        Radius.circular(
                                                                            30.0),
                                                                    bottomRight:
                                                                        Radius.circular(
                                                                            30.0),
                                                                  ),
                                                                ),
                                                                child: Column(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .max,
                                                                  crossAxisAlignment:
                                                                      CrossAxisAlignment
                                                                          .center,
                                                                  children: [
                                                                    Column(
                                                                      mainAxisSize:
                                                                          MainAxisSize
                                                                              .max,
                                                                      crossAxisAlignment:
                                                                          CrossAxisAlignment
                                                                              .center,
                                                                      children:
                                                                          [
                                                                        Stack(
                                                                          children: [
                                                                            if (!reelsVideoCloneUserPostsRecord.likes.contains(currentUserReference))
                                                                              FlutterFlowIconButton(
                                                                                borderColor: Colors.transparent,
                                                                                buttonSize: 50.0,
                                                                                fillColor: Colors.transparent,
                                                                                icon: Icon(
                                                                                  Icons.favorite_border,
                                                                                  color: FlutterFlowTheme.of(context).primaryText,
                                                                                  size: 30.0,
                                                                                ),
                                                                                onPressed: () async {
                                                                                  await reelsVideoCloneUserPostsRecord.reference.update({
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
                                                                                    postRef: reelsVideoCloneUserPostsRecord.reference,
                                                                                    madeBy: currentUserReference,
                                                                                    madeTo: reelsVideoCloneUserPostsRecord.postUser,
                                                                                    time: getCurrentTimestamp,
                                                                                    type: 'like',
                                                                                    notificationText: 'liked your post',
                                                                                  ));
                                                                                  _model.likedNotification = NotificationRecord.getDocumentFromData(
                                                                                      createNotificationRecordData(
                                                                                        isRead: false,
                                                                                        postRef: reelsVideoCloneUserPostsRecord.reference,
                                                                                        madeBy: currentUserReference,
                                                                                        madeTo: reelsVideoCloneUserPostsRecord.postUser,
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
                                                                            if (reelsVideoCloneUserPostsRecord.likes.contains(currentUserReference))
                                                                              FlutterFlowIconButton(
                                                                                borderColor: Colors.transparent,
                                                                                buttonSize: 50.0,
                                                                                fillColor: Colors.transparent,
                                                                                icon: Icon(
                                                                                  Icons.favorite,
                                                                                  color: Color(0xFFFF5963),
                                                                                  size: 30.0,
                                                                                ),
                                                                                onPressed: () async {
                                                                                  await reelsVideoCloneUserPostsRecord.reference.update({
                                                                                    ...mapToFirestore(
                                                                                      {
                                                                                        'likes': FieldValue.arrayRemove([
                                                                                          currentUserReference
                                                                                        ]),
                                                                                      },
                                                                                    ),
                                                                                  });
                                                                                },
                                                                              ).animateOnActionTrigger(animationsMap['iconButtonOnActionTriggerAnimation']!, hasBeenTriggered: hasIconButtonTriggered),
                                                                          ],
                                                                        ),
                                                                        Text(
                                                                          valueOrDefault<
                                                                              String>(
                                                                            formatNumber(
                                                                              functions.likes(reelsVideoCloneUserPostsRecord),
                                                                              formatType: FormatType.compact,
                                                                            ),
                                                                            '0',
                                                                          ),
                                                                          style: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .override(
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
                                                                      ].divide(SizedBox(
                                                                              height: 8.0)),
                                                                    ),
                                                                    Column(
                                                                      mainAxisSize:
                                                                          MainAxisSize
                                                                              .max,
                                                                      crossAxisAlignment:
                                                                          CrossAxisAlignment
                                                                              .center,
                                                                      children:
                                                                          [
                                                                        Builder(
                                                                          builder: (context) =>
                                                                              FlutterFlowIconButton(
                                                                            borderColor:
                                                                                Colors.transparent,
                                                                            buttonSize:
                                                                                50.0,
                                                                            fillColor:
                                                                                Colors.transparent,
                                                                            icon:
                                                                                Icon(
                                                                              Icons.chat_bubble_outline,
                                                                              color: FlutterFlowTheme.of(context).primaryText,
                                                                              size: 30.0,
                                                                            ),
                                                                            onPressed:
                                                                                () async {
                                                                              if (MediaQuery.sizeOf(context).width >= 1271.0) {
                                                                                await showDialog(
                                                                                  context: context,
                                                                                  builder: (dialogContext) {
                                                                                    return Dialog(
                                                                                      elevation: 0,
                                                                                      insetPadding: EdgeInsets.zero,
                                                                                      backgroundColor: Colors.transparent,
                                                                                      alignment: AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                                      child: GestureDetector(
                                                                                        onTap: () {
                                                                                          FocusScope.of(dialogContext).unfocus();
                                                                                          FocusManager.instance.primaryFocus?.unfocus();
                                                                                        },
                                                                                        child: PostModalViewWidget(
                                                                                          postRef: reelsVideoCloneUserPostsRecord,
                                                                                          userRef: usersPostUsersRecord,
                                                                                        ),
                                                                                      ),
                                                                                    );
                                                                                  },
                                                                                );
                                                                              } else {
                                                                                context.pushNamed(
                                                                                  PostDetailsPageWidget.routeName,
                                                                                  queryParameters: {
                                                                                    'userRecord': serializeParam(
                                                                                      usersPostUsersRecord,
                                                                                      ParamType.Document,
                                                                                    ),
                                                                                    'postReference': serializeParam(
                                                                                      reelsVideoCloneUserPostsRecord,
                                                                                      ParamType.Document,
                                                                                    ),
                                                                                  }.withoutNulls,
                                                                                  extra: <String, dynamic>{
                                                                                    'userRecord': usersPostUsersRecord,
                                                                                    'postReference': reelsVideoCloneUserPostsRecord,
                                                                                  },
                                                                                );
                                                                              }
                                                                            },
                                                                          ),
                                                                        ),
                                                                        Text(
                                                                          valueOrDefault<
                                                                              String>(
                                                                            formatNumber(
                                                                              reelsVideoCloneUserPostsRecord.numComments,
                                                                              formatType: FormatType.compact,
                                                                            ),
                                                                            '0',
                                                                          ),
                                                                          style: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .override(
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
                                                                      ].divide(SizedBox(
                                                                              height: 8.0)),
                                                                    ),
                                                                    Column(
                                                                      mainAxisSize:
                                                                          MainAxisSize
                                                                              .max,
                                                                      mainAxisAlignment:
                                                                          MainAxisAlignment
                                                                              .start,
                                                                      children: [
                                                                        Stack(
                                                                          children: [
                                                                            if (reelsVideoCloneUserPostsRecord.postSavedBy.contains(currentUserReference))
                                                                              InkWell(
                                                                                splashColor: Colors.transparent,
                                                                                focusColor: Colors.transparent,
                                                                                hoverColor: Colors.transparent,
                                                                                highlightColor: Colors.transparent,
                                                                                onTap: () async {
                                                                                  await reelsVideoCloneUserPostsRecord.reference.update({
                                                                                    ...mapToFirestore(
                                                                                      {
                                                                                        'likes': FieldValue.arrayUnion([
                                                                                          usersPostUsersRecord.reference
                                                                                        ]),
                                                                                      },
                                                                                    ),
                                                                                  });
                                                                                },
                                                                                child: Icon(
                                                                                  Icons.bookmark_sharp,
                                                                                  color: FlutterFlowTheme.of(context).primaryText,
                                                                                  size: 24.0,
                                                                                ),
                                                                              ),
                                                                            if (!reelsVideoCloneUserPostsRecord.postSavedBy.contains(currentUserReference))
                                                                              InkWell(
                                                                                splashColor: Colors.transparent,
                                                                                focusColor: Colors.transparent,
                                                                                hoverColor: Colors.transparent,
                                                                                highlightColor: Colors.transparent,
                                                                                onTap: () async {
                                                                                  await reelsVideoCloneUserPostsRecord.reference.update({
                                                                                    ...mapToFirestore(
                                                                                      {
                                                                                        'post_saved_by': FieldValue.arrayUnion([
                                                                                          currentUserReference
                                                                                        ]),
                                                                                      },
                                                                                    ),
                                                                                  });
                                                                                },
                                                                                child: Icon(
                                                                                  Icons.bookmark_border,
                                                                                  color: FlutterFlowTheme.of(context).primaryText,
                                                                                  size: 24.0,
                                                                                ),
                                                                              ),
                                                                          ],
                                                                        ),
                                                                        Padding(
                                                                          padding: EdgeInsetsDirectional.fromSTEB(
                                                                              0.0,
                                                                              6.0,
                                                                              0.0,
                                                                              0.0),
                                                                          child:
                                                                              Text(
                                                                            valueOrDefault<String>(
                                                                              formatNumber(
                                                                                reelsVideoCloneUserPostsRecord.postSavedBy.length,
                                                                                formatType: FormatType.compact,
                                                                              ),
                                                                              '0',
                                                                            ),
                                                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
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
                                                                    Column(
                                                                      mainAxisSize:
                                                                          MainAxisSize
                                                                              .max,
                                                                      crossAxisAlignment:
                                                                          CrossAxisAlignment
                                                                              .center,
                                                                      children:
                                                                          [
                                                                        if (usersPostUsersRecord.reference ==
                                                                            currentUserReference)
                                                                          FlutterFlowIconButton(
                                                                            borderColor:
                                                                                Colors.transparent,
                                                                            buttonSize:
                                                                                50.0,
                                                                            fillColor:
                                                                                Colors.transparent,
                                                                            icon:
                                                                                Icon(
                                                                              Icons.more_vert,
                                                                              color: FlutterFlowTheme.of(context).primaryText,
                                                                              size: 30.0,
                                                                            ),
                                                                            onPressed:
                                                                                () async {
                                                                              showModalBottomSheet(
                                                                                isScrollControlled: true,
                                                                                backgroundColor: Color(0x00000000),
                                                                                barrierColor: FlutterFlowTheme.of(context).accent4,
                                                                                context: context,
                                                                                builder: (context) {
                                                                                  return GestureDetector(
                                                                                    onTap: () {
                                                                                      FocusScope.of(context).unfocus();
                                                                                      FocusManager.instance.primaryFocus?.unfocus();
                                                                                    },
                                                                                    child: Padding(
                                                                                      padding: MediaQuery.viewInsetsOf(context),
                                                                                      child: Container(
                                                                                        height: 230.0,
                                                                                        child: DeletePostWidget(
                                                                                          postParameters: reelsVideoCloneUserPostsRecord,
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  );
                                                                                },
                                                                              ).then((value) => safeSetState(() {}));
                                                                            },
                                                                          ),
                                                                      ].divide(SizedBox(
                                                                              height: 8.0)),
                                                                    ),
                                                                  ].divide(SizedBox(
                                                                      height:
                                                                          16.0)),
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        0.0,
                                                                        0.0,
                                                                        10.0),
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
                                                                  ViewPageOtherUsherWidget
                                                                      .routeName,
                                                                  queryParameters:
                                                                      {
                                                                    'userDetails':
                                                                        serializeParam(
                                                                      usersPostUsersRecord,
                                                                      ParamType
                                                                          .Document,
                                                                    ),
                                                                    'showPage':
                                                                        serializeParam(
                                                                      false,
                                                                      ParamType
                                                                          .bool,
                                                                    ),
                                                                    'pageTitle':
                                                                        serializeParam(
                                                                      'Home',
                                                                      ParamType
                                                                          .String,
                                                                    ),
                                                                  }.withoutNulls,
                                                                  extra: <String,
                                                                      dynamic>{
                                                                    'userDetails':
                                                                        usersPostUsersRecord,
                                                                  },
                                                                );
                                                              },
                                                              child: Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .max,
                                                                children: [
                                                                  Container(
                                                                    decoration:
                                                                        BoxDecoration(
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryBackground,
                                                                      shape: BoxShape
                                                                          .circle,
                                                                    ),
                                                                    child:
                                                                        Align(
                                                                      alignment:
                                                                          AlignmentDirectional(
                                                                              -1.0,
                                                                              0.0),
                                                                      child:
                                                                          Container(
                                                                        width:
                                                                            30.0,
                                                                        height:
                                                                            30.0,
                                                                        clipBehavior:
                                                                            Clip.antiAlias,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          shape:
                                                                              BoxShape.circle,
                                                                        ),
                                                                        child: Image
                                                                            .network(
                                                                          valueOrDefault<
                                                                              String>(
                                                                            usersPostUsersRecord.photoUrl,
                                                                            'https://cdn-icons-png.flaticon.com/512/1053/1053244.png',
                                                                          ),
                                                                          fit: BoxFit
                                                                              .cover,
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Row(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    children: [
                                                                      Text(
                                                                        usersPostUsersRecord
                                                                            .userName,
                                                                        style: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .override(
                                                                              font: GoogleFonts.figtree(
                                                                                fontWeight: FontWeight.w600,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                              color: FlutterFlowTheme.of(context).primaryText,
                                                                              fontSize: 16.0,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: FontWeight.w600,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ].divide(SizedBox(
                                                                    width:
                                                                        8.0)),
                                                              ),
                                                            ),
                                                          ),
                                                          Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              Padding(
                                                                padding:
                                                                    EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            5.0),
                                                                child: Text(
                                                                  reelsVideoCloneUserPostsRecord
                                                                      .activityName,
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
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
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
                                                              ),
                                                              Padding(
                                                                padding:
                                                                    EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            0.0,
                                                                            0.0,
                                                                            5.0),
                                                                child: Text(
                                                                  dateTimeFormat(
                                                                    "relative",
                                                                    reelsVideoCloneUserPostsRecord
                                                                        .timePosted!,
                                                                    locale: FFLocalizations.of(
                                                                            context)
                                                                        .languageCode,
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
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
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
                                                              ),
                                                            ],
                                                          ),
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        0.0,
                                                                        0.0,
                                                                        5.0),
                                                            child: Text(
                                                              reelsVideoCloneUserPostsRecord
                                                                  .postTitle,
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .bodyMedium
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .figtree(
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w600,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primaryText,
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                          ),
                                                        ].divide(SizedBox(
                                                            height: 8.0)),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                8.0, 8.0, 8.0, 8.0),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Color(0x33000000),
                                borderRadius: BorderRadius.circular(20.0),
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
            if (responsiveVisibility(
              context: context,
              phone: false,
              tablet: false,
              tabletLandscape: false,
            ))
              Container(
                width: 300.0,
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
