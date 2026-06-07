import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'porties_page_view_feed_model.dart';
export 'porties_page_view_feed_model.dart';

/// Create a page
/// {
///   "page": {
///     "name": "ReelsFeedPage",
///     "description": "Full-screen scrollable vertical video feed like
/// Instagram Reels or TikTok.",
///     "layout": {
///       "type": "pageView",
///       "axis": "vertical",
///       "dynamicItemCount": true,
///       "dataSource": {
///         "type": "firestoreQuery",
///         "collection": "userPosts",
///         "filters": [
///           {
///             "field": "mediaType",
///             "operator": "==",
///             "value": "video"
///           }
///         ],
///         "orderBy": {
///           "field": "created_at",
///           "descending": true
///         }
///       },
///       "itemBuilder": {
///         "type": "container",
///         "height": "infinity",
///         "width": "infinity",
///         "alignment": "center",
///         "backgroundColor": "#000000",
///         "content": [
///           {
///             "type": "videoPlayer",
///             "videoUrl": "{{item.postVideoUrl}}",
///             "autoPlay": true,
///             "looping": true,
///             "fullScreen": true,
///             "muted": false
///           },
///           {
///             "type": "positioned",
///             "bottom": 32,
///             "left": 16,
///             "child": {
///               "type": "column",
///               "alignment": "start",
///               "spacing": 4,
///               "children": [
///                 {
///                   "type": "text",
///                   "text": "@{{item.username}}",
///                   "style": {
///                     "color": "#ffffff",
///                     "fontSize": 16,
///                     "fontWeight": "bold"
///                   }
///                 },
///                 {
///                   "type": "text",
///                   "text": "{{item.caption}}",
///                   "style": {
///                     "color": "#dddddd",
///                     "fontSize": 14
///                   }
///                 }
///               ]
///             }
///           },
///           {
///             "type": "positioned",
///             "right": 16,
///             "bottom": 100,
///             "child": {
///               "type": "column",
///               "spacing": 16,
///               "children": [
///                 {
///                   "type": "iconButton",
///                   "icon": "favorite",
///                   "iconColor": "#ffffff",
///                   "onPressed": {
///                     "action": "customAction",
///                     "code": "likePost(item.reference)"
///                   }
///                 },
///                 {
///                   "type": "iconButton",
///                   "icon": "comment",
///                   "iconColor": "#ffffff",
///                   "onPressed": {
///                     "action": "navigate",
///                     "target": "CommentPage",
///                     "parameters": {
///                       "postRef": "{{item.reference}}"
///                     }
///                   }
///                 },
///                 {
///                   "type": "iconButton",
///                   "icon": "bookmark",
///                   "iconColor": "#ffffff",
///                   "onPressed": {
///                     "action": "customAction",
///                     "code": "saveToFavorites(item.reference)"
///                   }
///                 }
///               ]
///             }
///           }
///         ]
///       }
///     }
///   }
/// }
///
class PortiesPageViewFeedWidget extends StatefulWidget {
  const PortiesPageViewFeedWidget({super.key});

  static String routeName = 'Porties_Page_View_Feed';
  static String routePath = '/portiesPageViewFeed';

  @override
  State<PortiesPageViewFeedWidget> createState() =>
      _PortiesPageViewFeedWidgetState();
}

class _PortiesPageViewFeedWidgetState extends State<PortiesPageViewFeedWidget> {
  late PortiesPageViewFeedModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PortiesPageViewFeedModel());

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
        backgroundColor: Colors.black,
        body: PageView(
          controller: _model.pageViewController ??=
              PageController(initialPage: 0),
          onPageChanged: (_) => safeSetState(() {}),
          scrollDirection: Axis.vertical,
          children: [
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
              ),
              child: Stack(
                children: [
                  FlutterFlowVideoPlayer(
                    path: '<URL omitted>',
                    videoType: VideoType.network,
                    width: double.infinity,
                    height: double.infinity,
                    autoPlay: true,
                    looping: true,
                    showControls: false,
                    allowFullScreen: true,
                    allowPlaybackSpeedMenu: false,
                    lazyLoad: false,
                    pauseOnNavigate: false,
                  ),
                  Align(
                    alignment: AlignmentDirectional(-1.0, 1.0),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 32.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                80.0, 0.0, 80.0, 4.0),
                            child: Text(
                              '@sarah_adventures',
                              style: FlutterFlowTheme.of(context)
                                  .bodyLarge
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyLarge
                                          .fontStyle,
                                    ),
                                    color: Colors.white,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyLarge
                                        .fontStyle,
                                  ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                80.0, 0.0, 80.0, 0.0),
                            child: Text(
                              'Exploring the hidden gems of Bali 🌺 This waterfall is absolutely breathtaking! #bali #travel #nature',
                              maxLines: 3,
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
                                    color: Color(0xFFDDDDDD),
                                    letterSpacing: 0.0,
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
                    ),
                  ),
                  Align(
                    alignment: AlignmentDirectional(1.0, 1.0),
                    child: Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(
                          16.0, 0.0, 16.0, 100.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
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
                                '2.4K',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.chat_bubble_outline,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '156',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.share,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '89',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.bookmark_border,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                        ].divide(SizedBox(height: 16.0)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
              ),
              child: Stack(
                children: [
                  FlutterFlowVideoPlayer(
                    path: '<URL omitted>',
                    videoType: VideoType.network,
                    width: double.infinity,
                    height: double.infinity,
                    autoPlay: true,
                    looping: true,
                    showControls: false,
                    allowFullScreen: true,
                    allowPlaybackSpeedMenu: false,
                    lazyLoad: false,
                    pauseOnNavigate: false,
                  ),
                  Align(
                    alignment: AlignmentDirectional(-1.0, 1.0),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 32.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                80.0, 0.0, 80.0, 4.0),
                            child: Text(
                              '@chef_marco',
                              style: FlutterFlowTheme.of(context)
                                  .bodyLarge
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyLarge
                                          .fontStyle,
                                    ),
                                    color: Colors.white,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyLarge
                                        .fontStyle,
                                  ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                80.0, 0.0, 80.0, 0.0),
                            child: Text(
                              'Making the perfect pasta from scratch! The secret is in the technique 👨‍🍳 #cooking #pasta #italian',
                              maxLines: 3,
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
                                    color: Color(0xFFDDDDDD),
                                    letterSpacing: 0.0,
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
                    ),
                  ),
                  Align(
                    alignment: AlignmentDirectional(1.0, 1.0),
                    child: Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(
                          16.0, 0.0, 16.0, 100.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.favorite,
                                  color: Color(0xFFFF4444),
                                  size: 28.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '5.2K',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.chat_bubble_outline,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '324',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.share,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '127',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.bookmark_border,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                        ].divide(SizedBox(height: 16.0)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
              ),
              child: Stack(
                children: [
                  FlutterFlowVideoPlayer(
                    path: '<URL omitted>',
                    videoType: VideoType.network,
                    width: double.infinity,
                    height: double.infinity,
                    autoPlay: true,
                    looping: true,
                    showControls: false,
                    allowFullScreen: true,
                    allowPlaybackSpeedMenu: false,
                    lazyLoad: false,
                    pauseOnNavigate: false,
                  ),
                  Align(
                    alignment: AlignmentDirectional(-1.0, 1.0),
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 32.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                80.0, 0.0, 80.0, 4.0),
                            child: Text(
                              '@fitness_jenny',
                              style: FlutterFlowTheme.of(context)
                                  .bodyLarge
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyLarge
                                          .fontStyle,
                                    ),
                                    color: Colors.white,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyLarge
                                        .fontStyle,
                                  ),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                80.0, 0.0, 80.0, 0.0),
                            child: Text(
                              '30-minute morning workout to start your day right! 💪 Who\'s joining me? #fitness #workout #motivation',
                              maxLines: 3,
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
                                    color: Color(0xFFDDDDDD),
                                    letterSpacing: 0.0,
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
                    ),
                  ),
                  Align(
                    alignment: AlignmentDirectional(1.0, 1.0),
                    child: Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(
                          16.0, 0.0, 16.0, 100.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
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
                                '1.8K',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.chat_bubble_outline,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '92',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.share,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                              Text(
                                '45',
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .override(
                                      font: GoogleFonts.figtree(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              FlutterFlowIconButton(
                                borderRadius: 24.0,
                                buttonSize: 48.0,
                                fillColor: Color(0x4D000000),
                                icon: Icon(
                                  Icons.bookmark,
                                  color: Colors.white,
                                  size: 26.0,
                                ),
                                onPressed: () {
                                  print('IconButton pressed ...');
                                },
                              ),
                            ].divide(SizedBox(height: 4.0)),
                          ),
                        ].divide(SizedBox(height: 16.0)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
