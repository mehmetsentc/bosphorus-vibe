import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'upload_media_onboarding_widget.dart' show UploadMediaOnboardingWidget;
import 'package:flutter/material.dart';

class UploadMediaOnboardingModel
    extends FlutterFlowModel<UploadMediaOnboardingWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for PageView widget.
  PageController? pageViewController;

  int get pageViewCurrentIndex => pageViewController != null &&
          pageViewController!.hasClients &&
          pageViewController!.page != null
      ? pageViewController!.page!.round()
      : 0;
  bool isDataUploading_uploadDataRws1 = false;
  FFUploadedFile uploadedLocalFile_uploadDataRws1 =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataRws1 = '';

  bool isDataUploading_uploadDataH0711 = false;
  FFUploadedFile uploadedLocalFile_uploadDataH0711 =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataH0711 = '';

  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // State field(s) for Switch widget.
  bool? switchValue1;
  // State field(s) for Switch widget.
  bool? switchValue2;
  // Stores action output result for [Backend Call - Create Document] action in Button widget.
  UserDraftsRecord? saveDraftUpload;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
