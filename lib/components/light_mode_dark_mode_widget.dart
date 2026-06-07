import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'light_mode_dark_mode_model.dart';
export 'light_mode_dark_mode_model.dart';

class LightModeDarkModeWidget extends StatefulWidget {
  const LightModeDarkModeWidget({super.key});

  @override
  State<LightModeDarkModeWidget> createState() =>
      _LightModeDarkModeWidgetState();
}

class _LightModeDarkModeWidgetState extends State<LightModeDarkModeWidget> {
  late LightModeDarkModeModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LightModeDarkModeModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional(0.0, -1.0),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 16.0),
        child: Container(
          width: 120.0,
          height: 60.0,
          decoration: BoxDecoration(
            color: FlutterFlowTheme.of(context).tertiary,
            borderRadius: BorderRadius.circular(12.0),
            shape: BoxShape.rectangle,
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
              width: 1.0,
            ),
          ),
          child: Padding(
            padding: EdgeInsets.all(4.0),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Expanded(
                  child: InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      setDarkModeSetting(context, ThemeMode.light);
                    },
                    child: Container(
                      width: 40.0,
                      height: 40.0,
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.light
                            ? FlutterFlowTheme.of(context).secondaryBackground
                            : FlutterFlowTheme.of(context).primaryBackground,
                        borderRadius: BorderRadius.circular(10.0),
                        border: Border.all(
                          color: valueOrDefault<Color>(
                            Theme.of(context).brightness == Brightness.light
                                ? FlutterFlowTheme.of(context).alternate
                                : FlutterFlowTheme.of(context)
                                    .primaryBackground,
                            FlutterFlowTheme.of(context).alternate,
                          ),
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.wb_sunny_rounded,
                            color: Theme.of(context).brightness ==
                                    Brightness.light
                                ? FlutterFlowTheme.of(context).primaryText
                                : FlutterFlowTheme.of(context).secondaryText,
                            size: 12.0,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      setDarkModeSetting(context, ThemeMode.dark);
                    },
                    child: Container(
                      width: 40.0,
                      height: 40.0,
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? FlutterFlowTheme.of(context).secondaryBackground
                            : FlutterFlowTheme.of(context).primaryBackground,
                        borderRadius: BorderRadius.circular(10.0),
                        border: Border.all(
                          color: valueOrDefault<Color>(
                            Theme.of(context).brightness == Brightness.dark
                                ? FlutterFlowTheme.of(context).alternate
                                : FlutterFlowTheme.of(context)
                                    .primaryBackground,
                            FlutterFlowTheme.of(context).primaryBackground,
                          ),
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.nightlight_round,
                            color: Theme.of(context).brightness ==
                                    Brightness.dark
                                ? FlutterFlowTheme.of(context).primaryText
                                : FlutterFlowTheme.of(context).secondaryText,
                            size: 12.0,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
