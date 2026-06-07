import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_expanded_image_view.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'reels_style_post_card_model.dart';
export 'reels_style_post_card_model.dart';

class ReelsStylePostCardWidget extends StatefulWidget {
  const ReelsStylePostCardWidget({super.key});

  @override
  State<ReelsStylePostCardWidget> createState() =>
      _ReelsStylePostCardWidgetState();
}

class _ReelsStylePostCardWidgetState extends State<ReelsStylePostCardWidget> {
  late ReelsStylePostCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ReelsStylePostCardModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.only(),
      ),
      child: Container(
        width: double.infinity,
        height: double.infinity,
        child: Stack(
          children: [
            StreamBuilder<List<UserPostsRecord>>(
              stream: queryUserPostsRecord(
                queryBuilder: (userPostsRecord) => userPostsRecord
                    .where(
                      'postUser',
                      isEqualTo: currentUserReference,
                    )
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
                        color: FlutterFlowTheme.of(context).alternate,
                        size: 10.0,
                      ),
                    ),
                  );
                }
                List<UserPostsRecord> pageViewUserPostsRecordList =
                    snapshot.data!;

                return Container(
                  width: double.infinity,
                  height: double.infinity,
                  child: PageView.builder(
                    controller: _model.pageViewController ??= PageController(
                        initialPage: max(
                            0, min(0, pageViewUserPostsRecordList.length - 1))),
                    scrollDirection: Axis.vertical,
                    itemCount: pageViewUserPostsRecordList.length,
                    itemBuilder: (context, pageViewIndex) {
                      final pageViewUserPostsRecord =
                          pageViewUserPostsRecordList[pageViewIndex];
                      return Column(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          if (pageViewUserPostsRecord.postPhoto != '\"\"')
                            Expanded(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8.0),
                                child: Image.network(
                                  'https://picsum.photos/seed/107/600',
                                  width: 400.0,
                                  height: 400.0,
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                          if (pageViewUserPostsRecord.postVideo != '\"\"')
                            FlutterFlowVideoPlayer(
                              path:
                                  'assets/videos/20241213_1501_Nightclub_Elegance_and_Energy_simple_compose_01jezy8y85e2zt79p3hgdy0h08.mp4',
                              videoType: VideoType.asset,
                              width: MediaQuery.sizeOf(context).width * 1.0,
                              height: MediaQuery.sizeOf(context).height * 1.0,
                              autoPlay: true,
                              looping: true,
                              showControls: true,
                              allowFullScreen: true,
                              allowPlaybackSpeedMenu: false,
                            ),
                          ListView(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            scrollDirection: Axis.vertical,
                            children: [
                              if (pageViewUserPostsRecord
                                      .additionalPhoto.length >
                                  0)
                                InkWell(
                                  splashColor: Colors.transparent,
                                  focusColor: Colors.transparent,
                                  hoverColor: Colors.transparent,
                                  highlightColor: Colors.transparent,
                                  onTap: () async {
                                    await Navigator.push(
                                      context,
                                      PageTransition(
                                        type: PageTransitionType.fade,
                                        child: FlutterFlowExpandedImageView(
                                          image: Image.network(
                                            'https://static01.nyt.com/images/2020/10/11/magazine/11mag-blackfutures-12/11mag-blackfutures-12-superJumbo.jpg',
                                            fit: BoxFit.contain,
                                          ),
                                          allowRotation: false,
                                          tag: 'imageTag2',
                                          useHeroAnimation: true,
                                        ),
                                      ),
                                    );
                                  },
                                  child: Hero(
                                    tag: 'imageTag2',
                                    transitionOnUserGestures: true,
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8.0),
                                      child: Image.network(
                                        'https://static01.nyt.com/images/2020/10/11/magazine/11mag-blackfutures-12/11mag-blackfutures-12-superJumbo.jpg',
                                        width: 200.0,
                                        height: 200.0,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          ListView(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            scrollDirection: Axis.vertical,
                            children: [
                              if (pageViewUserPostsRecord
                                      .additionalVideo.length >
                                  0)
                                FlutterFlowVideoPlayer(
                                  path:
                                      'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
                                  videoType: VideoType.network,
                                  height:
                                      MediaQuery.sizeOf(context).height * 1.0,
                                  autoPlay: true,
                                  looping: false,
                                  showControls: true,
                                  allowFullScreen: true,
                                  allowPlaybackSpeedMenu: false,
                                ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                );
              },
            ),
            Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Image.network(
                '',
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: Colors.transparent,
              ),
              child: Container(
                width: double.infinity,
                height: 500.0,
                child: Stack(
                  children: [
                    Image.network(
                      '',
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.fill,
                    ),
                    Align(
                      alignment: AlignmentDirectional(1.0, 0.0),
                      child: Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(8.0, 8.0, 8.0, 0.0),
                        child: Container(
                          width: double.infinity,
                          height: double.infinity,
                        ),
                      ),
                    ),
                    Align(
                      alignment: AlignmentDirectional(0.0, 1.0),
                      child: Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(
                            16.0, 0.0, 16.0, 100.0),
                        child: Container(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.end,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Flexible(
                                child: Align(
                                  alignment: AlignmentDirectional(-1.0, -1.0),
                                  child: Text(
                                    '@username',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight: FontWeight.bold,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          color: Colors.white,
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.bold,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                              ),
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: Text(
                                  'Check out this amazing sunset view from my trip! #travel #sunset #views',
                                  style: FlutterFlowTheme.of(context)
                                      .bodySmall
                                      .override(
                                        font: GoogleFonts.figtree(
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodySmall
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodySmall
                                                  .fontStyle,
                                        ),
                                        color: Colors.white,
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                        ),
                      ),
                    ),
                    Align(
                      alignment: AlignmentDirectional(1.0, 1.0),
                      child: Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(
                            16.0, 12.0, 16.0, 0.0),
                        child: Container(
                          alignment: AlignmentDirectional(1.0, 0.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              FlutterFlowIconButton(
                                borderColor: Colors.transparent,
                                borderRadius: 30.0,
                                borderWidth: 1.0,
                                buttonSize: 40.0,
                                fillColor: Colors.transparent,
                                icon: Icon(
                                  Icons.favorite_border,
                                  color: Colors.white,
                                  size: 28.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '1.2K',
                                style: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontStyle,
                                    ),
                              ),
                              FlutterFlowIconButton(
                                borderColor: Colors.transparent,
                                borderRadius: 30.0,
                                borderWidth: 1.0,
                                buttonSize: 40.0,
                                fillColor: Colors.transparent,
                                icon: Icon(
                                  Icons.chat_bubble_outline,
                                  color: Colors.white,
                                  size: 28.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '342',
                                style: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontStyle,
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
                                  color: Colors.white,
                                  size: 28.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                            ].divide(SizedBox(height: 12.0)),
                          ),
                        ),
                      ),
                    ),
                    Align(
                      alignment: AlignmentDirectional(1.0, -1.0),
                      child: Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 16.0, 0.0),
                        child: FlutterFlowIconButton(
                          borderColor: Colors.transparent,
                          borderRadius: 30.0,
                          borderWidth: 1.0,
                          buttonSize: 40.0,
                          fillColor: Color(0x33000000),
                          icon: Icon(
                            Icons.volume_off,
                            color: Colors.white,
                            size: 24.0,
                          ),
                          onPressed: () {
                            print('IconButton pressed ...');
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
    );
  }
}
