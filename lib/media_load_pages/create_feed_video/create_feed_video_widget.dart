import '/backend/backend.dart';
import '/backend/firebase_storage/storage.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_media_display.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/upload_data.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'create_feed_video_model.dart';
export 'create_feed_video_model.dart';

class CreateFeedVideoWidget extends StatefulWidget {
  const CreateFeedVideoWidget({
    super.key,
    this.ssss,
  });

  final String? ssss;

  static String routeName = 'createFeedVideo';
  static String routePath = '/createFeedVideo';

  @override
  State<CreateFeedVideoWidget> createState() => _CreateFeedVideoWidgetState();
}

class _CreateFeedVideoWidgetState extends State<CreateFeedVideoWidget> {
  late CreateFeedVideoModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CreateFeedVideoModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      final selectedMedia = await selectMedia(
        isVideo: true,
        mediaSource: MediaSource.videoGallery,
        multiImage: false,
      );
      if (selectedMedia != null &&
          selectedMedia
              .every((m) => validateFileFormat(m.storagePath, context))) {
        safeSetState(() => _model.isDataUploading_uploadDataVideoPage = true);
        var selectedUploadedFiles = <FFUploadedFile>[];

        var downloadUrls = <String>[];
        try {
          showUploadMessage(
            context,
            'Uploading file...',
            showLoading: true,
          );
          selectedUploadedFiles = selectedMedia
              .map((m) => FFUploadedFile(
                    name: m.storagePath.split('/').last,
                    bytes: m.bytes,
                    height: m.dimensions?.height,
                    width: m.dimensions?.width,
                    blurHash: m.blurHash,
                    originalFilename: m.originalFilename,
                  ))
              .toList();

          downloadUrls = (await Future.wait(
            selectedMedia.map(
              (m) async => await uploadData(m.storagePath, m.bytes),
            ),
          ))
              .where((u) => u != null)
              .map((u) => u!)
              .toList();
        } finally {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          _model.isDataUploading_uploadDataVideoPage = false;
        }
        if (selectedUploadedFiles.length == selectedMedia.length &&
            downloadUrls.length == selectedMedia.length) {
          safeSetState(() {
            _model.uploadedLocalFile_uploadDataVideoPage =
                selectedUploadedFiles.first;
            _model.uploadedFileUrl_uploadDataVideoPage = downloadUrls.first;
          });
          showUploadMessage(context, 'Success!');
        } else {
          safeSetState(() {});
          showUploadMessage(context, 'Failed to upload data');
          return;
        }
      }
    });

    _model.videoDescriptionTextController ??= TextEditingController();
    _model.videoDescriptionFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Color(0xFF1A1F24),
      body: SafeArea(
        top: true,
        child: Align(
          alignment: AlignmentDirectional(0.0, -1.0),
          child: Container(
            constraints: BoxConstraints(
              maxWidth: 570.0,
            ),
            decoration: BoxDecoration(),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Container(
                    height: MediaQuery.sizeOf(context).height * 0.8,
                    child: Stack(
                      children: [
                        if (functions.hasUploadedMedia(
                            _model.uploadedFileUrl_uploadDataVideoPage))
                          Align(
                            alignment: AlignmentDirectional(0.0, 0.0),
                            child: FlutterFlowMediaDisplay(
                              path: _model.uploadedFileUrl_uploadDataVideoPage,
                              imageBuilder: (path) => Image.network(
                                path,
                                width: MediaQuery.sizeOf(context).width * 1.0,
                                height: double.infinity,
                                fit: BoxFit.cover,
                              ),
                              videoPlayerBuilder: (path) =>
                                  FlutterFlowVideoPlayer(
                                path: path,
                                width: MediaQuery.sizeOf(context).width * 1.0,
                                autoPlay: true,
                                looping: true,
                                showControls: true,
                                allowFullScreen: true,
                                allowPlaybackSpeedMenu: false,
                              ),
                            ),
                          ),
                        if (functions.hasUploadedMedia(_model
                            .isDataUploading_uploadDataVideoPage
                            .toString()))
                          Align(
                            alignment: AlignmentDirectional(0.0, 0.0),
                            child: FlutterFlowMediaDisplay(
                              path: _model.uploadedFileUrl_uploadDataVideoPage,
                              imageBuilder: (path) => Image.network(
                                path,
                                width: MediaQuery.sizeOf(context).width * 1.0,
                                height: double.infinity,
                                fit: BoxFit.cover,
                              ),
                              videoPlayerBuilder: (path) =>
                                  FlutterFlowVideoPlayer(
                                path: path,
                                width: MediaQuery.sizeOf(context).width * 1.0,
                                autoPlay: false,
                                looping: true,
                                showControls: true,
                                allowFullScreen: true,
                                allowPlaybackSpeedMenu: false,
                              ),
                            ),
                          ),
                        Column(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 16.0, 16.0, 0.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  FlutterFlowIconButton(
                                    borderColor: Colors.transparent,
                                    borderRadius: 30.0,
                                    borderWidth: 1.0,
                                    buttonSize: 40.0,
                                    fillColor: Color(0x41000000),
                                    icon: Icon(
                                      Icons.close_rounded,
                                      color: FlutterFlowTheme.of(context)
                                          .alternate,
                                      size: 32.0,
                                    ),
                                    onPressed: () async {
                                      context.pop();
                                    },
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 4.0, 0.0, 0.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                children: [
                                  Expanded(
                                    child: Align(
                                      alignment: AlignmentDirectional(0.0, 1.0),
                                      child: Container(
                                        width:
                                            MediaQuery.sizeOf(context).width *
                                                1.0,
                                        height: 100.0,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: Color(0x4C404B62),
                                          ),
                                        ),
                                        child: Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 8.0, 0.0, 0.0),
                                          child: TextFormField(
                                            controller: _model
                                                .videoDescriptionTextController,
                                            focusNode: _model
                                                .videoDescriptionFocusNode,
                                            obscureText: false,
                                            decoration: InputDecoration(
                                              hintText: 'Desription...',
                                              hintStyle: FlutterFlowTheme.of(
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
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .alternate,
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
                                              enabledBorder:
                                                  UnderlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .backround,
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(0.0),
                                              ),
                                              focusedBorder:
                                                  UnderlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: Color(0x00000000),
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(0.0),
                                              ),
                                              errorBorder: UnderlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: Color(0x00000000),
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(0.0),
                                              ),
                                              focusedErrorBorder:
                                                  UnderlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: Color(0x00000000),
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(0.0),
                                              ),
                                              contentPadding:
                                                  EdgeInsetsDirectional
                                                      .fromSTEB(20.0, 20.0,
                                                          20.0, 12.0),
                                            ),
                                            style: FlutterFlowTheme.of(context)
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
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primaryText,
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
                                            textAlign: TextAlign.start,
                                            maxLines: 4,
                                            validator: _model
                                                .videoDescriptionTextControllerValidator
                                                .asValidator(context),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(12.0, 12.0, 12.0, 8.0),
                    child: Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 15.0, 0.0, 0.0),
                          child: FFButtonWidget(
                            onPressed: () async {
                              if ((_model.uploadedFileUrl_uploadDataVideoPage !=
                                          '') &&
                                  (_model.videoDescriptionTextController
                                              .text !=
                                          '')) {
                                var userPostsRecordReference =
                                    UserPostsRecord.collection.doc();
                                await userPostsRecordReference
                                    .set(createUserPostsRecordData(
                                  postVideo: _model
                                      .uploadedFileUrl_uploadDataVideoPage,
                                ));
                                _model.postSingleVideoUpload =
                                    UserPostsRecord.getDocumentFromData(
                                        createUserPostsRecordData(
                                          postVideo: _model
                                              .uploadedFileUrl_uploadDataVideoPage,
                                        ),
                                        userPostsRecordReference);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Your post has been uploaded successfully.',
                                      style: TextStyle(
                                        color: FlutterFlowTheme.of(context)
                                            .primaryText,
                                      ),
                                    ),
                                    duration: Duration(milliseconds: 4000),
                                    backgroundColor:
                                        FlutterFlowTheme.of(context).secondary,
                                  ),
                                );

                                context.pushNamed(
                                    ResponsibleReelsCloneWidget.routeName);
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      valueOrDefault<String>(
                                        _model
                                            .uploadedFileUrl_uploadDataVideoPage,
                                        'Media field cannot be empty',
                                      ),
                                      style: TextStyle(
                                        color: FlutterFlowTheme.of(context)
                                            .primaryText,
                                      ),
                                    ),
                                    duration: Duration(milliseconds: 4000),
                                    backgroundColor:
                                        FlutterFlowTheme.of(context).secondary,
                                  ),
                                );
                              }

                              safeSetState(() {});
                            },
                            text: 'Create Video',
                            options: FFButtonOptions(
                              width: 140.0,
                              height: 50.0,
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              iconPadding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              color: FlutterFlowTheme.of(context)
                                  .secondaryBackground,
                              textStyle: FlutterFlowTheme.of(context)
                                  .titleSmall
                                  .override(
                                    font: GoogleFonts.figtree(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context)
                                        .primaryText,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleSmall
                                        .fontStyle,
                                  ),
                              elevation: 2.0,
                              borderSide: BorderSide(
                                color: Colors.transparent,
                                width: 1.0,
                              ),
                              borderRadius: BorderRadius.circular(40.0),
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
      ),
    );
  }
}
