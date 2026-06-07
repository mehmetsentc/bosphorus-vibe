import 'package:flutter/material.dart';
import 'flutter_flow/request_manager.dart';
import '/backend/backend.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:csv/csv.dart';
import 'package:synchronized/synchronized.dart';
import 'flutter_flow/flutter_flow_util.dart';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    secureStorage = FlutterSecureStorage();
    await _safeInitAsync(() async {
      _selectedEvent =
          await secureStorage.getString('ff_selectedEvent') ?? _selectedEvent;
    });
    await _safeInitAsync(() async {
      _SavedPost = (await secureStorage.getStringList('ff_SavedPost'))
              ?.map((path) => path.ref)
              .toList() ??
          _SavedPost;
    });
    await _safeInitAsync(() async {
      _apKeys = await secureStorage.getString('ff_apKeys') ?? _apKeys;
    });
    await _safeInitAsync(() async {
      _isDarkMode = await secureStorage.getBool('ff_isDarkMode') ?? _isDarkMode;
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late FlutterSecureStorage secureStorage;

  String _selectedEvent = '';
  String get selectedEvent => _selectedEvent;
  set selectedEvent(String value) {
    _selectedEvent = value;
    secureStorage.setString('ff_selectedEvent', value);
  }

  void deleteSelectedEvent() {
    secureStorage.delete(key: 'ff_selectedEvent');
  }

  List<String> _selectedButtonState = [];
  List<String> get selectedButtonState => _selectedButtonState;
  set selectedButtonState(List<String> value) {
    _selectedButtonState = value;
  }

  void addToSelectedButtonState(String value) {
    selectedButtonState.add(value);
  }

  void removeFromSelectedButtonState(String value) {
    selectedButtonState.remove(value);
  }

  void removeAtIndexFromSelectedButtonState(int index) {
    selectedButtonState.removeAt(index);
  }

  void updateSelectedButtonStateAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    selectedButtonState[index] = updateFn(_selectedButtonState[index]);
  }

  void insertAtIndexInSelectedButtonState(int index, String value) {
    selectedButtonState.insert(index, value);
  }

  bool _selectedButton = false;
  bool get selectedButton => _selectedButton;
  set selectedButton(bool value) {
    _selectedButton = value;
  }

  DateTime? _Date2 = DateTime.fromMillisecondsSinceEpoch(1741271280000);
  DateTime? get Date2 => _Date2;
  set Date2(DateTime? value) {
    _Date2 = value;
  }

  List<DocumentReference> _SavedPost = [];
  List<DocumentReference> get SavedPost => _SavedPost;
  set SavedPost(List<DocumentReference> value) {
    _SavedPost = value;
    secureStorage.setStringList(
        'ff_SavedPost', value.map((x) => x.path).toList());
  }

  void deleteSavedPost() {
    secureStorage.delete(key: 'ff_SavedPost');
  }

  void addToSavedPost(DocumentReference value) {
    SavedPost.add(value);
    secureStorage.setStringList(
        'ff_SavedPost', _SavedPost.map((x) => x.path).toList());
  }

  void removeFromSavedPost(DocumentReference value) {
    SavedPost.remove(value);
    secureStorage.setStringList(
        'ff_SavedPost', _SavedPost.map((x) => x.path).toList());
  }

  void removeAtIndexFromSavedPost(int index) {
    SavedPost.removeAt(index);
    secureStorage.setStringList(
        'ff_SavedPost', _SavedPost.map((x) => x.path).toList());
  }

  void updateSavedPostAtIndex(
    int index,
    DocumentReference Function(DocumentReference) updateFn,
  ) {
    SavedPost[index] = updateFn(_SavedPost[index]);
    secureStorage.setStringList(
        'ff_SavedPost', _SavedPost.map((x) => x.path).toList());
  }

  void insertAtIndexInSavedPost(int index, DocumentReference value) {
    SavedPost.insert(index, value);
    secureStorage.setStringList(
        'ff_SavedPost', _SavedPost.map((x) => x.path).toList());
  }

  List<String> _manuitems = [];
  List<String> get manuitems => _manuitems;
  set manuitems(List<String> value) {
    _manuitems = value;
  }

  void addToManuitems(String value) {
    manuitems.add(value);
  }

  void removeFromManuitems(String value) {
    manuitems.remove(value);
  }

  void removeAtIndexFromManuitems(int index) {
    manuitems.removeAt(index);
  }

  void updateManuitemsAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    manuitems[index] = updateFn(_manuitems[index]);
  }

  void insertAtIndexInManuitems(int index, String value) {
    manuitems.insert(index, value);
  }

  String _menuActiveItem = 'Home';
  String get menuActiveItem => _menuActiveItem;
  set menuActiveItem(String value) {
    _menuActiveItem = value;
  }

  List<Color> _menuItemColors = [];
  List<Color> get menuItemColors => _menuItemColors;
  set menuItemColors(List<Color> value) {
    _menuItemColors = value;
  }

  void addToMenuItemColors(Color value) {
    menuItemColors.add(value);
  }

  void removeFromMenuItemColors(Color value) {
    menuItemColors.remove(value);
  }

  void removeAtIndexFromMenuItemColors(int index) {
    menuItemColors.removeAt(index);
  }

  void updateMenuItemColorsAtIndex(
    int index,
    Color Function(Color) updateFn,
  ) {
    menuItemColors[index] = updateFn(_menuItemColors[index]);
  }

  void insertAtIndexInMenuItemColors(int index, Color value) {
    menuItemColors.insert(index, value);
  }

  bool _draver = false;
  bool get draver => _draver;
  set draver(bool value) {
    _draver = value;
  }

  String _apKeys = '';
  String get apKeys => _apKeys;
  set apKeys(String value) {
    _apKeys = value;
    secureStorage.setString('ff_apKeys', value);
  }

  void deleteApKeys() {
    secureStorage.delete(key: 'ff_apKeys');
  }

  bool _isDarkMode = false;
  bool get isDarkMode => _isDarkMode;
  set isDarkMode(bool value) {
    _isDarkMode = value;
    secureStorage.setBool('ff_isDarkMode', value);
  }

  void deleteIsDarkMode() {
    secureStorage.delete(key: 'ff_isDarkMode');
  }

  dynamic _chatHistory;
  dynamic get chatHistory => _chatHistory;
  set chatHistory(dynamic value) {
    _chatHistory = value;
  }

  String _threadId = 'guest';
  String get threadId => _threadId;
  set threadId(String value) {
    _threadId = value;
  }

  int _selectedTabIndex = 0;
  int get selectedTabIndex => _selectedTabIndex;
  set selectedTabIndex(int value) {
    _selectedTabIndex = value;
  }

  String _key = '';
  String get key => _key;
  set key(String value) {
    _key = value;
  }

  String _selectMediaPathUrl = '';
  String get selectMediaPathUrl => _selectMediaPathUrl;
  set selectMediaPathUrl(String value) {
    _selectMediaPathUrl = value;
  }

  String _captionText = '';
  String get captionText => _captionText;
  set captionText(String value) {
    _captionText = value;
  }

  bool _allowComments = false;
  bool get allowComments => _allowComments;
  set allowComments(bool value) {
    _allowComments = value;
  }

  bool _isPrivate = false;
  bool get isPrivate => _isPrivate;
  set isPrivate(bool value) {
    _isPrivate = value;
  }

  String _selectedLocation = '';
  String get selectedLocation => _selectedLocation;
  set selectedLocation(String value) {
    _selectedLocation = value;
  }

  bool _isUploading = false;
  bool get isUploading => _isUploading;
  set isUploading(bool value) {
    _isUploading = value;
  }

  String _selectVideoPath = '';
  String get selectVideoPath => _selectVideoPath;
  set selectVideoPath(String value) {
    _selectVideoPath = value;
  }

  int _webViev = 0;
  int get webViev => _webViev;
  set webViev(int value) {
    _webViev = value;
  }

  int _wv2 = 0;
  int get wv2 => _wv2;
  set wv2(int value) {
    _wv2 = value;
  }

  String _selectedCategory = 'All';
  String get selectedCategory => _selectedCategory;
  set selectedCategory(String value) {
    _selectedCategory = value;
  }

  String _searchText = 'This TextField';
  String get searchText => _searchText;
  set searchText(String value) {
    _searchText = value;
  }

  String _selectedPage = 'Dashboard';
  String get selectedPage => _selectedPage;
  set selectedPage(String value) {
    _selectedPage = value;
  }

  bool _isMuted = true;
  bool get isMuted => _isMuted;
  set isMuted(bool value) {
    _isMuted = value;
  }

  bool _acceptedPolicy = false;
  bool get acceptedPolicy => _acceptedPolicy;
  set acceptedPolicy(bool value) {
    _acceptedPolicy = value;
  }

  bool _showLikeAnimation = false;
  bool get showLikeAnimation => _showLikeAnimation;
  set showLikeAnimation(bool value) {
    _showLikeAnimation = value;
  }

  int _intanindex = 0;
  int get intanindex => _intanindex;
  set intanindex(int value) {
    _intanindex = value;
  }

  String _ThumbnailPath = '';
  String get ThumbnailPath => _ThumbnailPath;
  set ThumbnailPath(String value) {
    _ThumbnailPath = value;
  }

  List<DocumentReference> _blockeduserlist = [];
  List<DocumentReference> get blockeduserlist => _blockeduserlist;
  set blockeduserlist(List<DocumentReference> value) {
    _blockeduserlist = value;
  }

  void addToBlockeduserlist(DocumentReference value) {
    blockeduserlist.add(value);
  }

  void removeFromBlockeduserlist(DocumentReference value) {
    blockeduserlist.remove(value);
  }

  void removeAtIndexFromBlockeduserlist(int index) {
    blockeduserlist.removeAt(index);
  }

  void updateBlockeduserlistAtIndex(
    int index,
    DocumentReference Function(DocumentReference) updateFn,
  ) {
    blockeduserlist[index] = updateFn(_blockeduserlist[index]);
  }

  void insertAtIndexInBlockeduserlist(int index, DocumentReference value) {
    blockeduserlist.insert(index, value);
  }

  final _userDocQueryManager = FutureRequestManager<UsersRecord>();
  Future<UsersRecord> userDocQuery({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<UsersRecord> Function() requestFn,
  }) =>
      _userDocQueryManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearUserDocQueryCache() => _userDocQueryManager.clear();
  void clearUserDocQueryCacheKey(String? uniqueKey) =>
      _userDocQueryManager.clearRequest(uniqueKey);
}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}

Color? _colorFromIntValue(int? val) {
  if (val == null) {
    return null;
  }
  return Color(val);
}

extension FlutterSecureStorageExtensions on FlutterSecureStorage {
  static final _lock = Lock();

  Future<void> writeSync({required String key, String? value}) async =>
      await _lock.synchronized(() async {
        await write(key: key, value: value);
      });

  void remove(String key) => delete(key: key);

  Future<String?> getString(String key) async => await read(key: key);
  Future<void> setString(String key, String value) async =>
      await writeSync(key: key, value: value);

  Future<bool?> getBool(String key) async => (await read(key: key)) == 'true';
  Future<void> setBool(String key, bool value) async =>
      await writeSync(key: key, value: value.toString());

  Future<int?> getInt(String key) async =>
      int.tryParse(await read(key: key) ?? '');
  Future<void> setInt(String key, int value) async =>
      await writeSync(key: key, value: value.toString());

  Future<double?> getDouble(String key) async =>
      double.tryParse(await read(key: key) ?? '');
  Future<void> setDouble(String key, double value) async =>
      await writeSync(key: key, value: value.toString());

  Future<List<String>?> getStringList(String key) async =>
      await read(key: key).then((result) {
        if (result == null || result.isEmpty) {
          return null;
        }
        return CsvToListConverter()
            .convert(result)
            .first
            .map((e) => e.toString())
            .toList();
      });
  Future<void> setStringList(String key, List<String> value) async =>
      await writeSync(key: key, value: ListToCsvConverter().convert([value]));
}
