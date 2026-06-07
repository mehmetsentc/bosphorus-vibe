import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'multible_photo_video_sharing_widget.dart'
    show MultiblePhotoVideoSharingWidget;
import 'package:flutter/material.dart';

class MultiblePhotoVideoSharingModel
    extends FlutterFlowModel<MultiblePhotoVideoSharingWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  bool isDataUploading_uploadDataA0f = false;
  List<FFUploadedFile> uploadedLocalFiles_uploadDataA0f = [];
  List<String> uploadedFileUrls_uploadDataA0f = [];

  bool isDataUploading_uploadData5wl = false;
  FFUploadedFile uploadedLocalFile_uploadData5wl =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadData5wl = '';

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
  }
}
