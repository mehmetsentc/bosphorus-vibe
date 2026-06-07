import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/components/create_account_widget.dart';
import '/components/side_nav_new_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'porty_club_members_model.dart';
export 'porty_club_members_model.dart';

/// {
///   "page": {
///     "name": "TeamGuestDirectoryPage",
///     "description": "Displays Porty Club animators and hotel guests in two
/// separate horizontal lists.",
///     "layout": {
///       "type": "scrollableColumn",
///       "padding": "16",
///       "backgroundColor": "#121212"
///     },
///     "components": [
///       {
///         "type": "text",
///         "text": "🎭 Porty Club Animators",
///         "style": {
///           "fontSize": 22,
///           "fontWeight": "bold",
///           "color": "#ffffff"
///         }
///       },
///       {
///         "type": "firestoreQuery",
///         "collection": "users",
///         "filters": [
///           {
///             "field": "role",
///             "operator": "==",
///             "value": "animator"
///           }
///         ],
///         "builder": {
///           "type": "horizontalList",
///           "itemBuilder": {
///             "type": "card",
///             "width": 140,
///             "cornerRadius": 12,
///             "elevation": 3,
///             "content": [
///               {
///                 "type": "image",
///                 "url": "{{item.photoUrl}}",
///                 "height": 120,
///                 "fit": "cover",
///                 "cornerRadius": 8
///               },
///               {
///                 "type": "text",
///                 "text": "{{item.display_name}}",
///                 "style": {
///                   "fontSize": 14,
///                   "color": "#ffffff",
///                   "fontWeight": "semiBold"
///                 }
///               },
///               {
///                 "type": "text",
///                 "text": "{{item.team}}",
///                 "style": {
///                   "fontSize": 12,
///                   "color": "#ffaa00"
///                 }
///               }
///             ],
///             "onTap": {
///               "action": "navigate",
///               "target": "UserProfileDetailPage",
///               "parameters": {
///                 "userDoc": "{{item.reference}}"
///               }
///             }
///           }
///         }
///       },
///       {
///         "type": "text",
///         "text": "🧍 Hotel Guests",
///         "style": {
///           "fontSize": 22,
///           "fontWeight": "bold",
///           "color": "#ffffff",
///           "marginTop": 24
///         }
///       },
///       {
///         "type": "firestoreQuery",
///         "collection": "users",
///         "filters": [
///           {
///             "field": "role",
///             "operator": "==",
///             "value": "guest"
///           }
///         ],
///         "builder": {
///           "type": "horizontalList",
///           "itemBuilder": {
///             "type": "card",
///             "width": 140,
///             "cornerRadius": 12,
///             "elevation": 3,
///             "content": [
///               {
///                 "type": "image",
///                 "url": "{{item.photoUrl}}",
///                 "height": 120,
///                 "fit": "cover",
///                 "cornerRadius": 8
///               },
///               {
///                 "type": "text",
///                 "text": "{{item.display_name}}",
///                 "style": {
///                   "fontSize": 14,
///                   "color": "#ffffff",
///                   "fontWeight": "semiBold"
///                 }
///               },
///               {
///                 "type": "text",
///                 "text": "Room: {{item.room_number}}",
///                 "style": {
///                   "fontSize": 12,
///                   "color": "#cccccc"
///                 }
///               }
///             ],
///             "onTap": {
///               "action": "navigate",
///               "target": "GuestProfilePage",
///               "parameters": {
///                 "userDoc": "{{item.reference}}"
///               }
///             }
///           }
///         }
///       }
///     ]
///   }
/// }
///
class PortyClubMembersWidget extends StatefulWidget {
  const PortyClubMembersWidget({super.key});

  static String routeName = 'Porty_Club_Members';
  static String routePath = '/portyClubMembers';

  @override
  State<PortyClubMembersWidget> createState() => _PortyClubMembersWidgetState();
}

class _PortyClubMembersWidgetState extends State<PortyClubMembersWidget>
    with TickerProviderStateMixin {
  late PortyClubMembersModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PortyClubMembersModel());

    _model.teammembersController = TabController(
      vsync: this,
      length: 1,
      initialIndex: 0,
    )..addListener(() => safeSetState(() {}));

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
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
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
                  buttonSize: 70.0,
                  icon: Icon(
                    Icons.chevron_left,
                    color: FlutterFlowTheme.of(context).primaryText,
                    size: 40.0,
                  ),
                  onPressed: () async {
                    if (currentUserReference != null) {
                      context.pushNamed(EventAppPortyMainPage1Widget.routeName);
                    } else {
                      context.pushNamed(EventAppPortyMainPage1Widget.routeName);
                    }
                  },
                ),
                title: InkWell(
                  splashColor: Colors.transparent,
                  focusColor: Colors.transparent,
                  hoverColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  onTap: () async {
                    if (currentUserReference != null) {
                      context.pushNamed(EventAppPortyMainPage1Widget.routeName);
                    } else {
                      context.pushNamed(
                          EventAppPortyMainPage1UnregisterWidget.routeName);
                    }
                  },
                  child: Text(
                    'Event Page',
                    style: FlutterFlowTheme.of(context).headlineMedium.override(
                          font: GoogleFonts.outfit(
                            fontWeight: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).primaryText,
                          fontSize: 22.0,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .headlineMedium
                              .fontWeight,
                          fontStyle: FlutterFlowTheme.of(context)
                              .headlineMedium
                              .fontStyle,
                        ),
                  ),
                ),
                actions: [],
                centerTitle: false,
                elevation: 2.0,
              )
            : null,
        body: SafeArea(
          top: true,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              if (responsiveVisibility(
                context: context,
                phone: false,
                tablet: false,
              ))
                wrapWithModel(
                  model: _model.sideNavNewModel,
                  updateCallback: () => safeSetState(() {}),
                  child: SideNavNewWidget(),
                ),
              Expanded(
                child: Column(
                  children: [
                    Align(
                      alignment: Alignment(0.0, 0),
                      child: TabBar(
                        labelColor: FlutterFlowTheme.of(context).primary,
                        unselectedLabelColor:
                            FlutterFlowTheme.of(context).secondaryText,
                        labelStyle:
                            FlutterFlowTheme.of(context).titleMedium.override(
                                  font: GoogleFonts.figtree(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontStyle,
                                ),
                        unselectedLabelStyle:
                            FlutterFlowTheme.of(context).titleMedium.override(
                                  font: GoogleFonts.figtree(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontStyle,
                                ),
                        indicatorColor: FlutterFlowTheme.of(context).primary,
                        tabs: [
                          Tab(
                            text: 'Team Members',
                            iconMargin: EdgeInsetsDirectional.fromSTEB(
                                12.0, 0.0, 12.0, 0.0),
                          ),
                        ],
                        controller: _model.teammembersController,
                        onTap: (i) async {
                          [() async {}][i]();
                        },
                      ),
                    ),
                    Expanded(
                      child: TabBarView(
                        controller: _model.teammembersController,
                        children: [
                          SingleChildScrollView(
                            child: Column(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                StreamBuilder<List<UsersRecord>>(
                                  stream: queryUsersRecord(
                                    queryBuilder: (usersRecord) =>
                                        usersRecord.where(
                                      'role',
                                      isEqualTo: 'Porty Club Animation Team',
                                    ),
                                  ),
                                  builder: (context, snapshot) {
                                    // Customize what your widget looks like when it's loading.
                                    if (!snapshot.hasData) {
                                      return Center(
                                        child: SizedBox(
                                          width: 10.0,
                                          height: 10.0,
                                          child: SpinKitDoubleBounce(
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                            size: 10.0,
                                          ),
                                        ),
                                      );
                                    }
                                    List<UsersRecord> listViewUsersRecordList =
                                        snapshot.data!;

                                    return ListView.builder(
                                      padding: EdgeInsets.zero,
                                      primary: false,
                                      shrinkWrap: true,
                                      scrollDirection: Axis.vertical,
                                      itemCount: listViewUsersRecordList.length,
                                      itemBuilder: (context, listViewIndex) {
                                        final listViewUsersRecord =
                                            listViewUsersRecordList[
                                                listViewIndex];
                                        return Column(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            Expanded(
                                              child: Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        0.0, 12.0, 0.0, 0.0),
                                                child: InkWell(
                                                  splashColor:
                                                      Colors.transparent,
                                                  focusColor:
                                                      Colors.transparent,
                                                  hoverColor:
                                                      Colors.transparent,
                                                  highlightColor:
                                                      Colors.transparent,
                                                  onTap: () async {
                                                    if (currentUserReference !=
                                                        null) {
                                                      context.pushNamed(
                                                        ViewPageOtherUsherWidget
                                                            .routeName,
                                                        queryParameters: {
                                                          'userDetails':
                                                              serializeParam(
                                                            listViewUsersRecord,
                                                            ParamType.Document,
                                                          ),
                                                          'showPage':
                                                              serializeParam(
                                                            false,
                                                            ParamType.bool,
                                                          ),
                                                          'pageTitle':
                                                              serializeParam(
                                                            'Home',
                                                            ParamType.String,
                                                          ),
                                                        }.withoutNulls,
                                                        extra: <String,
                                                            dynamic>{
                                                          'userDetails':
                                                              listViewUsersRecord,
                                                        },
                                                      );
                                                    } else {
                                                      await showModalBottomSheet(
                                                        isScrollControlled:
                                                            true,
                                                        backgroundColor:
                                                            Colors.transparent,
                                                        enableDrag: false,
                                                        context: context,
                                                        builder: (context) {
                                                          return GestureDetector(
                                                            onTap: () {
                                                              FocusScope.of(
                                                                      context)
                                                                  .unfocus();
                                                              FocusManager
                                                                  .instance
                                                                  .primaryFocus
                                                                  ?.unfocus();
                                                            },
                                                            child: Padding(
                                                              padding: MediaQuery
                                                                  .viewInsetsOf(
                                                                      context),
                                                              child:
                                                                  CreateAccountWidget(),
                                                            ),
                                                          );
                                                        },
                                                      ).then((value) =>
                                                          safeSetState(() {}));
                                                    }
                                                  },
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    children: [
                                                      Align(
                                                        alignment:
                                                            AlignmentDirectional(
                                                                -1.0, 0.0),
                                                        child: Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      12.0,
                                                                      0.0,
                                                                      0.0,
                                                                      0.0),
                                                          child: Container(
                                                            width: 60.0,
                                                            height: 60.0,
                                                            clipBehavior:
                                                                Clip.antiAlias,
                                                            decoration:
                                                                BoxDecoration(
                                                              shape: BoxShape
                                                                  .circle,
                                                            ),
                                                            child:
                                                                Image.network(
                                                              listViewUsersRecord
                                                                  .photoUrl,
                                                              fit: BoxFit.cover,
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    12.0,
                                                                    0.0,
                                                                    0.0,
                                                                    0.0),
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          0.0,
                                                                          3.0),
                                                              child: Text(
                                                                listViewUsersRecord
                                                                    .displayName,
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .figtree(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                            ),
                                                            Text(
                                                              listViewUsersRecord
                                                                  .role,
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .bodyMedium
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .figtree(
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ],
                                                  ),
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
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
