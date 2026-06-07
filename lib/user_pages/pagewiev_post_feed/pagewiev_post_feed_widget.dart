import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_media_display.dart';
import '/flutter_flow/flutter_flow_toggle_icon.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/user_compenents/post_modal_view/post_modal_view_widget.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'pagewiev_post_feed_model.dart';
export 'pagewiev_post_feed_model.dart';

class PagewievPostFeedWidget extends StatefulWidget {
  const PagewievPostFeedWidget({
    super.key,
    required this.userRef,
    required this.selectedIndex,
  });

  final DocumentReference? userRef;
  final int? selectedIndex;

  static String routeName = 'pagewiev_Post_Feed';
  static String routePath = '/pagewievPostFeed';

  @override
  State<PagewievPostFeedWidget> createState() => _PagewievPostFeedWidgetState();
}

class _PagewievPostFeedWidgetState extends State<PagewievPostFeedWidget> {
  late PagewievPostFeedModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PagewievPostFeedModel());

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
            backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
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

        final pagewievPostFeedUsersRecord = snapshot.data!;

        return GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
            FocusManager.instance.primaryFocus?.unfocus();
          },
          child: Scaffold(
            key: scaffoldKey,
            backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
            body: SafeArea(
              top: true,
              child: Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  if (responsiveVisibility(
                    context: context,
                    phone: false,
                    tablet: false,
                    desktop: false,
                  ))
                    Container(
                      width: 130.0,
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
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Flexible(
                                child: Align(
                                  alignment: AlignmentDirectional(1.0, -1.0),
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 25.0, 0.0, 0.0),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  16.0, 0.0, 0.0, 0.0),
                                          child: InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            onTap: () async {
                                              context.pushNamed(
                                                MainUserProfilWidget.routeName,
                                                extra: <String, dynamic>{
                                                  '__transition_info__':
                                                      TransitionInfo(
                                                    hasTransition: true,
                                                    transitionType:
                                                        PageTransitionType.fade,
                                                    duration: Duration(
                                                        milliseconds: 0),
                                                  ),
                                                },
                                              );
                                            },
                                            child: Icon(
                                              Icons.chevron_left,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              size: 32.0,
                                            ),
                                          ),
                                        ),
                                        Flexible(
                                          child: Align(
                                            alignment:
                                                AlignmentDirectional(0.0, -1.0),
                                            child: Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      0.0, 0.0, 20.0, 0.0),
                                              child: Text(
                                                pagewievPostFeedUsersRecord
                                                    .userName,
                                                textAlign: TextAlign.center,
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .bodyMedium
                                                    .override(
                                                      font: GoogleFonts.figtree(
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontStyle,
                                                      ),
                                                      fontSize: 22.0,
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
                                ),
                              ),
                            ],
                          ),
                          Expanded(
                            child: Stack(
                              children: [
                                Container(
                                  width: double.infinity,
                                  height: double.infinity,
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 40.0),
                                    child: PagedPageView<
                                        DocumentSnapshot<Object?>?,
                                        UserPostsRecord>(
                                      pagingController:
                                          _model.setPageViewController(
                                        UserPostsRecord.collection
                                            .where(
                                              'postUser',
                                              isEqualTo: currentUserReference,
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
                                                      valueOrDefault<int>(
                                                        widget.selectedIndex,
                                                        0,
                                                      ),
                                                      _model.pageViewLoadedLength -
                                                          1))),
                                      onPageChanged: (_) => safeSetState(() {
                                        _model.pageViewLoadedLength = _model
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
                                            child: SpinKitDoubleBounce(
                                              color:
                                                  FlutterFlowTheme.of(context)
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                              size: 10.0,
                                            ),
                                          ),
                                        ),

                                        itemBuilder:
                                            (context, _, pageViewIndex) {
                                          final pageViewUserPostsRecord = _model
                                              .pageViewPagingController!
                                              .itemList![pageViewIndex];
                                          return Stack(
                                            children: [
                                              Column(
                                                mainAxisSize: MainAxisSize.max,
                                                mainAxisAlignment:
                                                    MainAxisAlignment.start,
                                                children: [
                                                  Expanded(
                                                    child: Container(
                                                      width: double.infinity,
                                                      height: double.infinity,
                                                      child: Stack(
                                                        children: [
                                                          if (pageViewUserPostsRecord
                                                                      .postPhoto !=
                                                                  '')
                                                            Padding(
                                                              padding:
                                                                  EdgeInsets
                                                                      .all(
                                                                          12.0),
                                                              child:
                                                                  FlutterFlowMediaDisplay(
                                                                path: pageViewUserPostsRecord
                                                                    .postPhoto,
                                                                imageBuilder:
                                                                    (path) =>
                                                                        ClipRRect(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .only(),
                                                                  child: Image
                                                                      .network(
                                                                    path,
                                                                    width: MediaQuery.sizeOf(context)
                                                                            .width *
                                                                        1.0,
                                                                    height:
                                                                        600.0,
                                                                    fit: BoxFit
                                                                        .contain,
                                                                  ),
                                                                ),
                                                                videoPlayerBuilder:
                                                                    (path) =>
                                                                        FlutterFlowVideoPlayer(
                                                                  path: path,
                                                                  width: MediaQuery.sizeOf(
                                                                              context)
                                                                          .width *
                                                                      1.0,
                                                                  height: MediaQuery.sizeOf(
                                                                              context)
                                                                          .height *
                                                                      1.0,
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
                                                            ),
                                                          if (pageViewUserPostsRecord
                                                                      .postVideo !=
                                                                  '')
                                                            Padding(
                                                              padding:
                                                                  EdgeInsets
                                                                      .all(
                                                                          12.0),
                                                              child:
                                                                  FlutterFlowMediaDisplay(
                                                                path: pageViewUserPostsRecord
                                                                    .postVideo,
                                                                imageBuilder:
                                                                    (path) =>
                                                                        ClipRRect(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .only(),
                                                                  child: Image
                                                                      .network(
                                                                    path,
                                                                    width: double
                                                                        .infinity,
                                                                    height:
                                                                        600.0,
                                                                    fit: BoxFit
                                                                        .contain,
                                                                  ),
                                                                ),
                                                                videoPlayerBuilder:
                                                                    (path) =>
                                                                        FlutterFlowVideoPlayer(
                                                                  path: path,
                                                                  width: double
                                                                      .infinity,
                                                                  height: 600.0,
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
                                                            ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              Container(
                                                width: double.infinity,
                                                height: double.infinity,
                                                child: Stack(
                                                  children: [
                                                    Align(
                                                      alignment:
                                                          AlignmentDirectional(
                                                              0.0, 1.0),
                                                      child: Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    16.0,
                                                                    0.0,
                                                                    16.0,
                                                                    0.0),
                                                        child: Container(
                                                          decoration:
                                                              BoxDecoration(),
                                                          child: Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        0.0,
                                                                        0.0,
                                                                        80.0),
                                                            child: Column(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              crossAxisAlignment:
                                                                  CrossAxisAlignment
                                                                      .stretch,
                                                              children: [
                                                                Text(
                                                                  pagewievPostFeedUsersRecord
                                                                      .userName,
                                                                  style: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .figtree(
                                                                          fontWeight:
                                                                              FontWeight.bold,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight:
                                                                            FontWeight.bold,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                                Flexible(
                                                                  child: Text(
                                                                    pageViewUserPostsRecord
                                                                        .postDescription,
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.figtree(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                          ),
                                                                          color:
                                                                              FlutterFlowTheme.of(context).secondaryText,
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .bodySmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodySmall
                                                                              .fontStyle,
                                                                        ),
                                                                  ),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  height: 4.0)),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                    Align(
                                                      alignment:
                                                          AlignmentDirectional(
                                                              1.0, 1.0),
                                                      child: Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    0.0,
                                                                    0.0,
                                                                    16.0,
                                                                    150.0),
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .center,
                                                          children: [
                                                            Stack(
                                                              children: [
                                                                ToggleIcon(
                                                                  onPressed:
                                                                      () async {
                                                                    final likesElement =
                                                                        pageViewUserPostsRecord
                                                                            .reference;
                                                                    final likesUpdate = pageViewUserPostsRecord
                                                                            .likes
                                                                            .contains(
                                                                                likesElement)
                                                                        ? FieldValue
                                                                            .arrayRemove([
                                                                            likesElement
                                                                          ])
                                                                        : FieldValue
                                                                            .arrayUnion([
                                                                            likesElement
                                                                          ]);
                                                                    await pageViewUserPostsRecord
                                                                        .reference
                                                                        .update({
                                                                      ...mapToFirestore(
                                                                        {
                                                                          'likes':
                                                                              likesUpdate,
                                                                        },
                                                                      ),
                                                                    });
                                                                  },
                                                                  value: pageViewUserPostsRecord
                                                                      .likes
                                                                      .contains(
                                                                          pageViewUserPostsRecord
                                                                              .reference),
                                                                  onIcon: Icon(
                                                                    Icons
                                                                        .favorite_rounded,
                                                                    color: Color(
                                                                        0xFFDF3700),
                                                                    size: 25.0,
                                                                  ),
                                                                  offIcon: Icon(
                                                                    Icons
                                                                        .favorite_border,
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primaryText,
                                                                    size: 25.0,
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                            Text(
                                                              valueOrDefault<
                                                                  String>(
                                                                functions
                                                                    .likes(
                                                                        pageViewUserPostsRecord)
                                                                    .toString(),
                                                                'o',
                                                              ),
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .labelSmall
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .figtree(
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontStyle,
                                                                    ),
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primaryText,
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                            Builder(
                                                              builder: (context) =>
                                                                  FlutterFlowIconButton(
                                                                borderColor: Color(
                                                                    0x001A1F24),
                                                                borderRadius:
                                                                    30.0,
                                                                borderWidth:
                                                                    1.0,
                                                                buttonSize:
                                                                    40.0,
                                                                fillColor: Colors
                                                                    .transparent,
                                                                icon: Icon(
                                                                  Icons
                                                                      .chat_bubble_outline,
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primaryText,
                                                                  size: 28.0,
                                                                ),
                                                                onPressed:
                                                                    () async {
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
                                                                              postRef: pageViewUserPostsRecord,
                                                                              userRef: pagewievPostFeedUsersRecord,
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
                                                                          pagewievPostFeedUsersRecord,
                                                                          ParamType
                                                                              .Document,
                                                                        ),
                                                                        'postReference':
                                                                            serializeParam(
                                                                          pageViewUserPostsRecord,
                                                                          ParamType
                                                                              .Document,
                                                                        ),
                                                                      }.withoutNulls,
                                                                      extra: <String,
                                                                          dynamic>{
                                                                        'userRecord':
                                                                            pagewievPostFeedUsersRecord,
                                                                        'postReference':
                                                                            pageViewUserPostsRecord,
                                                                      },
                                                                    );
                                                                  }
                                                                },
                                                              ),
                                                            ),
                                                            Text(
                                                              valueOrDefault<
                                                                  String>(
                                                                pageViewUserPostsRecord
                                                                    .numComments
                                                                    .toString(),
                                                                '0',
                                                              ),
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .labelSmall
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .figtree(
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontStyle,
                                                                    ),
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primaryText,
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                            FlutterFlowIconButton(
                                                              borderColor: Colors
                                                                  .transparent,
                                                              borderRadius:
                                                                  30.0,
                                                              borderWidth: 1.0,
                                                              buttonSize: 40.0,
                                                              fillColor: Colors
                                                                  .transparent,
                                                              icon: Icon(
                                                                Icons.share,
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .primaryText,
                                                                size: 28.0,
                                                              ),
                                                              onPressed: () {
                                                                print(
                                                                    'IconButton pressed ...');
                                                              },
                                                            ),
                                                          ].divide(SizedBox(
                                                              height: 12.0)),
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
                      width: 250.0,
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
                      width: 130.0,
                      height: 100.0,
                      decoration: BoxDecoration(),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
