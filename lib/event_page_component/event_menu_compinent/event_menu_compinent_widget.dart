import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'event_menu_compinent_model.dart';
export 'event_menu_compinent_model.dart';

class EventMenuCompinentWidget extends StatefulWidget {
  const EventMenuCompinentWidget({
    super.key,
    required this.navSelected,
  });

  final int? navSelected;

  @override
  State<EventMenuCompinentWidget> createState() =>
      _EventMenuCompinentWidgetState();
}

class _EventMenuCompinentWidgetState extends State<EventMenuCompinentWidget> {
  late EventMenuCompinentModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => EventMenuCompinentModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 303.35,
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
        boxShadow: [
          BoxShadow(
            blurRadius: 4.0,
            color: Color(0x1A000000),
            offset: Offset(
              2.0,
              0.0,
            ),
            spreadRadius: 0.0,
          )
        ],
      ),
    );
  }
}
