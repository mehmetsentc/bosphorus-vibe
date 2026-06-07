import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import '/index.dart';
import 'upload_media_page_widget.dart' show UploadMediaPageWidget;
import 'package:flutter/material.dart';

class UploadMediaPageModel extends FlutterFlowModel<UploadMediaPageWidget> {
  ///  State fields for stateful widgets in this page.

  bool isDataUploading_uploadData1vq = false;
  FFUploadedFile uploadedLocalFile_uploadData1vq =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadData1vq = '';

  // State field(s) for activity_dropdown widget.
  String? activityDropdownValue;
  FormFieldController<String>? activityDropdownValueController;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // State field(s) for allow_comments_Switch widget.
  bool? allowCommentsSwitchValue;
  // State field(s) for private_post_Switch widget.
  bool? privatePostSwitchValue;
  // Stores action output result for [Backend Call - Create Document] action in share_post widget.
  UserPostsRecord? postPhotoUpload;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
