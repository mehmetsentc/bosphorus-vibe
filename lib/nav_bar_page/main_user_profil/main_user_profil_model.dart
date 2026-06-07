import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'main_user_profil_widget.dart' show MainUserProfilWidget;
import 'package:flutter/material.dart';

class MainUserProfilModel extends FlutterFlowModel<MainUserProfilWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for sideNav_New component.
  late SideNavNewModel sideNavNewModel;
  bool isDataUploading_uploadDataG5xx = false;
  FFUploadedFile uploadedLocalFile_uploadDataG5xx =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
  String uploadedFileUrl_uploadDataG5xx = '';

  @override
  void initState(BuildContext context) {
    sideNavNewModel = createModel(context, () => SideNavNewModel());
  }

  @override
  void dispose() {
    sideNavNewModel.dispose();
  }
}
