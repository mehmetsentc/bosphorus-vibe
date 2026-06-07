import 'package:flutter/material.dart';
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  Future initializePersistedState() async {}

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  List<StoryItemStruct> _storyList = [
    StoryItemStruct.fromSerializableMap(jsonDecode(
        '{\"type\":\"text\",\"title\":\"Text Type \",\"url\":\"\",\"backgroundColor\":\"#36b4ff\",\"caption\":\"\"}')),
    StoryItemStruct.fromSerializableMap(jsonDecode(
        '{\"type\":\"inlineImage\",\"title\":\"\",\"url\":\"https://media.giphy.com/media/3o6Zt010xPwYaRC44o/giphy.gif?cid=ecf05e47q9oajz07o9beoxj39klzu2di5wxx2cyeqcgckipq&ep=v1_gifs_related&rid=giphy.gif&ct=g\",\"backgroundColor\":\"#0000\",\"caption\":\"Inline Image\"}')),
    StoryItemStruct.fromSerializableMap(jsonDecode(
        '{\"type\":\"pageImage\",\"title\":\"\",\"url\":\"https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTg0M2lsdDJpYmxrbWZ4eW84NTgxMHU5bng4eDAycHB6aGxxcHJsdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hXDrTueJWAscK3xWQ2/giphy.gif\",\"backgroundColor\":\"#0000\",\"caption\":\"Page Image\"}'))
  ];
  List<StoryItemStruct> get storyList => _storyList;
  set storyList(List<StoryItemStruct> value) {
    _storyList = value;
  }

  void addToStoryList(StoryItemStruct value) {
    storyList.add(value);
  }

  void removeFromStoryList(StoryItemStruct value) {
    storyList.remove(value);
  }

  void removeAtIndexFromStoryList(int index) {
    storyList.removeAt(index);
  }

  void updateStoryListAtIndex(
    int index,
    StoryItemStruct Function(StoryItemStruct) updateFn,
  ) {
    storyList[index] = updateFn(_storyList[index]);
  }

  void insertAtIndexInStoryList(int index, StoryItemStruct value) {
    storyList.insert(index, value);
  }
}
