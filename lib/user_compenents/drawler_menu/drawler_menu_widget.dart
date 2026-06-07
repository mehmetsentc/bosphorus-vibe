import '/event_page_component/event_menu_compinent/event_menu_compinent_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'drawler_menu_model.dart';
export 'drawler_menu_model.dart';

class DrawlerMenuWidget extends StatefulWidget {
  const DrawlerMenuWidget({super.key});

  static String routeName = 'DrawlerMenu';
  static String routePath = '/DrawerMenu';

  @override
  State<DrawlerMenuWidget> createState() => _DrawlerMenuWidgetState();
}

class _DrawlerMenuWidgetState extends State<DrawlerMenuWidget> {
  late DrawlerMenuModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DrawlerMenuModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      scaffoldKey.currentState!.openDrawer();
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
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        drawer: Drawer(
          elevation: 16.0,
          child: wrapWithModel(
            model: _model.eventMenuCompinentModel,
            updateCallback: () => safeSetState(() {}),
            child: EventMenuCompinentWidget(
              navSelected: 20,
            ),
          ),
        ),
        appBar: responsiveVisibility(
          context: context,
          tabletLandscape: false,
          desktop: false,
        )
            ? AppBar(
                backgroundColor: FlutterFlowTheme.of(context).primary,
                automaticallyImplyLeading: false,
                leading: FlutterFlowIconButton(
                  borderColor: Colors.transparent,
                  borderRadius: 30.0,
                  borderWidth: 1.0,
                  buttonSize: 60.0,
                  icon: Icon(
                    Icons.arrow_back_rounded,
                    color: Colors.white,
                    size: 30.0,
                  ),
                  onPressed: () async {
                    context.pop();
                  },
                ),
                actions: [],
                centerTitle: false,
                elevation: 2.0,
              )
            : null,
        body: SafeArea(
          top: true,
          child: Visibility(
            visible: responsiveVisibility(
              context: context,
              tabletLandscape: false,
              desktop: false,
            ),
            child: Opacity(
              opacity: 0.1,
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
