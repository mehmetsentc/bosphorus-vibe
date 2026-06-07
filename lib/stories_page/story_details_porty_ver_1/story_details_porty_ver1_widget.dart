import '/flutter_flow/flutter_flow_util.dart';
import '/user_compenents/stories/stories_widget.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'story_details_porty_ver1_model.dart';
export 'story_details_porty_ver1_model.dart';

class StoryDetailsPortyVer1Widget extends StatefulWidget {
  const StoryDetailsPortyVer1Widget({
    super.key,
    this.initialStoryIndex,
    required this.storyUser,
    required this.bbb,
  });

  final int? initialStoryIndex;
  final DocumentReference? storyUser;
  final DocumentReference? bbb;

  static String routeName = 'storyDetailsPorty_ver_1';
  static String routePath = '/UserStories';

  @override
  State<StoryDetailsPortyVer1Widget> createState() =>
      _StoryDetailsPortyVer1WidgetState();
}

class _StoryDetailsPortyVer1WidgetState
    extends State<StoryDetailsPortyVer1Widget> {
  late StoryDetailsPortyVer1Model _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => StoryDetailsPortyVer1Model());

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
            tabletLandscape: false,
          ))
            Container(
              width: 350.0,
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
                child: StoriesWidget(),
              ),
            ),
          ),
          if (responsiveVisibility(
            context: context,
            phone: false,
            tablet: false,
            tabletLandscape: false,
          ))
            Container(
              width: 350.0,
              height: 100.0,
              decoration: BoxDecoration(),
            ),
        ],
      ),
    );
  }
}
