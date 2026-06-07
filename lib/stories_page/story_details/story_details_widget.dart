import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/stories/stories_widget.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'story_details_model.dart';
export 'story_details_model.dart';

class StoryDetailsWidget extends StatefulWidget {
  const StoryDetailsWidget({
    super.key,
    this.initialStoryIndex,
    this.bbb,
  });

  final int? initialStoryIndex;
  final DocumentReference? bbb;

  static String routeName = 'storyDetails';
  static String routePath = '/storyDetails';

  @override
  State<StoryDetailsWidget> createState() => _StoryDetailsWidgetState();
}

class _StoryDetailsWidgetState extends State<StoryDetailsWidget> {
  late StoryDetailsModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => StoryDetailsModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      var storyStatusRecordReference = StoryStatusRecord.collection.doc();
      await storyStatusRecordReference.set(createStoryStatusRecordData(
        storyRef: widget.bbb,
        status: 'seen',
        userRef: currentUserReference,
        createdAt: getCurrentTimestamp,
      ));
      _model.storyStatusRecord = StoryStatusRecord.getDocumentFromData(
          createStoryStatusRecordData(
            storyRef: widget.bbb,
            status: 'seen',
            userRef: currentUserReference,
            createdAt: getCurrentTimestamp,
          ),
          storyStatusRecordReference);

      await widget.bbb!.update({
        ...mapToFirestore(
          {
            'viewedBy': FieldValue.arrayUnion([currentUserReference]),
          },
        ),
      });
    });

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
      backgroundColor: Color(0xFF1A1F24),
      body: Row(
        mainAxisSize: MainAxisSize.max,
        children: [
          if (responsiveVisibility(
            context: context,
            phone: false,
            tablet: false,
            desktop: false,
          ))
            Container(
              width: 150.0,
              height: 100.0,
              decoration: BoxDecoration(),
            ),
          if (responsiveVisibility(
            context: context,
            phone: false,
            tablet: false,
            tabletLandscape: false,
            desktop: false,
          ))
            Container(
              width: 300.0,
              height: 100.0,
              decoration: BoxDecoration(),
            ),
          Expanded(
            child: Container(
              width: 100.0,
              height: double.infinity,
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).secondaryBackground,
              ),
              child: wrapWithModel(
                model: _model.storiesModel,
                updateCallback: () => safeSetState(() {}),
                child: StoriesWidget(
                  initialIndex: widget.initialStoryIndex,
                ),
              ),
            ),
          ),
          if (responsiveVisibility(
            context: context,
            phone: false,
            tablet: false,
            tabletLandscape: false,
            desktop: false,
          ))
            Container(
              width: 300.0,
              height: 100.0,
              decoration: BoxDecoration(),
            ),
          if (responsiveVisibility(
            context: context,
            phone: false,
            tablet: false,
            tabletLandscape: false,
            desktop: false,
          ))
            Container(
              width: 150.0,
              height: 100.0,
              decoration: BoxDecoration(),
            ),
        ],
      ),
    );
  }
}
