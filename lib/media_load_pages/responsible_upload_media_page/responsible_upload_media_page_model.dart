import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import '/index.dart';
import 'responsible_upload_media_page_widget.dart'
    show ResponsibleUploadMediaPageWidget;
import 'package:flutter/material.dart';

class ResponsibleUploadMediaPageModel
    extends FlutterFlowModel<ResponsibleUploadMediaPageWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for PageView widget.
  PageController? pageViewController;

  int get pageViewCurrentIndex => pageViewController != null &&
          pageViewController!.hasClients &&
          pageViewController!.page != null
      ? pageViewController!.page!.round()
      : 0;
  bool isDataUploading_uploadDataVideoPlay = false;
  FFUploadedFile uploadedLocalFile_uploadDataVideoPlay =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataVideoPlay = '';

  // State field(s) for activity_dropdown widget.
  String? activityDropdownValue;
  FormFieldController<String>? activityDropdownValueController;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController1;
  String? Function(BuildContext, String?)? textController1Validator;
  // State field(s) for CountCostumer widget.
  FocusNode? countCostumerFocusNode;
  TextEditingController? countCostumerTextController;
  String? Function(BuildContext, String?)? countCostumerTextControllerValidator;
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
    textController1?.dispose();

    countCostumerFocusNode?.dispose();
    countCostumerTextController?.dispose();
  }
}
