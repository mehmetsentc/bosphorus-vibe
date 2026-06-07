import '/flutter_flow/flutter_flow_util.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'event_cart_componennt2_model.dart';
export 'event_cart_componennt2_model.dart';

/// {
///   "name": "EventListComponent",
///   "description": "A scrollable event list component to display upcoming
/// kids club events with image, time, and location info.",
///   "widgets": [
///     {
///       "type": "ListView",
///       "scrollDirection": "vertical",
///       "padding": "16,16,16,16",
///       "children": [
///         {
///           "type": "Container",
///           "borderRadius": 12,
///           "elevation": 4,
///           "padding": "12",
///           "margin": "0,0,0,16",
///           "color": "#ffffff",
///           "child": {
///             "type": "Column",
///             "children": [
///               {
///                 "type": "Image",
///                 "imagePath": "{eventImage}",
///                 "height": 180,
///                 "borderRadius": 8,
///                 "fit": "cover"
///               },
///               {
///                 "type": "Text",
///                 "value": "{eventName}",
///                 "style": "titleMedium",
///                 "padding": "0,8,0,4"
///               },
///               {
///                 "type": "Row",
///                 "mainAxisAlignment": "start",
///                 "children": [
///                   {
///                     "type": "Icon",
///                     "icon": "schedule",
///                     "size": 18
///                   },
///                   {
///                     "type": "Text",
///                     "value": "{eventTime}",
///                     "style": "bodyMedium",
///                     "padding": "4,0,12,0"
///                   },
///                   {
///                     "type": "Icon",
///                     "icon": "calendar_today",
///                     "size": 18
///                   },
///                   {
///                     "type": "Text",
///                     "value": "{eventDate}",
///                     "style": "bodyMedium",
///                     "padding": "4,0,12,0"
///                   },
///                   {
///                     "type": "Icon",
///                     "icon": "place",
///                     "size": 18
///                   },
///                   {
///                     "type": "Text",
///                     "value": "{eventLocation}",
///                     "style": "bodyMedium",
///                     "padding": "4,0,0,0"
///                   }
///                 ]
///               }
///             ]
///           }
///         }
///       ]
///     }
///   ],
///   "parameters": [
///     { "name": "eventImage", "type": "String" },
///     { "name": "eventName", "type": "String" },
///     { "name": "eventDate", "type": "String" },
///     { "name": "eventTime", "type": "String" },
///     { "name": "eventLocation", "type": "String" }
///   ]
/// }
///
class EventCartComponennt2Widget extends StatefulWidget {
  const EventCartComponennt2Widget({super.key});

  @override
  State<EventCartComponennt2Widget> createState() =>
      _EventCartComponennt2WidgetState();
}

class _EventCartComponennt2WidgetState
    extends State<EventCartComponennt2Widget> {
  late EventCartComponennt2Model _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => EventCartComponennt2Model());

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
      decoration: BoxDecoration(
        color: Colors.transparent,
      ),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(16.0, 16.0, 16.0, 16.0),
              child: ListView(
                padding: EdgeInsets.zero,
                primary: false,
                shrinkWrap: true,
                scrollDirection: Axis.vertical,
                children: [
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(12.0, 12.0, 12.0, 12.0),
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: FlutterFlowTheme.of(context).secondaryBackground,
                        boxShadow: [
                          BoxShadow(
                            blurRadius: 4.0,
                            color: Color(0x33000000),
                            offset: Offset(
                              0.0,
                              2.0,
                            ),
                            spreadRadius: 0.0,
                          )
                        ],
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8.0),
                              child: Image.network(
                                '',
                                width: double.infinity,
                                height: 180.0,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Text(
                              'Summer Art Camp for Kids',
                              style: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .override(
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
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.schedule,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  size: 18.0,
                                ),
                                Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      12.0, 0.0, 12.0, 0.0),
                                  child: Text(
                                    '10:00 AM - 2:00 PM',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                                Icon(
                                  Icons.calendar_today,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  size: 18.0,
                                ),
                                Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      12.0, 0.0, 12.0, 0.0),
                                  child: Text(
                                    'July 15, 2023',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                                Icon(
                                  Icons.place,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  size: 18.0,
                                ),
                                Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      4.0, 0.0, 4.0, 0.0),
                                  child: Text(
                                    'Central Park',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.figtree(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                              ].divide(SizedBox(width: 4.0)),
                            ),
                          ].divide(SizedBox(height: 8.0)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
