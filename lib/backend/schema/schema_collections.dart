/// Firestore koleksiyon adları — şema kayıtları ve güvenlik kuralları ile eşleşir.
abstract final class SchemaCollections {
  static const userPosts = 'userPosts';
  static const users = 'users';
  static const postComments = 'postComments';
  static const userStories = 'userStories';
  static const storyComments = 'storyComments';
  static const friends = 'friends';
  static const chats = 'chats';
  static const chatMessages = 'chat_messages';
  static const notification = 'Notification';
  static const userDrafts = 'userDrafts';
  static const eventListPortyApp = 'eventListPortyApp';
  static const eventPost = 'eventPost';
  static const karaokeParticipationList = 'Karaoke_Particapition_List';
  static const notificationUser = 'notificaton_user';
  static const storyStatus = 'storyStatus';
  static const storyNotifications = 'storyNotifications';

  static const all = <String>[
    userPosts,
    users,
    postComments,
    userStories,
    storyComments,
    friends,
    chats,
    chatMessages,
    notification,
    userDrafts,
    eventListPortyApp,
    eventPost,
    karaokeParticipationList,
    notificationUser,
    storyStatus,
    storyNotifications,
  ];
}
