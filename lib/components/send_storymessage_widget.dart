import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'send_storymessage_model.dart';
export 'send_storymessage_model.dart';

class SendStorymessageWidget extends StatefulWidget {
  const SendStorymessageWidget({
    super.key,
    this.parameter1,
    this.parameter2,
    this.parameter3,
  });

  final DocumentReference? parameter1;
  final DocumentReference? parameter2;
  final DocumentReference? parameter3;

  @override
  State<SendStorymessageWidget> createState() => _SendStorymessageWidgetState();
}

class _SendStorymessageWidgetState extends State<SendStorymessageWidget> {
  late SendStorymessageModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SendStorymessageModel());

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(16.0, 8.0, 16.0, 8.0),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Color(0x99000000),
          borderRadius: BorderRadius.circular(24.0),
        ),
        child: Padding(
          padding: EdgeInsets.all(12.0),
          child: Row(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: TextFormField(
                  controller: _model.textController,
                  focusNode: _model.textFieldFocusNode,
                  onFieldSubmitted: (_) async {
                    await StoryCommentsRecord.collection
                        .doc()
                        .set(createStoryCommentsRecordData(
                          storyAssociation: widget.parameter1,
                          commentUser: currentUserReference,
                          comment: _model.textController.text,
                          timePosted: getCurrentTimestamp,
                          notificationText: 'commented on your story!',
                          isRead: false,
                          type: 'comment',
                        ));
                  },
                  autofocus: false,
                  obscureText: false,
                  decoration: InputDecoration(
                    hintText: 'Send message...',
                    hintStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.figtree(
                            fontWeight: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                          color: Color(0x99FFFFFF),
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    errorBorder: InputBorder.none,
                    focusedErrorBorder: InputBorder.none,
                  ),
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.figtree(
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).alternate,
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                  cursorColor: FlutterFlowTheme.of(context).alternate,
                  validator:
                      _model.textControllerValidator.asValidator(context),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                child: FlutterFlowIconButton(
                  borderRadius: 20.0,
                  buttonSize: 40.0,
                  icon: Icon(
                    Icons.send,
                    color: FlutterFlowTheme.of(context).alternate,
                    size: 24.0,
                  ),
                  onPressed: () async {
                    if (_model.textController.text != '') {
                      await StoryCommentsRecord.collection
                          .doc()
                          .set(createStoryCommentsRecordData(
                            storyAssociation: widget.parameter1,
                            commentUser: currentUserReference,
                            comment: _model.textController.text,
                            timePosted: getCurrentTimestamp,
                            notificationText: 'commented on your story!',
                            isRead: false,
                            type: 'comment',
                          ));

                      await StoryNotificationsRecord.collection
                          .doc()
                          .set(createStoryNotificationsRecordData(
                            storyId: widget.parameter2,
                            userId: widget.parameter3,
                            time: getCurrentTimestamp,
                            isRead: false,
                            notificationText: 'commented on your story!',
                            type: 'comment',
                          ));
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
