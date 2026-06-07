/// Firebase bağlantı ayarları — BosphorusVibe projesi.
///
/// Android: android/app/google-services.json
/// iOS: ios/Runner/GoogleService-Info.plist
/// Web: aşağıdaki alanlar (Firebase Console → Bosphorus Vibe Web)
class FirebaseCredentials {
  static const bool enabled = true;

  static const String projectId = 'bosphorusvibe-dbd93';
  static const String apiKey = 'AIzaSyCUG95r1DCRa5UcEAP44yDjLY6fCnh3eik';
  static const String authDomain = 'bosphorusvibe-dbd93.firebaseapp.com';
  static const String storageBucket = 'bosphorusvibe-dbd93.firebasestorage.app';
  static const String messagingSenderId = '449625940293';
  static const String appId = '1:449625940293:web:5c5d874ad9d7a5a1d69e2c';
  static const String measurementId = 'G-JSV13JSWYC';

  static bool get isConfigured =>
      enabled &&
      projectId.isNotEmpty &&
      apiKey.isNotEmpty &&
      appId.isNotEmpty;
}
