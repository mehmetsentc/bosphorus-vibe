import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'send_story_comment_model.dart';
export 'send_story_comment_model.dart';

class SendStoryCommentWidget extends StatefulWidget {
  const SendStoryCommentWidget({
    super.key,
    this.parameter1,
    this.parameter2,
  });

  final DocumentReference? parameter1;
  final String? parameter2;

  @override
  State<SendStoryCommentWidget> createState() => _SendStoryCommentWidgetState();
}

class _SendStoryCommentWidgetState extends State<SendStoryCommentWidget> {
  late SendStoryCommentModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SendStoryCommentModel());

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
    return TextFormField(
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
                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
              ),
              color: Color(0x99FFFFFF),
              letterSpacing: 0.0,
              fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
            ),
        enabledBorder: InputBorder.none,
        focusedBorder: InputBorder.none,
        errorBorder: InputBorder.none,
        focusedErrorBorder: InputBorder.none,
      ),
      style: FlutterFlowTheme.of(context).bodyMedium.override(
            font: GoogleFonts.figtree(
              fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
            ),
            color: FlutterFlowTheme.of(context).alternate,
            letterSpacing: 0.0,
            fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
            fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
          ),
      cursorColor: FlutterFlowTheme.of(context).alternate,
      validator: _model.textControllerValidator.asValidator(context),
    );
  }
}
