import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'create_story_widget.dart' show CreateStoryWidget;
import 'package:flutter/material.dart';

class CreateStoryModel extends FlutterFlowModel<CreateStoryWidget> {
  ///  State fields for stateful widgets in this page.

  bool isDataUploading_uploadDataTf7 = false;
  FFUploadedFile uploadedLocalFile_uploadDataTf7 =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataTf7 = '';

  // State field(s) for storyDescription widget.
  FocusNode? storyDescriptionFocusNode;
  TextEditingController? storyDescriptionTextController;
  String? Function(BuildContext, String?)?
      storyDescriptionTextControllerValidator;
  // State field(s) for MouseRegion_1 widget.
  bool mouseRegion1Hovered = false;
  bool isDataUploading_uploadDataDcr = false;
  FFUploadedFile uploadedLocalFile_uploadDataDcr =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataDcr = '';

  bool isDataUploading_uploadDataKp0 = false;
  FFUploadedFile uploadedLocalFile_uploadDataKp0 =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataKp0 = '';

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    storyDescriptionFocusNode?.dispose();
    storyDescriptionTextController?.dispose();
  }
}
