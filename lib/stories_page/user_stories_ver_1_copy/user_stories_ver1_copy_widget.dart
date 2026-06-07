import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/user_compenents/delete_story/delete_story_widget.dart';
import 'package:community_testing_ryusdv/app_state.dart'
    as community_testing_ryusdv_app_state;
import 'package:f_f_story_view_live_zhm3f3/app_state.dart'
    as f_f_story_view_live_zhm3f3_app_state;
import 'package:schedule_local_notifications_library_xpd9ia/app_state.dart'
    as schedule_local_notifications_library_xpd9ia_app_state;
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'user_stories_ver1_copy_model.dart';
export 'user_stories_ver1_copy_model.dart';

class UserStoriesVer1CopyWidget extends StatefulWidget {
  const UserStoriesVer1CopyWidget({
    super.key,
    this.intialStoryIndex,
  });

  final int? intialStoryIndex;

  static String routeName = 'userStories_ver_1Copy';
  static String routePath = '/userStoriesVer1Copy';

  @override
  State<UserStoriesVer1CopyWidget> createState() =>
      _UserStoriesVer1CopyWidgetState();
}

class _UserStoriesVer1CopyWidgetState extends State<UserStoriesVer1CopyWidget> {
  late UserStoriesVer1CopyModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => UserStoriesVer1CopyModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();
    context.watch<community_testing_ryusdv_app_state.FFAppState>();
    context.watch<f_f_story_view_live_zhm3f3_app_state.FFAppState>();
    context.watch<
        schedule_local_notifications_library_xpd9ia_app_state.FFAppState>();

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        appBar: responsiveVisibility(
          context: context,
          tabletLandscape: false,
          desktop: false,
        )
            ? AppBar(
                backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
                automaticallyImplyLeading: false,
                title: Row(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    FlutterFlowIconButton(
                      borderColor: Colors.transparent,
                      borderRadius: 30.0,
                      borderWidth: 1.0,
                      buttonSize: 60.0,
                      icon: Icon(
                        Icons.chevron_left,
                        color: FlutterFlowTheme.of(context).primaryText,
                        size: 30.0,
                      ),
                      onPressed: () async {
                        context.pop();
                      },
                    ),
                    Expanded(
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Story',
                            style: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .override(
                                  font: GoogleFonts.outfit(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontStyle,
                                  ),
                                  color:
                                      FlutterFlowTheme.of(context).primaryText,
                                  fontSize: 22.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                actions: [],
                centerTitle: false,
                elevation: 2.0,
              )
            : null,
        body: SafeArea(
          top: true,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              if (responsiveVisibility(
                context: context,
                phone: false,
                tablet: false,
              ))
                Container(
                  width: 250.0,
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
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          height: double.infinity,
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context)
                                .secondaryBackground,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Expanded(
                                child: Container(
                                  width: 100.0,
                                  height: double.infinity,
                                  decoration: BoxDecoration(
                                    color: FlutterFlowTheme.of(context)
                                        .secondaryBackground,
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      Expanded(
                                        child: Container(
                                          width: 100.0,
                                          height: double.infinity,
                                          decoration: BoxDecoration(
                                            color: FlutterFlowTheme.of(context)
                                                .secondaryBackground,
                                          ),
                                          child: StreamBuilder<
                                              List<UserStoriesRecord>>(
                                            stream: queryUserStoriesRecord(
                                              queryBuilder:
                                                  (userStoriesRecord) =>
                                                      userStoriesRecord
                                                          .where(
                                                            'storyPostedAt',
                                                            isGreaterThanOrEqualTo:
                                                                FFAppState()
                                                                    .Date2,
                                                          )
                                                          .orderBy(
                                                              'storyPostedAt',
                                                              descending: true),
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
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .alternate,
                                                      size: 10.0,
                                                    ),
                                                  ),
                                                );
                                              }
                                              List<UserStoriesRecord>
                                                  reelsVideoCloneUserStoriesRecordList =
                                                  snapshot.data!;

                                              return Container(
                                                width: double.infinity,
                                                height: double.infinity,
                                                child: PageView.builder(
                                                  controller: _model
                                                          .reelsVideoCloneController ??=
                                                      PageController(
                                                          initialPage: max(
                                                              0,
                                                              min(
                                                                  0,
                                                                  reelsVideoCloneUserStoriesRecordList
                                                                          .length -
                                                                      1))),
                                                  scrollDirection:
                                                      Axis.vertical,
                                                  itemCount:
                                                      reelsVideoCloneUserStoriesRecordList
                                                          .length,
                                                  itemBuilder: (context,
                                                      reelsVideoCloneIndex) {
                                                    final reelsVideoCloneUserStoriesRecord =
                                                        reelsVideoCloneUserStoriesRecordList[
                                                            reelsVideoCloneIndex];
                                                    return StreamBuilder<
                                                        UsersRecord>(
                                                      stream: UsersRecord
                                                          .getDocument(
                                                              reelsVideoCloneUserStoriesRecord
                                                                  .user!),
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

                                                        final usersPostUsersRecord =
                                                            snapshot.data!;

                                                        return Container(
                                                          decoration:
                                                              BoxDecoration(
                                                            color: Colors
                                                                .transparent,
                                                          ),
                                                          child: Container(
                                                            width: MediaQuery
                                                                        .sizeOf(
                                                                            context)
                                                                    .width *
                                                                1.0,
                                                            height: MediaQuery
                                                                        .sizeOf(
                                                                            context)
                                                                    .height *
                                                                1.0,
                                                            child: Stack(
                                                              children: [
                                                                Container(
                                                                  width: MediaQuery.sizeOf(
                                                                              context)
                                                                          .width *
                                                                      1.0,
                                                                  height: MediaQuery.sizeOf(
                                                                              context)
                                                                          .height *
                                                                      1.0,
                                                                  decoration:
                                                                      BoxDecoration(
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primaryBackground,
                                                                  ),
                                                                  child:
                                                                      Visibility(
                                                                    visible: reelsVideoCloneUserStoriesRecord.storyPhoto !=
                                                                            '',
                                                                    child: Image
                                                                        .network(
                                                                      reelsVideoCloneUserStoriesRecord
                                                                          .storyPhoto,
                                                                      width: MediaQuery.sizeOf(context)
                                                                              .width *
                                                                          1.0,
                                                                      height:
                                                                          MediaQuery.sizeOf(context).height *
                                                                              1.0,
                                                                      fit: BoxFit
                                                                          .cover,
                                                                    ),
                                                                  ),
                                                                ),
                                                                Container(
                                                                  width: MediaQuery.sizeOf(
                                                                              context)
                                                                          .width *
                                                                      1.0,
                                                                  height: MediaQuery.sizeOf(
                                                                              context)
                                                                          .height *
                                                                      1.0,
                                                                  decoration:
                                                                      BoxDecoration(
                                                                    gradient:
                                                                        LinearGradient(
                                                                      colors: [
                                                                        Color(
                                                                            0x66000000),
                                                                        Colors
                                                                            .transparent
                                                                      ],
                                                                      stops: [
                                                                        0.0,
                                                                        0.5
                                                                      ],
                                                                      begin: AlignmentDirectional(
                                                                          0.0,
                                                                          1.0),
                                                                      end: AlignmentDirectional(
                                                                          0,
                                                                          -1.0),
                                                                    ),
                                                                  ),
                                                                  child:
                                                                      Visibility(
                                                                    visible: reelsVideoCloneUserStoriesRecord.storyVideo !=
                                                                            '',
                                                                    child:
                                                                        FlutterFlowVideoPlayer(
                                                                      path: reelsVideoCloneUserStoriesRecord
                                                                          .storyVideo,
                                                                      videoType:
                                                                          VideoType
                                                                              .network,
                                                                      autoPlay:
                                                                          true,
                                                                      looping:
                                                                          true,
                                                                      showControls:
                                                                          true,
                                                                      allowFullScreen:
                                                                          true,
                                                                      allowPlaybackSpeedMenu:
                                                                          false,
                                                                    ),
                                                                  ),
                                                                ),
                                                                Column(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .max,
                                                                  children: [
                                                                    Padding(
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          16.0,
                                                                          12.0,
                                                                          16.0,
                                                                          36.0),
                                                                      child: StreamBuilder<
                                                                          UsersRecord>(
                                                                        stream:
                                                                            UsersRecord.getDocument(reelsVideoCloneUserStoriesRecord.user!),
                                                                        builder:
                                                                            (context,
                                                                                snapshot) {
                                                                          // Customize what your widget looks like when it's loading.
                                                                          if (!snapshot
                                                                              .hasData) {
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

                                                                          final userInfoUsersRecord =
                                                                              snapshot.data!;

                                                                          return Row(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            mainAxisAlignment:
                                                                                MainAxisAlignment.start,
                                                                            children: [
                                                                              Container(
                                                                                width: 40.0,
                                                                                height: 40.0,
                                                                                clipBehavior: Clip.antiAlias,
                                                                                decoration: BoxDecoration(
                                                                                  shape: BoxShape.circle,
                                                                                ),
                                                                                child: Image.network(
                                                                                  userInfoUsersRecord.photoUrl,
                                                                                  fit: BoxFit.fitHeight,
                                                                                ),
                                                                              ),
                                                                              Padding(
                                                                                padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 0.0, 0.0),
                                                                                child: Column(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                                                  children: [
                                                                                    Padding(
                                                                                      padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                                                                                      child: Text(
                                                                                        userInfoUsersRecord.userName,
                                                                                        style: FlutterFlowTheme.of(context).labelMedium.override(
                                                                                              font: GoogleFonts.figtree(
                                                                                                fontWeight: FontWeight.bold,
                                                                                                fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                                              ),
                                                                                              color: FlutterFlowTheme.of(context).primaryText,
                                                                                              letterSpacing: 0.0,
                                                                                              fontWeight: FontWeight.bold,
                                                                                              fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                                            ),
                                                                                      ),
                                                                                    ),
                                                                                    Text(
                                                                                      dateTimeFormat(
                                                                                        "relative",
                                                                                        reelsVideoCloneUserStoriesRecord.storyPostedAt!,
                                                                                        locale: FFLocalizations.of(context).languageCode,
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
                                                                                  ],
                                                                                ),
                                                                              ),
                                                                              if (reelsVideoCloneUserStoriesRecord.user == currentUserReference)
                                                                                Expanded(
                                                                                  child: Align(
                                                                                    alignment: AlignmentDirectional(1.0, -1.0),
                                                                                    child: Card(
                                                                                      clipBehavior: Clip.antiAliasWithSaveLayer,
                                                                                      color: Color(0xFF262D34),
                                                                                      shape: RoundedRectangleBorder(
                                                                                        borderRadius: BorderRadius.circular(60.0),
                                                                                      ),
                                                                                      child: FlutterFlowIconButton(
                                                                                        borderColor: Colors.transparent,
                                                                                        borderRadius: 30.0,
                                                                                        fillColor: Color(0x473DAEB7),
                                                                                        icon: Icon(
                                                                                          Icons.more_vert,
                                                                                          color: FlutterFlowTheme.of(context).alternate,
                                                                                          size: 25.0,
                                                                                        ),
                                                                                        onPressed: () async {
                                                                                          await showModalBottomSheet(
                                                                                            isScrollControlled: true,
                                                                                            backgroundColor: FlutterFlowTheme.of(context).accent4,
                                                                                            barrierColor: Color(0x00000000),
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
                                                                                                    height: 240.0,
                                                                                                    child: DeleteStoryWidget(
                                                                                                      storyDetails: reelsVideoCloneUserStoriesRecord,
                                                                                                    ),
                                                                                                  ),
                                                                                                ),
                                                                                              );
                                                                                            },
                                                                                          ).then((value) => safeSetState(() {}));
                                                                                        },
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                            ],
                                                                          );
                                                                        },
                                                                      ),
                                                                    ),
                                                                  ],
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
                                    ],
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
              if (responsiveVisibility(
                context: context,
                phone: false,
                tablet: false,
              ))
                Container(
                  width: 250.0,
                  height: 100.0,
                  decoration: BoxDecoration(),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
