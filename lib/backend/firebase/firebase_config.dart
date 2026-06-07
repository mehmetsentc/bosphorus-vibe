import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

import 'firebase_credentials.dart';

Future<void> initFirebase() async {
  if (!FirebaseCredentials.enabled) {
    debugPrint(
      'Firebase devre dışı. Bağlamak için firebase_credentials.dart dosyasını güncelleyin.',
    );
    return;
  }

  if (kIsWeb) {
    if (!FirebaseCredentials.isConfigured) {
      debugPrint(
        'Firebase web yapılandırması eksik. firebase_credentials.dart dosyasını doldurun.',
      );
      return;
    }

    await Firebase.initializeApp(
      options: FirebaseOptions(
        apiKey: FirebaseCredentials.apiKey,
        authDomain: FirebaseCredentials.authDomain,
        projectId: FirebaseCredentials.projectId,
        storageBucket: FirebaseCredentials.storageBucket,
        messagingSenderId: FirebaseCredentials.messagingSenderId,
        appId: FirebaseCredentials.appId,
        measurementId: FirebaseCredentials.measurementId,
      ),
    );
    return;
  }

  await Firebase.initializeApp();
}
