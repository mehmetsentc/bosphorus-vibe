import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_media_display.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/user_compenents/comments/comments_widget.dart';
import '/user_compenents/delete_story/delete_story_widget.dart';
import 'package:community_testing_ryusdv/app_state.dart'
    as community_testing_ryusdv_app_state;
import 'package:f_f_story_view_live_zhm3f3/app_state.dart'
    as f_f_story_view_live_zhm3f3_app_state;
import 'package:schedule_local_notifications_library_xpd9ia/app_state.dart'
    as schedule_local_notifications_library_xpd9ia_app_state;
import 'package:collection/collection.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'stories_model.dart';
export 'stories_model.dart';

class StoriesWidget extends StatefulWidget {
  const StoriesWidget({
    super.key,
    this.initialIndex,
  });

  final int? initialIndex;

  @override
  State<StoriesWidget> createState() => _StoriesWidgetState();
}

class _StoriesWidgetState extends State<StoriesWidget> {
  late StoriesModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => StoriesModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();
    context.watch<community_testing_ryusdv_app_state.FFAppState>();
    context.watch<f_f_story_view_live_zhm3f3_app_state.FFAppState>();
    context.watch<
        schedule_local_notifications_library_xpd9ia_app_state.FFAppState>();

    return Column(
      mainAxisSize: MainAxisSize.max,
      children: [
        Expanded(
          child: StreamBuilder<List<UserStoriesRecord>>(
            stream: queryUserStoriesRecord(
              queryBuilder: (userStoriesRecord) =>
                  userStoriesRecord.orderBy('storyPostedAt', descending: true),
              limit: 20,
            ),
            builder: (context, snapshot) {
              // Customize what your widget looks like when it's loading.
              if (!snapshot.hasData) {
                return Center(
                  child: SizedBox(
                    width: 10.0,
                    height: 10.0,
                    child: SpinKitDoubleBounce(
                      color: FlutterFlowTheme.of(context).alternate,
                      size: 10.0,
                    ),
                  ),
                );
              }
              List<UserStoriesRecord> pageViewUserStoriesRecordList =
                  snapshot.data!;

              return Container(
                width: double.infinity,
                height: MediaQuery.sizeOf(context).height * 1.0,
                child: PageView.builder(
                  controller: _model.pageViewController ??= PageController(
                      initialPage: max(
                          0,
                          min(
                              valueOrDefault<int>(
                                widget.initialIndex,
                                0,
                              ),
                              pageViewUserStoriesRecordList.length - 1))),
                  onPageChanged: (_) async {
                    _model.storiesAction2 = await queryStoryStatusRecordCount(
                      queryBuilder: (storyStatusRecord) =>
                          storyStatusRecord.where(
                        'userRef',
                        isEqualTo: currentUserReference,
                      ),
                    );
                    if (_model.storiesAction2.toString() == '0') {
                      var storyStatusRecordReference =
                          StoryStatusRecord.collection.doc();
                      await storyStatusRecordReference
                          .set(createStoryStatusRecordData(
                        storyRef: pageViewUserStoriesRecordList
                            .elementAtOrNull(widget.initialIndex!)
                            ?.reference,
                        userRef: currentUserReference,
                        status: 'seen',
                        createdAt: getCurrentTimestamp,
                      ));
                      _model.storySeenRecord =
                          StoryStatusRecord.getDocumentFromData(
                              createStoryStatusRecordData(
                                storyRef: pageViewUserStoriesRecordList
                                    .elementAtOrNull(widget.initialIndex!)
                                    ?.reference,
                                userRef: currentUserReference,
                                status: 'seen',
                                createdAt: getCurrentTimestamp,
                              ),
                              storyStatusRecordReference);
                    }

                    safeSetState(() {});
                  },
                  scrollDirection: Axis.vertical,
                  itemCount: pageViewUserStoriesRecordList.length,
                  itemBuilder: (context, pageViewIndex) {
                    final pageViewUserStoriesRecord =
                        pageViewUserStoriesRecordList[pageViewIndex];
                    return Column(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        InkWell(
                          splashColor: Colors.transparent,
                          focusColor: Colors.transparent,
                          hoverColor: Colors.transparent,
                          highlightColor: Colors.transparent,
                          onDoubleTap: () async {
                            FFAppState().showLikeAnimation = true;
                            safeSetState(() {});

                            await pageViewUserStoriesRecord.reference.update({
                              ...mapToFirestore(
                                {
                                  'likes': FieldValue.arrayUnion(
                                      [currentUserReference]),
                                },
                              ),
                            });
                            await Future.delayed(
                              Duration(
                                milliseconds: 1000,
                              ),
                            );
                            FFAppState().showLikeAnimation = false;
                            safeSetState(() {});
                          },
                          child: Container(
                            width: double.infinity,
                            height: MediaQuery.sizeOf(context).height * 1.0,
                            child: Stack(
                              children: [
                                Container(
                                  width: double.infinity,
                                  height:
                                      MediaQuery.sizeOf(context).height * 0.889,
                                  decoration: BoxDecoration(),
                                  child: Visibility(
                                    visible: pageViewUserStoriesRecord.storyVideo !=
                                            '',
                                    child: FlutterFlowVideoPlayer(
                                      path:
                                          pageViewUserStoriesRecord.storyVideo,
                                      videoType: VideoType.network,
                                      autoPlay: true,
                                      looping: true,
                                      showControls: true,
                                      allowFullScreen: true,
                                      allowPlaybackSpeedMenu: false,
                                    ),
                                  ),
                                ),
                                Container(
                                  decoration: BoxDecoration(),
                                  child: Visibility(
                                    visible: pageViewUserStoriesRecord.storyPhoto !=
                                            '',
                                    child: FlutterFlowMediaDisplay(
                                      path:
                                          pageViewUserStoriesRecord.storyPhoto,
                                      imageBuilder: (path) => ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                        child: Image.network(
                                          path,
                                          width: double.infinity,
                                          height: double.infinity,
                                          fit: BoxFit.contain,
                                        ),
                                      ),
                                      videoPlayerBuilder: (path) =>
                                          FlutterFlowVideoPlayer(
                                        path: path,
                                        width: 300.0,
                                        autoPlay: false,
                                        looping: true,
                                        showControls: true,
                                        allowFullScreen: true,
                                        allowPlaybackSpeedMenu: false,
                                      ),
                                    ),
                                  ),
                                ),
                                Align(
                                  alignment: AlignmentDirectional(0.0, 0.0),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        width: double.infinity,
                                        height: 102.0,
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              Color(0xFF1A1F24),
                                              Color(0x001A1F24)
                                            ],
                                            stops: [0.0, 1.0],
                                            begin:
                                                AlignmentDirectional(0.0, -1.0),
                                            end: AlignmentDirectional(0, 1.0),
                                          ),
                                        ),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      16.0, 12.0, 16.0, 36.0),
                                              child: StreamBuilder<UsersRecord>(
                                                stream: UsersRecord.getDocument(
                                                    pageViewUserStoriesRecord
                                                        .user!),
                                                builder: (context, snapshot) {
                                                  // Customize what your widget looks like when it's loading.
                                                  if (!snapshot.hasData) {
                                                    return Center(
                                                      child: SizedBox(
                                                        width: 10.0,
                                                        height: 10.0,
                                                        child:
                                                            SpinKitDoubleBounce(
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .alternate,
                                                          size: 10.0,
                                                        ),
                                                      ),
                                                    );
                                                  }

                                                  final userInfoUsersRecord =
                                                      snapshot.data!;

                                                  return Row(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    children: [
                                                      Card(
                                                        clipBehavior: Clip
                                                            .antiAliasWithSaveLayer,
                                                        color:
                                                            Color(0xFF262D34),
                                                        shape:
                                                            RoundedRectangleBorder(
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(
                                                                      60.0),
                                                        ),
                                                        child:
                                                            FlutterFlowIconButton(
                                                          borderColor: Colors
                                                              .transparent,
                                                          borderRadius: 30.0,
                                                          buttonSize: 46.0,
                                                          icon: Icon(
                                                            Icons.close_rounded,
                                                            color: FlutterFlowTheme
                                                                    .of(context)
                                                                .alternate,
                                                            size: 25.0,
                                                          ),
                                                          onPressed: () async {
                                                            context.pop();
                                                          },
                                                        ),
                                                      ),
                                                      if (userInfoUsersRecord
                                                              .reference ==
                                                          currentUserReference)
                                                        Card(
                                                          clipBehavior: Clip
                                                              .antiAliasWithSaveLayer,
                                                          color:
                                                              Color(0xFF262D34),
                                                          shape:
                                                              RoundedRectangleBorder(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        60.0),
                                                          ),
                                                          child: Visibility(
                                                            visible: userInfoUsersRecord
                                                                    .reference ==
                                                                currentUserReference,
                                                            child:
                                                                FlutterFlowIconButton(
                                                              borderColor: Colors
                                                                  .transparent,
                                                              borderRadius:
                                                                  30.0,
                                                              buttonSize: 46.0,
                                                              icon: Icon(
                                                                Icons.more_vert,
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .alternate,
                                                                size: 25.0,
                                                              ),
                                                              onPressed:
                                                                  () async {
                                                                await showModalBottomSheet(
                                                                  isScrollControlled:
                                                                      true,
                                                                  backgroundColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .accent4,
                                                                  barrierColor:
                                                                      Color(
                                                                          0x00000000),
                                                                  context:
                                                                      context,
                                                                  builder:
                                                                      (context) {
                                                                    return Padding(
                                                                      padding: MediaQuery
                                                                          .viewInsetsOf(
                                                                              context),
                                                                      child:
                                                                          Container(
                                                                        height:
                                                                            240.0,
                                                                        child:
                                                                            DeleteStoryWidget(
                                                                          storyDetails:
                                                                              pageViewUserStoriesRecord,
                                                                        ),
                                                                      ),
                                                                    );
                                                                  },
                                                                ).then((value) =>
                                                                    safeSetState(
                                                                        () {}));
                                                              },
                                                            ),
                                                          ),
                                                        ),
                                                      Container(
                                                        width: 40.0,
                                                        height: 40.0,
                                                        clipBehavior:
                                                            Clip.antiAlias,
                                                        decoration:
                                                            BoxDecoration(
                                                          shape:
                                                              BoxShape.circle,
                                                        ),
                                                        child: Image.network(
                                                          userInfoUsersRecord
                                                              .photoUrl,
                                                          fit: BoxFit.fitHeight,
                                                        ),
                                                      ),
                                                      Expanded(
                                                        child: Column(
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
                                                                          12.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Text(
                                                                valueOrDefault<
                                                                    String>(
                                                                  userInfoUsersRecord
                                                                      .displayName,
                                                                  'Good Dog',
                                                                ),
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .titleSmall
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .figtree(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .titleSmall
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .titleSmall
                                                                            .fontStyle,
                                                                      ),
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .success,
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .titleSmall
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .titleSmall
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                            ),
                                                            Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          12.0,
                                                                          4.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Text(
                                                                dateTimeFormat(
                                                                  "relative",
                                                                  pageViewUserStoriesRecord
                                                                      .storyPostedAt!,
                                                                  locale: FFLocalizations.of(
                                                                          context)
                                                                      .languageCode,
                                                                ),
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .figtree(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontStyle,
                                                                      ),
                                                                      color: Color(
                                                                          0xCCFFFFFF),
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        width: double.infinity,
                                        height: 100.0,
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              Color(0x001A1F24),
                                              Color(0xFF1A1F24)
                                            ],
                                            stops: [0.0, 1.0],
                                            begin:
                                                AlignmentDirectional(0.0, -1.0),
                                            end: AlignmentDirectional(0, 1.0),
                                          ),
                                        ),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.end,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Padding(
                                              padding: EdgeInsets.all(16.0),
                                              child: Text(
                                                valueOrDefault<String>(
                                                  pageViewUserStoriesRecord
                                                      .storyDescription,
                                                  'Decription',
                                                ),
                                                textAlign: TextAlign.start,
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .titleSmall
                                                    .override(
                                                      font: GoogleFonts.figtree(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .success,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .titleSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .titleSmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ),
                                            Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      16.0, 12.0, 16.0, 24.0),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  InkWell(
                                                    splashColor:
                                                        Colors.transparent,
                                                    focusColor:
                                                        Colors.transparent,
                                                    hoverColor:
                                                        Colors.transparent,
                                                    highlightColor:
                                                        Colors.transparent,
                                                    onTap: () async {
                                                      await showModalBottomSheet(
                                                        isScrollControlled:
                                                            true,
                                                        backgroundColor:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .accent4,
                                                        barrierColor:
                                                            Color(0x00000000),
                                                        context: context,
                                                        builder: (context) {
                                                          return Padding(
                                                            padding: MediaQuery
                                                                .viewInsetsOf(
                                                                    context),
                                                            child:
                                                                CommentsWidget(
                                                              story:
                                                                  pageViewUserStoriesRecord,
                                                            ),
                                                          );
                                                        },
                                                      ).then((value) =>
                                                          safeSetState(() {}));
                                                    },
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.max,
                                                      children: [
                                                        Icon(
                                                          Icons
                                                              .mode_comment_outlined,
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .primaryText,
                                                          size: 24.0,
                                                        ),
                                                        Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      8.0,
                                                                      0.0,
                                                                      0.0,
                                                                      0.0),
                                                          child: Text(
                                                            pageViewUserStoriesRecord
                                                                .numComments
                                                                .toString(),
                                                            style: FlutterFlowTheme
                                                                    .of(context)
                                                                .labelMedium
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .figtree(
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelMedium
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelMedium
                                                                        .fontStyle,
                                                                  ),
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primaryText,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .fontWeight,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .fontStyle,
                                                                ),
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (FFAppState().showLikeAnimation)
                                  Align(
                                    alignment: AlignmentDirectional(0.0, 0.0),
                                    child: Lottie.asset(
                                      'assets/jsons/like_Animation.json',
                                      width: 200.0,
                                      height: 200.0,
                                      fit: BoxFit.contain,
                                      animate: true,
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
      ],
    );
  }
}
