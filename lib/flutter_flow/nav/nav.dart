import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '/backend/backend.dart';

import '/auth/base_auth_user_provider.dart';

import '/main.dart';
import '/flutter_flow/flutter_flow_util.dart';

import '/index.dart';
import 'package:marketplace_open_a_i_a_p_i_action_library_09b0f4/index.dart'
    as $marketplace_open_a_i_a_p_i_action_library_09b0f4;
import 'package:community_testing_ryusdv/index.dart'
    as $community_testing_ryusdv;
import 'package:multi_select_dropdown_library_j42ie8/index.dart'
    as $multi_select_dropdown_library_j42ie8;
import 'package:f_f_story_view_live_zhm3f3/index.dart'
    as $f_f_story_view_live_zhm3f3;
import 'package:story_viewer_x4zfdq/index.dart' as $story_viewer_x4zfdq;
import 'package:photo_editor_library_wy8jmz/index.dart'
    as $photo_editor_library_wy8jmz;
import 'package:build_ship_1r9r3f/index.dart' as $build_ship_1r9r3f;
import 'package:schedule_local_notifications_library_xpd9ia/index.dart'
    as $schedule_local_notifications_library_xpd9ia;
import 'package:custom_video_player_library_tmr7du/index.dart'
    as $custom_video_player_library_tmr7du;

export 'package:go_router/go_router.dart';
export 'serialization_util.dart';

const kTransitionInfoKey = '__transition_info__';

GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

class AppStateNotifier extends ChangeNotifier {
  AppStateNotifier._();

  static AppStateNotifier? _instance;
  static AppStateNotifier get instance => _instance ??= AppStateNotifier._();

  BaseAuthUser? initialUser;
  BaseAuthUser? user;
  bool showSplashImage = true;
  String? _redirectLocation;

  /// Determines whether the app will refresh and build again when a sign
  /// in or sign out happens. This is useful when the app is launched or
  /// on an unexpected logout. However, this must be turned off when we
  /// intend to sign in/out and then navigate or perform any actions after.
  /// Otherwise, this will trigger a refresh and interrupt the action(s).
  bool notifyOnAuthChange = true;

  bool get loading => user == null || showSplashImage;
  bool get loggedIn => user?.loggedIn ?? false;
  bool get initiallyLoggedIn => initialUser?.loggedIn ?? false;
  bool get shouldRedirect => loggedIn && _redirectLocation != null;

  String getRedirectLocation() => _redirectLocation!;
  bool hasRedirect() => _redirectLocation != null;
  void setRedirectLocationIfUnset(String loc) => _redirectLocation ??= loc;
  void clearRedirectLocation() => _redirectLocation = null;

  /// Mark as not needing to notify on a sign in / out when we intend
  /// to perform subsequent actions (such as navigation) afterwards.
  void updateNotifyOnAuthChange(bool notify) => notifyOnAuthChange = notify;

  void update(BaseAuthUser newUser) {
    final shouldUpdate =
        user?.uid == null || newUser.uid == null || user?.uid != newUser.uid;
    initialUser ??= newUser;
    user = newUser;
    // Refresh the app on auth change unless explicitly marked otherwise.
    // No need to update unless the user has changed.
    if (notifyOnAuthChange && shouldUpdate) {
      notifyListeners();
    }
    // Once again mark the notifier as needing to update on auth change
    // (in order to catch sign in / out events).
    updateNotifyOnAuthChange(true);
  }

  void stopShowingSplashImage() {
    showSplashImage = false;
    notifyListeners();
  }
}

GoRouter createRouter(AppStateNotifier appStateNotifier) {
  $marketplace_open_a_i_a_p_i_action_library_09b0f4.initializeRoutes(
    homePageWidgetName:
        'marketplace_open_a_i_a_p_i_action_library_09b0f4.HomePage',
    homePageWidgetPath: '/marketplace-homePage',
  );

  $community_testing_ryusdv.initializeRoutes(
    notificationsWidgetName: 'community_testing_ryusdv.notifications',
    notificationsWidgetPath: '/notifications',
  );

  $multi_select_dropdown_library_j42ie8.initializeRoutes(
    homePageWidgetName: 'multi_select_dropdown_library_j42ie8.HomePage',
    homePageWidgetPath: '/multi-select-homePage',
  );

  $f_f_story_view_live_zhm3f3.initializeRoutes(
    storyViewWidgetWidgetName: 'f_f_story_view_live_zhm3f3.StoryViewWidget',
    storyViewWidgetWidgetPath: '/storyViewWidget',
    fullPageStoryWidgetName: 'f_f_story_view_live_zhm3f3.FullPageStory',
    fullPageStoryWidgetPath: '/fullPageStory',
  );

  $story_viewer_x4zfdq.initializeRoutes(
    homePageWidgetName: 'story_viewer_x4zfdq.HomePage',
    homePageWidgetPath: '/story-viewer-home',
  );

  $photo_editor_library_wy8jmz.initializeRoutes(
    homePageWidgetName: 'photo_editor_library_wy8jmz.HomePage',
    homePageWidgetPath: '/photo-editor-homePage',
  );

  $build_ship_1r9r3f.initializeRoutes(
    demoWidgetName: 'build_ship_1r9r3f.Demo',
    demoWidgetPath: '/trigger-homePage',
  );

  $schedule_local_notifications_library_xpd9ia.initializeRoutes(
    scheduleNotificationsWidgetName:
        'schedule_local_notifications_library_xpd9ia.scheduleNotifications',
    scheduleNotificationsWidgetPath: '/scheduleNotifications',
  );

  $custom_video_player_library_tmr7du.initializeRoutes(
    homePageWidgetName: 'custom_video_player_library_tmr7du.HomePage',
    homePageWidgetPath: '/homePage',
  );

  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    refreshListenable: appStateNotifier,
    navigatorKey: appNavigatorKey,
    errorBuilder: (context, state) =>
        appStateNotifier.loggedIn ? NavBarPage() : LoginCreateAcountWidget(),
    routes: [
      FFRoute(
        name: '_initialize',
        path: '/',
        builder: (context, _) => appStateNotifier.loggedIn
            ? NavBarPage()
            : LoginCreateAcountWidget(),
      ),
      FFRoute(
        name: CreateYourProfileWidget.routeName,
        path: CreateYourProfileWidget.routePath,
        builder: (context, params) => CreateYourProfileWidget(),
      ),
      FFRoute(
        name: ForgotPasswordWidget.routeName,
        path: ForgotPasswordWidget.routePath,
        builder: (context, params) => ForgotPasswordWidget(),
      ),
      FFRoute(
        name: CreateStoryWidget.routeName,
        path: CreateStoryWidget.routePath,
        builder: (context, params) => CreateStoryWidget(
          ssss: params.getParam(
            'ssss',
            ParamType.String,
          ),
        ),
      ),
      FFRoute(
        name: PostDetailsPageWidget.routeName,
        path: PostDetailsPageWidget.routePath,
        asyncParams: {
          'postReference': getDoc(['userPosts'], UserPostsRecord.fromSnapshot),
          'userRecord': getDoc(['users'], UsersRecord.fromSnapshot),
        },
        builder: (context, params) => PostDetailsPageWidget(
          postReference: params.getParam(
            'postReference',
            ParamType.Document,
          ),
          userRecord: params.getParam(
            'userRecord',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: StoryDetailsWidget.routeName,
        path: StoryDetailsWidget.routePath,
        builder: (context, params) => StoryDetailsWidget(
          initialStoryIndex: params.getParam(
            'initialStoryIndex',
            ParamType.int,
          ),
          bbb: params.getParam(
            'bbb',
            ParamType.DocumentReference,
            isList: false,
            collectionNamePath: ['userStories'],
          ),
        ),
      ),
      FFRoute(
        name: EditSettingsWidget.routeName,
        path: EditSettingsWidget.routePath,
        builder: (context, params) => EditSettingsWidget(),
      ),
      FFRoute(
        name: EditUserProfileWidget.routeName,
        path: EditUserProfileWidget.routePath,
        builder: (context, params) => EditUserProfileWidget(),
      ),
      FFRoute(
        name: ChangePasswordWidget.routeName,
        path: ChangePasswordWidget.routePath,
        builder: (context, params) => ChangePasswordWidget(),
      ),
      FFRoute(
        name: ViewProfilePageOtherWidget.routeName,
        path: ViewProfilePageOtherWidget.routePath,
        asyncParams: {
          'userDetails': getDoc(['users'], UsersRecord.fromSnapshot),
          'chatRef': getDoc(['chats'], ChatsRecord.fromSnapshot),
        },
        builder: (context, params) => ViewProfilePageOtherWidget(
          userDetails: params.getParam(
            'userDetails',
            ParamType.Document,
          ),
          showPage: params.getParam(
            'showPage',
            ParamType.bool,
          ),
          pageTitle: params.getParam(
            'pageTitle',
            ParamType.String,
          ),
          chatRef: params.getParam(
            'chatRef',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: Chat2DetailsWidget.routeName,
        path: Chat2DetailsWidget.routePath,
        asyncParams: {
          'chatRef': getDoc(['chats'], ChatsRecord.fromSnapshot),
        },
        builder: (context, params) => Chat2DetailsWidget(
          chatRef: params.getParam(
            'chatRef',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: MainChatWidget.routeName,
        path: MainChatWidget.routePath,
        builder: (context, params) => MainChatWidget(),
      ),
      FFRoute(
        name: Chat2InviteUsersWidget.routeName,
        path: Chat2InviteUsersWidget.routePath,
        asyncParams: {
          'chatRef': getDoc(['chats'], ChatsRecord.fromSnapshot),
        },
        builder: (context, params) => Chat2InviteUsersWidget(
          chatRef: params.getParam(
            'chatRef',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: ImageDetailsWidget.routeName,
        path: ImageDetailsWidget.routePath,
        asyncParams: {
          'chatMessage':
              getDoc(['chat_messages'], ChatMessagesRecord.fromSnapshot),
        },
        builder: (context, params) => ImageDetailsWidget(
          chatMessage: params.getParam(
            'chatMessage',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: DrawlerMenuWidget.routeName,
        path: DrawlerMenuWidget.routePath,
        builder: (context, params) => DrawlerMenuWidget(),
      ),
      FFRoute(
        name: PostLikePageWidget.routeName,
        path: PostLikePageWidget.routePath,
        asyncParams: {
          'dddd': getDoc(['userPosts'], UserPostsRecord.fromSnapshot),
        },
        builder: (context, params) => PostLikePageWidget(
          dddd: params.getParam(
            'dddd',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: ChatAiScreenWidget.routeName,
        path: ChatAiScreenWidget.routePath,
        builder: (context, params) => ChatAiScreenWidget(),
      ),
      FFRoute(
        name: CreateFeedVideoWidget.routeName,
        path: CreateFeedVideoWidget.routePath,
        builder: (context, params) => CreateFeedVideoWidget(
          ssss: params.getParam(
            'ssss',
            ParamType.String,
          ),
        ),
      ),
      FFRoute(
        name: StoryDetailsPortyVer1Widget.routeName,
        path: StoryDetailsPortyVer1Widget.routePath,
        builder: (context, params) => StoryDetailsPortyVer1Widget(
          initialStoryIndex: params.getParam(
            'initialStoryIndex',
            ParamType.int,
          ),
          storyUser: params.getParam(
            'storyUser',
            ParamType.DocumentReference,
            isList: false,
            collectionNamePath: ['users'],
          ),
          bbb: params.getParam(
            'bbb',
            ParamType.DocumentReference,
            isList: false,
            collectionNamePath: ['userStories'],
          ),
        ),
      ),
      FFRoute(
        name: FolllowerPageWidget.routeName,
        path: FolllowerPageWidget.routePath,
        builder: (context, params) => FolllowerPageWidget(),
      ),
      FFRoute(
        name: FollowingPageWidget.routeName,
        path: FollowingPageWidget.routePath,
        builder: (context, params) => FollowingPageWidget(),
      ),
      FFRoute(
        name: UploadPostPageViewWidget.routeName,
        path: UploadPostPageViewWidget.routePath,
        builder: (context, params) => UploadPostPageViewWidget(),
      ),
      FFRoute(
        name: MainUserProfilWidget.routeName,
        path: MainUserProfilWidget.routePath,
        builder: (context, params) => params.isEmpty
            ? NavBarPage(initialPage: 'Main_User_Profil')
            : MainUserProfilWidget(
                userRef: params.getParam(
                  'userRef',
                  ParamType.DocumentReference,
                  isList: false,
                  collectionNamePath: ['users'],
                ),
              ),
      ),
      FFRoute(
        name: PagewievPostFeedUserWidget.routeName,
        path: PagewievPostFeedUserWidget.routePath,
        builder: (context, params) => PagewievPostFeedUserWidget(
          userRef: params.getParam(
            'userRef',
            ParamType.DocumentReference,
            isList: false,
            collectionNamePath: ['userPosts'],
          ),
          selectedIndex: params.getParam(
            'selectedIndex',
            ParamType.int,
          ),
        ),
      ),
      FFRoute(
        name: UploadMediaOnboardingWidget.routeName,
        path: UploadMediaOnboardingWidget.routePath,
        builder: (context, params) => UploadMediaOnboardingWidget(),
      ),
      FFRoute(
        name: ResponsiblePostFeedWidget.routeName,
        path: ResponsiblePostFeedWidget.routePath,
        builder: (context, params) => params.isEmpty
            ? NavBarPage(initialPage: 'responsible_post_feed')
            : ResponsiblePostFeedWidget(),
      ),
      FFRoute(
        name: MainFeedVideoWidget.routeName,
        path: MainFeedVideoWidget.routePath,
        asyncParams: {
          'postDett': getDoc(['userPosts'], UserPostsRecord.fromSnapshot),
        },
        builder: (context, params) => MainFeedVideoWidget(
          postDett: params.getParam(
            'postDett',
            ParamType.Document,
          ),
          selectedIndex: params.getParam(
            'selectedIndex',
            ParamType.int,
          ),
        ),
      ),
      FFRoute(
        name: MultiblePhotoVideoSharingWidget.routeName,
        path: MultiblePhotoVideoSharingWidget.routePath,
        builder: (context, params) => MultiblePhotoVideoSharingWidget(),
      ),
      FFRoute(
        name: ResponsibleUploadMediaPageWidget.routeName,
        path: ResponsibleUploadMediaPageWidget.routePath,
        builder: (context, params) => ResponsibleUploadMediaPageWidget(),
      ),
      FFRoute(
        name: ResponsibleReelsCloneWidget.routeName,
        path: ResponsibleReelsCloneWidget.routePath,
        asyncParams: {
          'postDet': getDoc(['userPosts'], UserPostsRecord.fromSnapshot),
        },
        builder: (context, params) => ResponsibleReelsCloneWidget(
          selectedIndex: params.getParam(
            'selectedIndex',
            ParamType.int,
          ),
          postDet: params.getParam(
            'postDet',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: EventPageDetailsVer1Widget.routeName,
        path: EventPageDetailsVer1Widget.routePath,
        asyncParams: {
          'eventId': getDoc(
              ['eventListPortyApp'], EventListPortyAppRecord.fromSnapshot),
          'usersRef': getDoc(['users'], UsersRecord.fromSnapshot),
        },
        builder: (context, params) => EventPageDetailsVer1Widget(
          eventId: params.getParam(
            'eventId',
            ParamType.Document,
          ),
          usersRef: params.getParam(
            'usersRef',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: UserStoriesVer1Widget.routeName,
        path: UserStoriesVer1Widget.routePath,
        builder: (context, params) => UserStoriesVer1Widget(
          intialStoryIndex: params.getParam(
            'intialStoryIndex',
            ParamType.int,
          ),
        ),
      ),
      FFRoute(
        name: KvkkPageWidget.routeName,
        path: KvkkPageWidget.routePath,
        builder: (context, params) => KvkkPageWidget(),
      ),
      FFRoute(
        name: KvkkTurkishPageWidget.routeName,
        path: KvkkTurkishPageWidget.routePath,
        builder: (context, params) => KvkkTurkishPageWidget(),
      ),
      FFRoute(
        name: GDPREnglishWidget.routeName,
        path: GDPREnglishWidget.routePath,
        builder: (context, params) => GDPREnglishWidget(),
      ),
      FFRoute(
        name: TermOfUseWidget.routeName,
        path: TermOfUseWidget.routePath,
        builder: (context, params) => TermOfUseWidget(),
      ),
      FFRoute(
        name: DataRetentionDeletionPolicyWidget.routeName,
        path: DataRetentionDeletionPolicyWidget.routePath,
        builder: (context, params) => DataRetentionDeletionPolicyWidget(),
      ),
      FFRoute(
        name: GdprCcpaWidget.routeName,
        path: GdprCcpaWidget.routePath,
        builder: (context, params) => GdprCcpaWidget(),
      ),
      FFRoute(
        name: CommunityGuidelinesENWidget.routeName,
        path: CommunityGuidelinesENWidget.routePath,
        builder: (context, params) => CommunityGuidelinesENWidget(),
      ),
      FFRoute(
        name: ContentModerationPolicyWidget.routeName,
        path: ContentModerationPolicyWidget.routePath,
        builder: (context, params) => ContentModerationPolicyWidget(),
      ),
      FFRoute(
        name: MainPolicyIndexPageWidget.routeName,
        path: MainPolicyIndexPageWidget.routePath,
        builder: (context, params) => MainPolicyIndexPageWidget(),
      ),
      FFRoute(
        name: PrivacyPolicyEnglishWidget.routeName,
        path: PrivacyPolicyEnglishWidget.routePath,
        builder: (context, params) => PrivacyPolicyEnglishWidget(),
      ),
      FFRoute(
        name: SoccialSettingsWidget.routeName,
        path: SoccialSettingsWidget.routePath,
        builder: (context, params) => SoccialSettingsWidget(),
      ),
      FFRoute(
        name: SettingsPageVer1Widget.routeName,
        path: SettingsPageVer1Widget.routePath,
        builder: (context, params) => SettingsPageVer1Widget(),
      ),
      FFRoute(
        name: SettingsYeniSayfaWidget.routeName,
        path: SettingsYeniSayfaWidget.routePath,
        builder: (context, params) => SettingsYeniSayfaWidget(),
      ),
      FFRoute(
        name: EditYourProfilWidget.routeName,
        path: EditYourProfilWidget.routePath,
        builder: (context, params) => EditYourProfilWidget(),
      ),
      FFRoute(
        name: UserStoriesVer1CopyWidget.routeName,
        path: UserStoriesVer1CopyWidget.routePath,
        builder: (context, params) => UserStoriesVer1CopyWidget(
          intialStoryIndex: params.getParam(
            'intialStoryIndex',
            ParamType.int,
          ),
        ),
      ),
      FFRoute(
        name: UploadMediaPageWidget.routeName,
        path: UploadMediaPageWidget.routePath,
        builder: (context, params) => UploadMediaPageWidget(),
      ),
      FFRoute(
        name: PagewievPostFeedWidget.routeName,
        path: PagewievPostFeedWidget.routePath,
        builder: (context, params) => PagewievPostFeedWidget(
          userRef: params.getParam(
            'userRef',
            ParamType.DocumentReference,
            isList: false,
            collectionNamePath: ['userPosts'],
          ),
          selectedIndex: params.getParam(
            'selectedIndex',
            ParamType.int,
          ),
        ),
      ),
      FFRoute(
        name: Auth2ForgotPasswordWidget.routeName,
        path: Auth2ForgotPasswordWidget.routePath,
        builder: (context, params) => Auth2ForgotPasswordWidget(),
      ),
      FFRoute(
        name: ViewPageOtherUsherWidget.routeName,
        path: ViewPageOtherUsherWidget.routePath,
        asyncParams: {
          'userDetails': getDoc(['users'], UsersRecord.fromSnapshot),
        },
        builder: (context, params) => ViewPageOtherUsherWidget(
          userDetails: params.getParam(
            'userDetails',
            ParamType.Document,
          ),
          showPage: params.getParam(
            'showPage',
            ParamType.bool,
          ),
          pageTitle: params.getParam(
            'pageTitle',
            ParamType.String,
          ),
        ),
      ),
      FFRoute(
        name: LoginCreateAcountWidget.routeName,
        path: LoginCreateAcountWidget.routePath,
        builder: (context, params) => LoginCreateAcountWidget(),
      ),
      FFRoute(
        name: SporEventWidget.routeName,
        path: SporEventWidget.routePath,
        builder: (context, params) => SporEventWidget(),
      ),
      FFRoute(
        name: ViewPageOtherUsherCopyWidget.routeName,
        path: ViewPageOtherUsherCopyWidget.routePath,
        asyncParams: {
          'userDetails': getDoc(['users'], UsersRecord.fromSnapshot),
        },
        builder: (context, params) => ViewPageOtherUsherCopyWidget(
          userDetails: params.getParam(
            'userDetails',
            ParamType.Document,
          ),
          showPage: params.getParam(
            'showPage',
            ParamType.bool,
          ),
          pageTitle: params.getParam(
            'pageTitle',
            ParamType.String,
          ),
        ),
      ),
      FFRoute(
        name: TodayEventUserWidget.routeName,
        path: TodayEventUserWidget.routePath,
        builder: (context, params) => TodayEventUserWidget(),
      ),
      FFRoute(
        name: MainSettingPageVer1Widget.routeName,
        path: MainSettingPageVer1Widget.routePath,
        builder: (context, params) => MainSettingPageVer1Widget(),
      ),
      FFRoute(
        name: PortyClubMembersWidget.routeName,
        path: PortyClubMembersWidget.routePath,
        builder: (context, params) => PortyClubMembersWidget(),
      ),
      FFRoute(
        name: PortiesPageViewFeedWidget.routeName,
        path: PortiesPageViewFeedWidget.routePath,
        builder: (context, params) => PortiesPageViewFeedWidget(),
      ),
      FFRoute(
        name: KidsProgramWidget.routeName,
        path: KidsProgramWidget.routePath,
        builder: (context, params) => KidsProgramWidget(),
      ),
      FFRoute(
        name: EventAppPortyMainPage1Widget.routeName,
        path: EventAppPortyMainPage1Widget.routePath,
        asyncParams: {
          'eventRef': getDoc(
              ['eventListPortyApp'], EventListPortyAppRecord.fromSnapshot),
          'userRecord': getDoc(['users'], UsersRecord.fromSnapshot),
        },
        builder: (context, params) => params.isEmpty
            ? NavBarPage(initialPage: 'event_App_Porty_Main_Page_1')
            : EventAppPortyMainPage1Widget(
                eventRef: params.getParam(
                  'eventRef',
                  ParamType.Document,
                ),
                userRecord: params.getParam(
                  'userRecord',
                  ParamType.Document,
                ),
              ),
      ),
      FFRoute(
        name: ResponsibleReelsCloneCopyWidget.routeName,
        path: ResponsibleReelsCloneCopyWidget.routePath,
        asyncParams: {
          'postDet': getDoc(['userPosts'], UserPostsRecord.fromSnapshot),
        },
        builder: (context, params) => params.isEmpty
            ? NavBarPage(initialPage: 'responsible_Reels_CloneCopy')
            : ResponsibleReelsCloneCopyWidget(
                selectedIndex: params.getParam(
                  'selectedIndex',
                  ParamType.int,
                ),
                postDet: params.getParam(
                  'postDet',
                  ParamType.Document,
                ),
              ),
      ),
      FFRoute(
        name: EventAppPortyMainPage1UnregisterWidget.routeName,
        path: EventAppPortyMainPage1UnregisterWidget.routePath,
        asyncParams: {
          'eventRef': getDoc(
              ['eventListPortyApp'], EventListPortyAppRecord.fromSnapshot),
          'userRecord': getDoc(['users'], UsersRecord.fromSnapshot),
        },
        builder: (context, params) => EventAppPortyMainPage1UnregisterWidget(
          eventRef: params.getParam(
            'eventRef',
            ParamType.Document,
          ),
          userRecord: params.getParam(
            'userRecord',
            ParamType.Document,
          ),
        ),
      ),
      FFRoute(
        name: $marketplace_open_a_i_a_p_i_action_library_09b0f4
            .HomePageWidget.routeName,
        path: $marketplace_open_a_i_a_p_i_action_library_09b0f4
            .HomePageWidget.routePath,
        builder: (context, params) =>
            $marketplace_open_a_i_a_p_i_action_library_09b0f4.HomePageWidget(),
      ),
      FFRoute(
        name: $community_testing_ryusdv.NotificationsWidget.routeName,
        path: $community_testing_ryusdv.NotificationsWidget.routePath,
        builder: (context, params) =>
            $community_testing_ryusdv.NotificationsWidget(),
      ),
      FFRoute(
        name: $multi_select_dropdown_library_j42ie8.HomePageWidget.routeName,
        path: $multi_select_dropdown_library_j42ie8.HomePageWidget.routePath,
        builder: (context, params) =>
            $multi_select_dropdown_library_j42ie8.HomePageWidget(),
      ),
      FFRoute(
        name: $f_f_story_view_live_zhm3f3.StoryViewWidgetWidget.routeName,
        path: $f_f_story_view_live_zhm3f3.StoryViewWidgetWidget.routePath,
        builder: (context, params) =>
            $f_f_story_view_live_zhm3f3.StoryViewWidgetWidget(),
      ),
      FFRoute(
        name: $f_f_story_view_live_zhm3f3.FullPageStoryWidget.routeName,
        path: $f_f_story_view_live_zhm3f3.FullPageStoryWidget.routePath,
        builder: (context, params) =>
            $f_f_story_view_live_zhm3f3.FullPageStoryWidget(),
      ),
      FFRoute(
        name: $story_viewer_x4zfdq.HomePageWidget.routeName,
        path: $story_viewer_x4zfdq.HomePageWidget.routePath,
        builder: (context, params) => $story_viewer_x4zfdq.HomePageWidget(),
      ),
      FFRoute(
        name: $photo_editor_library_wy8jmz.HomePageWidget.routeName,
        path: $photo_editor_library_wy8jmz.HomePageWidget.routePath,
        builder: (context, params) =>
            $photo_editor_library_wy8jmz.HomePageWidget(),
      ),
      FFRoute(
        name: $build_ship_1r9r3f.DemoWidget.routeName,
        path: $build_ship_1r9r3f.DemoWidget.routePath,
        builder: (context, params) => $build_ship_1r9r3f.DemoWidget(),
      ),
      FFRoute(
        name: $schedule_local_notifications_library_xpd9ia
            .ScheduleNotificationsWidget.routeName,
        path: $schedule_local_notifications_library_xpd9ia
            .ScheduleNotificationsWidget.routePath,
        builder: (context, params) =>
            $schedule_local_notifications_library_xpd9ia
                .ScheduleNotificationsWidget(),
      ),
      FFRoute(
        name: $custom_video_player_library_tmr7du.HomePageWidget.routeName,
        path: $custom_video_player_library_tmr7du.HomePageWidget.routePath,
        builder: (context, params) =>
            $custom_video_player_library_tmr7du.HomePageWidget(),
      )
    ].map((r) => r.toRoute(appStateNotifier)).toList(),
    observers: [routeObserver],
  );
}

extension NavParamExtensions on Map<String, String?> {
  Map<String, String> get withoutNulls => Map.fromEntries(
        entries
            .where((e) => e.value != null)
            .map((e) => MapEntry(e.key, e.value!)),
      );
}

extension NavigationExtensions on BuildContext {
  void goNamedAuth(
    String name,
    bool mounted, {
    Map<String, String> pathParameters = const <String, String>{},
    Map<String, String> queryParameters = const <String, String>{},
    Object? extra,
    bool ignoreRedirect = false,
  }) =>
      !mounted || GoRouter.of(this).shouldRedirect(ignoreRedirect)
          ? null
          : goNamed(
              name,
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              extra: extra,
            );

  void pushNamedAuth(
    String name,
    bool mounted, {
    Map<String, String> pathParameters = const <String, String>{},
    Map<String, String> queryParameters = const <String, String>{},
    Object? extra,
    bool ignoreRedirect = false,
  }) =>
      !mounted || GoRouter.of(this).shouldRedirect(ignoreRedirect)
          ? null
          : pushNamed(
              name,
              pathParameters: pathParameters,
              queryParameters: queryParameters,
              extra: extra,
            );

  void safePop() {
    // If there is only one route on the stack, navigate to the initial
    // page instead of popping.
    if (canPop()) {
      pop();
    } else {
      go('/');
    }
  }
}

extension GoRouterExtensions on GoRouter {
  AppStateNotifier get appState => AppStateNotifier.instance;
  void prepareAuthEvent([bool ignoreRedirect = false]) =>
      appState.hasRedirect() && !ignoreRedirect
          ? null
          : appState.updateNotifyOnAuthChange(false);
  bool shouldRedirect(bool ignoreRedirect) =>
      !ignoreRedirect && appState.hasRedirect();
  void clearRedirectLocation() => appState.clearRedirectLocation();
  void setRedirectLocationIfUnset(String location) =>
      appState.updateNotifyOnAuthChange(false);
}

extension _GoRouterStateExtensions on GoRouterState {
  Map<String, dynamic> get extraMap =>
      extra != null ? extra as Map<String, dynamic> : {};
  Map<String, dynamic> get allParams => <String, dynamic>{}
    ..addAll(pathParameters)
    ..addAll(uri.queryParameters)
    ..addAll(extraMap);
  TransitionInfo get transitionInfo {
    final possibleKeys = [
      '__transition_info__',
      '__transition_info__marketplace_open_a_i_a_p_i_action_library_09b0f4',
      '__transition_info__community_testing_ryusdv',
      '__transition_info__multi_select_dropdown_library_j42ie8',
      '__transition_info__f_f_story_view_live_zhm3f3',
      '__transition_info__story_viewer_x4zfdq',
      '__transition_info__photo_editor_library_wy8jmz',
      '__transition_info__build_ship_1r9r3f',
      '__transition_info__schedule_local_notifications_library_xpd9ia',
      '__transition_info__custom_video_player_library_tmr7du'
    ];
    for (final key in possibleKeys) {
      if (extraMap.containsKey(key)) {
        return extraMap[key] as TransitionInfo;
      }
    }
    return TransitionInfo.appDefault();
  }
}

class FFParameters {
  FFParameters(this.state, [this.asyncParams = const {}]);

  final GoRouterState state;
  final Map<String, Future<dynamic> Function(String)> asyncParams;

  Map<String, dynamic> futureParamValues = {};

  // Parameters are empty if the params map is empty or if the only parameter
  // present is the special extra parameter reserved for the transition info.
  bool get isEmpty =>
      state.allParams.isEmpty ||
      (state.allParams.length == 1 &&
          state.extraMap.containsKey(kTransitionInfoKey));
  bool isAsyncParam(MapEntry<String, dynamic> param) =>
      asyncParams.containsKey(param.key) && param.value is String;
  bool get hasFutures => state.allParams.entries.any(isAsyncParam);
  Future<bool> completeFutures() => Future.wait(
        state.allParams.entries.where(isAsyncParam).map(
          (param) async {
            final doc = await asyncParams[param.key]!(param.value)
                .onError((_, __) => null);
            if (doc != null) {
              futureParamValues[param.key] = doc;
              return true;
            }
            return false;
          },
        ),
      ).onError((_, __) => [false]).then((v) => v.every((e) => e));

  dynamic getParam<T>(
    String paramName,
    ParamType type, {
    bool isList = false,
    List<String>? collectionNamePath,
    StructBuilder<T>? structBuilder,
  }) {
    if (futureParamValues.containsKey(paramName)) {
      return futureParamValues[paramName];
    }
    if (!state.allParams.containsKey(paramName)) {
      return null;
    }
    final param = state.allParams[paramName];
    // Got parameter from `extras`, so just directly return it.
    if (param is! String) {
      return param;
    }
    // Return serialized value.
    return deserializeParam<T>(
      param,
      type,
      isList,
      collectionNamePath: collectionNamePath,
      structBuilder: structBuilder,
    );
  }
}

class FFRoute {
  const FFRoute({
    required this.name,
    required this.path,
    required this.builder,
    this.requireAuth = false,
    this.asyncParams = const {},
    this.routes = const [],
  });

  final String name;
  final String path;
  final bool requireAuth;
  final Map<String, Future<dynamic> Function(String)> asyncParams;
  final Widget Function(BuildContext, FFParameters) builder;
  final List<GoRoute> routes;

  GoRoute toRoute(AppStateNotifier appStateNotifier) => GoRoute(
        name: name,
        path: path,
        redirect: (context, state) {
          if (appStateNotifier.shouldRedirect) {
            final redirectLocation = appStateNotifier.getRedirectLocation();
            appStateNotifier.clearRedirectLocation();
            return redirectLocation;
          }

          if (requireAuth && !appStateNotifier.loggedIn) {
            appStateNotifier.setRedirectLocationIfUnset(state.uri.toString());
            return '/loginCreateAcount';
          }
          return null;
        },
        pageBuilder: (context, state) {
          fixStatusBarOniOS16AndBelow(context);
          final ffParams = FFParameters(state, asyncParams);
          final page = ffParams.hasFutures
              ? FutureBuilder(
                  future: ffParams.completeFutures(),
                  builder: (context, _) => builder(context, ffParams),
                )
              : builder(context, ffParams);
          final child = appStateNotifier.loading
              ? Container(
                  color: Colors.white,
                  child: Image.asset(
                    'assets/images/072c71ea-7b17-4342-804b-d906ab604e65.png',
                    fit: BoxFit.contain,
                  ),
                )
              : page;

          final transitionInfo = state.transitionInfo;
          return transitionInfo.hasTransition
              ? CustomTransitionPage(
                  key: state.pageKey,
                  name: state.name,
                  child: child,
                  transitionDuration: transitionInfo.duration,
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) =>
                          PageTransition(
                    type: transitionInfo.transitionType,
                    duration: transitionInfo.duration,
                    reverseDuration: transitionInfo.duration,
                    alignment: transitionInfo.alignment,
                    child: child,
                  ).buildTransitions(
                    context,
                    animation,
                    secondaryAnimation,
                    child,
                  ),
                )
              : MaterialPage(
                  key: state.pageKey, name: state.name, child: child);
        },
        routes: routes,
      );
}

class TransitionInfo {
  const TransitionInfo({
    required this.hasTransition,
    this.transitionType = PageTransitionType.fade,
    this.duration = const Duration(milliseconds: 300),
    this.alignment,
  });

  final bool hasTransition;
  final PageTransitionType transitionType;
  final Duration duration;
  final Alignment? alignment;

  static TransitionInfo appDefault() => TransitionInfo(hasTransition: false);
}

class RootPageContext {
  const RootPageContext(this.isRootPage, [this.errorRoute]);
  final bool isRootPage;
  final String? errorRoute;

  static bool isInactiveRootPage(BuildContext context) {
    final rootPageContext = context.read<RootPageContext?>();
    final isRootPage = rootPageContext?.isRootPage ?? false;
    final location = GoRouterState.of(context).uri.toString();
    return isRootPage &&
        location != '/' &&
        location != rootPageContext?.errorRoute;
  }

  static Widget wrap(Widget child, {String? errorRoute}) => Provider.value(
        value: RootPageContext(true, errorRoute),
        child: child,
      );
}

extension GoRouterLocationExtension on GoRouter {
  String getCurrentLocation() {
    final RouteMatch lastMatch = routerDelegate.currentConfiguration.last;
    final RouteMatchList matchList = lastMatch is ImperativeRouteMatch
        ? lastMatch.matches
        : routerDelegate.currentConfiguration;
    return matchList.uri.toString();
  }
}
