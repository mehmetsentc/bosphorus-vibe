import 'package:provider/provider.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'auth/firebase_auth/firebase_user_provider.dart';
import 'auth/firebase_auth/auth_util.dart';

import 'backend/firebase/firebase_config.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'flutter_flow/flutter_flow_util.dart';
import 'flutter_flow/internationalization.dart';
import 'package:schedule_local_notifications_library_xpd9ia/flutter_flow/internationalization.dart'
    as schedule_local_notifications_library_xpd9ia_internationalization;
import 'index.dart';

import 'package:community_testing_ryusdv/app_state.dart'
    as community_testing_ryusdv_app_state;
import 'package:f_f_story_view_live_zhm3f3/app_state.dart'
    as f_f_story_view_live_zhm3f3_app_state;
import 'package:schedule_local_notifications_library_xpd9ia/app_state.dart'
    as schedule_local_notifications_library_xpd9ia_app_state;

import 'package:build_ship_1r9r3f/library_values.dart'
    as build_ship_1r9r3f_library_values;
import 'package:build_ship_1r9r3f/backend/schema/enums/enums.dart'
    as build_ship_1r9r3f_enums;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  GoRouter.optionURLReflectsImperativeAPIs = true;
  usePathUrlStrategy();

  build_ship_1r9r3f_library_values.FFLibraryValues().Authentication =
      build_ship_1r9r3f_enums.AuthOption.Firebase;
  build_ship_1r9r3f_library_values.FFLibraryValues().BuildShipConfiguration =
      '{   \"url\": \"https://46p4xn.buildship.run/chat-with-firebase-new\",   \"method\": \"POST\",   \"headers\": {     \"Content-Type\": \"application/json\"   },   \"body\": {     \"message\": \"Can you tell me today\'s daily activities at Porty Club?\",     \"threadId\": \"portyclub_daily_activities\"   } }';
  await initFirebase();

  await FlutterFlowTheme.initialize();

  final appState = FFAppState(); // Initialize FFAppState
  await appState.initializePersistedState();

  final community_testing_ryusdvAppState =
      community_testing_ryusdv_app_state.FFAppState();
  await community_testing_ryusdvAppState.initializePersistedState();

  final f_f_story_view_live_zhm3f3AppState =
      f_f_story_view_live_zhm3f3_app_state.FFAppState();
  await f_f_story_view_live_zhm3f3AppState.initializePersistedState();

  final schedule_local_notifications_library_xpd9iaAppState =
      schedule_local_notifications_library_xpd9ia_app_state.FFAppState();
  await schedule_local_notifications_library_xpd9iaAppState
      .initializePersistedState();

  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(
        create: (context) => appState,
      ),
      ChangeNotifierProvider(
        create: (context) => community_testing_ryusdvAppState,
      ),
      ChangeNotifierProvider(
        create: (context) => f_f_story_view_live_zhm3f3AppState,
      ),
      ChangeNotifierProvider(
        create: (context) =>
            schedule_local_notifications_library_xpd9iaAppState,
      ),
    ],
    child: MyApp(),
  ));
}

class MyApp extends StatefulWidget {
  // This widget is the root of your application.
  @override
  State<MyApp> createState() => _MyAppState();

  static _MyAppState of(BuildContext context) =>
      context.findAncestorStateOfType<_MyAppState>()!;
}

class MyAppScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.trackpad,
      };
}

class _MyAppState extends State<MyApp> {
  Locale? _locale;

  ThemeMode _themeMode = FlutterFlowTheme.themeMode;

  late AppStateNotifier _appStateNotifier;
  late GoRouter _router;
  String getRoute([RouteMatch? routeMatch]) {
    final RouteMatch lastMatch =
        routeMatch ?? _router.routerDelegate.currentConfiguration.last;
    final RouteMatchList matchList = lastMatch is ImperativeRouteMatch
        ? lastMatch.matches
        : _router.routerDelegate.currentConfiguration;
    return matchList.uri.path;
  }

  List<String> getRouteStack() =>
      _router.routerDelegate.currentConfiguration.matches
          .map((e) => getRoute(e))
          .toList();
  late Stream<BaseAuthUser> userStream;

  final authUserSub = authenticatedUserStream.listen((_) {});

  @override
  void initState() {
    super.initState();

    _appStateNotifier = AppStateNotifier.instance;
    _router = createRouter(_appStateNotifier);
    userStream = bosphorusVibeFirebaseUserStream()
      ..listen((user) {
        _appStateNotifier.update(user);
      });
    jwtTokenStream.listen((_) {});
    Future.delayed(
      Duration(milliseconds: 1000),
      () => _appStateNotifier.stopShowingSplashImage(),
    );
  }

  @override
  void dispose() {
    authUserSub.cancel();

    super.dispose();
  }

  void setLocale(String language) {
    safeSetState(() => _locale = createLocale(language));
  }

  void setThemeMode(ThemeMode mode) => safeSetState(() {
        _themeMode = mode;
        FlutterFlowTheme.saveThemeMode(mode);
      });

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Bosphorus Vibe',
      scrollBehavior: MyAppScrollBehavior(),
      localizationsDelegates: [
        FFLocalizationsDelegate(),
        schedule_local_notifications_library_xpd9ia_internationalization
            .FFLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        FallbackMaterialLocalizationDelegate(),
        FallbackCupertinoLocalizationDelegate(),
      ],
      locale: _locale,
      supportedLocales: const [
        Locale('en'),
      ],
      theme: ThemeData(
        brightness: Brightness.light,
        scrollbarTheme: ScrollbarThemeData(
          interactive: false,
          thumbColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.dragged)) {
              return Color(4294967295);
            }
            if (states.contains(WidgetState.hovered)) {
              return Color(4294967295);
            }
            return Color(4294967295);
          }),
        ),
        useMaterial3: false,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scrollbarTheme: ScrollbarThemeData(
          interactive: false,
          thumbColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.dragged)) {
              return Color(4294967295);
            }
            if (states.contains(WidgetState.hovered)) {
              return Color(4294967295);
            }
            return Color(4294967295);
          }),
        ),
        useMaterial3: false,
      ),
      themeMode: _themeMode,
      routerConfig: _router,
    );
  }
}

class NavBarPage extends StatefulWidget {
  NavBarPage({
    Key? key,
    this.initialPage,
    this.page,
    this.disableResizeToAvoidBottomInset = false,
  }) : super(key: key);

  final String? initialPage;
  final Widget? page;
  final bool disableResizeToAvoidBottomInset;

  @override
  _NavBarPageState createState() => _NavBarPageState();
}

/// This is the private State class that goes with NavBarPage.
class _NavBarPageState extends State<NavBarPage> {
  String _currentPageName = 'event_App_Porty_Main_Page_1';
  late Widget? _currentPage;

  @override
  void initState() {
    super.initState();
    _currentPageName = widget.initialPage ?? _currentPageName;
    _currentPage = widget.page;
  }

  @override
  Widget build(BuildContext context) {
    final tabs = {
      'responsible_post_feed': ResponsiblePostFeedWidget(),
      'event_App_Porty_Main_Page_1': EventAppPortyMainPage1Widget(),
      'responsible_Reels_CloneCopy': ResponsibleReelsCloneCopyWidget(),
      'Main_User_Profil': MainUserProfilWidget(),
    };
    final currentIndex = tabs.keys.toList().indexOf(_currentPageName);

    return Scaffold(
      resizeToAvoidBottomInset: !widget.disableResizeToAvoidBottomInset,
      body: _currentPage ?? tabs[_currentPageName],
      bottomNavigationBar: Visibility(
        visible: responsiveVisibility(
          context: context,
          tabletLandscape: false,
          desktop: false,
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (i) => safeSetState(() {
            _currentPage = null;
            _currentPageName = tabs.keys.toList()[i];
          }),
          backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
          selectedItemColor: FlutterFlowTheme.of(context).primary,
          unselectedItemColor: FlutterFlowTheme.of(context).secondaryText,
          showSelectedLabels: true,
          showUnselectedLabels: false,
          type: BottomNavigationBarType.fixed,
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: Icon(
                Icons.rss_feed,
                size: 32.0,
              ),
              label: '',
              tooltip: '',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                Icons.date_range,
                size: 26.0,
              ),
              label: '',
              tooltip: '',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                Icons.smart_display,
                size: 24.0,
              ),
              activeIcon: Icon(
                Icons.smart_display,
                size: 32.0,
              ),
              label: 'Play',
              tooltip: '',
            ),
            BottomNavigationBarItem(
              icon: Icon(
                Icons.person,
              ),
              label: '',
              tooltip: '',
            )
          ],
        ),
      ),
    );
  }
}
