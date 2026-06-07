import '/backend/schema/structs/index.dart';
import '/components/input_value_field/input_value_field_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'trigger_with_input_model.dart';
export 'trigger_with_input_model.dart';

class TriggerWithInputWidget extends StatefulWidget {
  const TriggerWithInputWidget({super.key});

  @override
  State<TriggerWithInputWidget> createState() => _TriggerWithInputWidgetState();
}

class _TriggerWithInputWidgetState extends State<TriggerWithInputWidget> {
  late TriggerWithInputModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TriggerWithInputModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.parseOnInit = await _model.parseBuildShipConfig(
        context,
        jsonConfigString: FFLibraryValues().BuildShipConfiguration,
      );
      _model.decodedKeys =
          _model.parseOnInit!.inputList.toList().cast<String>();
      safeSetState(() {});
    });

    _model.textController ??= TextEditingController(
        text: valueOrDefault<String>(
      FFLibraryValues().BuildShipConfiguration,
      '{}',
    ));
    _model.textFieldFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    // On component dispose action.
    () async {
      _model.decodedKeys = [];
      _model.decodedJson = null;
      safeSetState(() {});
    }();

    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            child: TextFormField(
              controller: _model.textController,
              focusNode: _model.textFieldFocusNode,
              onChanged: (_) => EasyDebounce.debounce(
                '_model.textController',
                Duration(milliseconds: 500),
                () async {
                  if (_model.textController.text != null &&
                      _model.textController.text != '') {
                    _model.parseOnChange = await _model.parseBuildShipConfig(
                      context,
                      jsonConfigString: valueOrDefault<String>(
                        _model.textController.text,
                        '{}',
                      ),
                    );
                    _model.decodedKeys =
                        _model.parseOnChange!.inputList.toList().cast<String>();
                    _model.decodedJson = _model.parseOnChange?.toMap();
                    safeSetState(() {});
                  }

                  safeSetState(() {});
                },
              ),
              autofocus: false,
              obscureText: false,
              decoration: InputDecoration(
                isDense: true,
                labelText:
                    'BuildShip Configuration JSON (from FlutterFlow Trigger)',
                labelStyle: FlutterFlowTheme.of(context).labelMedium.override(
                      font: GoogleFonts.inter(
                        fontWeight:
                            FlutterFlowTheme.of(context).labelMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).labelMedium.fontStyle,
                      ),
                      fontSize: 14.0,
                      letterSpacing: 0.0,
                      fontWeight:
                          FlutterFlowTheme.of(context).labelMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).labelMedium.fontStyle,
                    ),
                hintStyle: FlutterFlowTheme.of(context).labelMedium.override(
                      font: GoogleFonts.inter(
                        fontWeight:
                            FlutterFlowTheme.of(context).labelMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).labelMedium.fontStyle,
                      ),
                      letterSpacing: 0.0,
                      fontWeight:
                          FlutterFlowTheme.of(context).labelMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).labelMedium.fontStyle,
                    ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Color(0x00000000),
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Color(0x00000000),
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: FlutterFlowTheme.of(context).error,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: FlutterFlowTheme.of(context).error,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                filled: true,
                fillColor: FlutterFlowTheme.of(context).secondaryBackground,
              ),
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.inter(
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
                    fontSize: 18.0,
                    letterSpacing: 0.0,
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
              maxLines: 5,
              cursorColor: FlutterFlowTheme.of(context).primaryText,
              validator: _model.textControllerValidator.asValidator(context),
            ),
          ),
          if (valueOrDefault<bool>(
            BuildshipConfigJsonStruct.maybeFromMap(_model.decodedJson)
                ?.hasAuthOption(),
            false,
          ))
            Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.lock,
                  color: FlutterFlowTheme.of(context).primaryText,
                  size: 24.0,
                ),
                Text(
                  valueOrDefault<String>(
                    (String? input) {
                      return input?.isNotEmpty == true
                          ? '${input![0].toUpperCase()}${input.substring(1)}'
                          : input;
                    }(getJsonField(
                      _model.decodedJson,
                      r'''$.authOption''',
                    ).toString()),
                    'None',
                  ),
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.inter(
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).secondaryText,
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                ),
              ].divide(SizedBox(width: 12.0)),
            ),
          if (BuildshipConfigJsonStruct.maybeFromMap(_model.decodedJson)
                  ?.authOption ==
              ('firebase'))
            Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                  child: Text(
                    'For Firebase Auth, the \'AuthValue\' is the authenticated user token. Click \"Set from Variable\" -> \"Authenticated User\" -> \"Id Token (JWT Token)\".',
                    textAlign: TextAlign.center,
                    style: FlutterFlowTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.inter(
                            fontWeight: FontWeight.w500,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).secondaryText,
                          fontSize: 12.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w500,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                  ),
                ),
              ],
            ),
          if (valueOrDefault<bool>(
            (BuildshipConfigJsonStruct.maybeFromMap(_model.decodedJson)
                        ?.authOption ==
                    ('firebase')) ||
                (BuildshipConfigJsonStruct.maybeFromMap(_model.decodedJson)
                        ?.authOption ==
                    ('supabase')),
            false,
          ))
            Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                  child: Text(
                    'For Supabase Auth, the \'AuthValue\' is the public/anon key from your Supabase Dashboard.',
                    textAlign: TextAlign.center,
                    style: FlutterFlowTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.inter(
                            fontWeight: FontWeight.w500,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).secondaryText,
                          fontSize: 12.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w500,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                  ),
                ),
              ],
            ),
          Divider(
            thickness: 2.0,
            color: FlutterFlowTheme.of(context).alternate,
          ),
          if (valueOrDefault<bool>(
            _model.decodedKeys.isNotEmpty ? true : false,
            false,
          ))
            Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 4.0),
                  child: Text(
                    'Based on your BuildShip configuration, your workflow requires these inputs:',
                    textAlign: TextAlign.center,
                    style: FlutterFlowTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.inter(
                            fontWeight: FontWeight.w500,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).secondaryText,
                          fontSize: 12.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w500,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                  ),
                ),
                Builder(
                  builder: (context) {
                    final keyList = _model.decodedKeys.toList();

                    return ListView.separated(
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      scrollDirection: Axis.vertical,
                      itemCount: keyList.length,
                      separatorBuilder: (_, __) => SizedBox(height: 12.0),
                      itemBuilder: (context, keyListIndex) {
                        final keyListItem = keyList[keyListIndex];
                        return Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 8.0, 0.0),
                              child: Text(
                                keyListItem,
                                style: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .override(
                                      font: GoogleFonts.inter(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryText,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                            Flexible(
                              child: wrapWithModel(
                                model: _model.inputValueFieldModels.getModel(
                                  keyListIndex.toString(),
                                  keyListIndex,
                                ),
                                updateCallback: () => safeSetState(() {}),
                                child: InputValueFieldWidget(
                                  key: Key(
                                    'Keygkx_${keyListIndex.toString()}',
                                  ),
                                  keyName: keyListItem,
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(0.0, 12.0, 0.0, 0.0),
            child: FFButtonWidget(
              onPressed: ((_model.textController.text == '{}') ||
                      (_model.textController.text == null ||
                          _model.textController.text == ''))
                  ? null
                  : () async {
                      _model.workflowResponse =
                          await action_blocks.triggerBuildShipWorkflow(
                        context,
                        buildshipConfig: _model.textController.text,
                        authOption: valueOrDefault<String>(
                          () {
                            if (FFLibraryValues().Authentication != null) {
                              return valueOrDefault<String>(
                                functions.enumToString(
                                    FFLibraryValues().Authentication),
                                'none',
                              );
                            } else if (BuildshipConfigJsonStruct.maybeFromMap(
                                            _model.decodedJson)
                                        ?.authOption !=
                                    null &&
                                BuildshipConfigJsonStruct.maybeFromMap(
                                            _model.decodedJson)
                                        ?.authOption !=
                                    '') {
                              return BuildshipConfigJsonStruct.maybeFromMap(
                                      _model.decodedJson)
                                  ?.authOption;
                            } else {
                              return 'none';
                            }
                          }(),
                          'none',
                        ),
                        authValue: () {
                          if (FFLibraryValues().AuthValue != null &&
                              FFLibraryValues().AuthValue != '') {
                            return FFLibraryValues().AuthValue;
                          } else if (BuildshipConfigJsonStruct.maybeFromMap(
                                          _model.decodedJson)
                                      ?.authOption !=
                                  null &&
                              BuildshipConfigJsonStruct.maybeFromMap(
                                          _model.decodedJson)
                                      ?.authOption !=
                                  '') {
                            return 'firebaseOrSupabaseJwtToken';
                          } else {
                            return 'none';
                          }
                        }(),
                        valuesList: _model.inputValueFieldModels.getValues(
                          (m) => m.textController.text,
                        ),
                      );
                      await showDialog(
                        context: context,
                        builder: (alertDialogContext) {
                          return AlertDialog(
                            title: Text('BuildShip Workflow Response'),
                            content: Text(_model.workflowResponse!.toString()),
                            actions: [
                              TextButton(
                                onPressed: () =>
                                    Navigator.pop(alertDialogContext),
                                child: Text('Ok'),
                              ),
                            ],
                          );
                        },
                      );

                      safeSetState(() {});
                    },
              text: 'Trigger BuildShip Workflow',
              options: FFButtonOptions(
                height: 40.0,
                padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                color: FlutterFlowTheme.of(context).primary,
                textStyle: FlutterFlowTheme.of(context).titleSmall.override(
                      font: GoogleFonts.interTight(
                        fontWeight:
                            FlutterFlowTheme.of(context).titleSmall.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).titleSmall.fontStyle,
                      ),
                      color: Colors.white,
                      letterSpacing: 0.0,
                      fontWeight:
                          FlutterFlowTheme.of(context).titleSmall.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).titleSmall.fontStyle,
                    ),
                elevation: 0.0,
                borderRadius: BorderRadius.circular(8.0),
                disabledColor: Color(0x8357636C),
                disabledTextColor: FlutterFlowTheme.of(context).secondaryText,
              ),
            ),
          ),
        ].divide(SizedBox(height: 12.0)),
      ),
    );
  }
}
