import '/event_page_component/event_menu_compinent/event_menu_compinent_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'drawler_menu_widget.dart' show DrawlerMenuWidget;
import 'package:flutter/material.dart';

class DrawlerMenuModel extends FlutterFlowModel<DrawlerMenuWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for Event_menu_Compinent component.
  late EventMenuCompinentModel eventMenuCompinentModel;

  @override
  void initState(BuildContext context) {
    eventMenuCompinentModel =
        createModel(context, () => EventMenuCompinentModel());
  }

  @override
  void dispose() {
    eventMenuCompinentModel.dispose();
  }
}
