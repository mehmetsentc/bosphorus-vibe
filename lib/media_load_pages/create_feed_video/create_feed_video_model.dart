import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'create_feed_video_widget.dart' show CreateFeedVideoWidget;
import 'package:flutter/material.dart';

class CreateFeedVideoModel extends FlutterFlowModel<CreateFeedVideoWidget> {
  ///  State fields for stateful widgets in this page.

  bool isDataUploading_uploadDataVideoPage = false;
  FFUploadedFile uploadedLocalFile_uploadDataVideoPage =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataVideoPage = '';

  // State field(s) for video_Description widget.
  FocusNode? videoDescriptionFocusNode;
  TextEditingController? videoDescriptionTextController;
  String? Function(BuildContext, String?)?
      videoDescriptionTextControllerValidator;
  // Stores action output result for [Backend Call - Create Document] action in Button widget.
  UserPostsRecord? postSingleVideoUpload;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    videoDescriptionFocusNode?.dispose();
    videoDescriptionTextController?.dispose();
  }
}
