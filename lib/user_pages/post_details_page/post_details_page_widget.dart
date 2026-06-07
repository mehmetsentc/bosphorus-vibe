import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/post_details_base/post_details_base_widget.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'post_details_page_model.dart';
export 'post_details_page_model.dart';

class PostDetailsPageWidget extends StatefulWidget {
  const PostDetailsPageWidget({
    super.key,
    this.postReference,
    this.userRecord,
  });

  final UserPostsRecord? postReference;
  final UsersRecord? userRecord;

  static String routeName = 'postDetails_Page';
  static String routePath = '/postDetailsPage';

  @override
  State<PostDetailsPageWidget> createState() => _PostDetailsPageWidgetState();
}

class _PostDetailsPageWidgetState extends State<PostDetailsPageWidget> {
  late PostDetailsPageModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PostDetailsPageModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: FlutterFlowTheme.of(context).secondaryBackground,
      appBar: responsiveVisibility(
        context: context,
        tabletLandscape: false,
        desktop: false,
      )
          ? AppBar(
              backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
              automaticallyImplyLeading: false,
              leading: FlutterFlowIconButton(
                borderColor: Colors.transparent,
                borderRadius: 30.0,
                borderWidth: 1.0,
                buttonSize: 60.0,
                icon: Icon(
                  Icons.chevron_left,
                  color: FlutterFlowTheme.of(context).primaryText,
                  size: 30.0,
                ),
                onPressed: () async {
                  context.pop();
                },
              ),
              actions: [],
              centerTitle: true,
              elevation: 2.0,
            )
          : null,
      body: Row(
        mainAxisSize: MainAxisSize.max,
        children: [
          Expanded(
            child: Align(
              alignment: AlignmentDirectional(0.0, -1.0),
              child: wrapWithModel(
                model: _model.postDetailsBaseModel,
                updateCallback: () => safeSetState(() {}),
                updateOnChange: true,
                child: PostDetailsBaseWidget(
                  postRef: widget.postReference?.reference,
                  userRef: widget.userRecord!,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
