import '/flutter_flow/flutter_flow_util.dart';
import 'package:story_viewer_x4zfdq/custom_code/widgets/index.dart'
    as story_viewer_x4zfdq_custom_widgets;
import 'package:flutter/material.dart';
import 'story_component_model.dart';
export 'story_component_model.dart';

class StoryComponentWidget extends StatefulWidget {
  const StoryComponentWidget({super.key});

  @override
  State<StoryComponentWidget> createState() => _StoryComponentWidgetState();
}

class _StoryComponentWidgetState extends State<StoryComponentWidget> {
  late StoryComponentModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => StoryComponentModel());

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
      width: double.infinity,
      height: double.infinity,
      child: story_viewer_x4zfdq_custom_widgets.ViewStory(
        width: double.infinity,
        height: double.infinity,
      ),
    );
  }
}
