// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import "package:story_view/story_view.dart";

class StoryWidget extends StatefulWidget {
  const StoryWidget({
    super.key,
    this.width,
    this.height,
    required this.storyItemList,
  });

  final double? width;
  final double? height;
  final List<StoryItemStruct> storyItemList;

  @override
  State<StoryWidget> createState() => _StoryWidgetState();
}

class _StoryWidgetState extends State<StoryWidget> {
  final StoryController controller = StoryController();

  StoryItem storyItemSwitch(StoryItemStruct storyItem) {
    return switch (storyItem.type) {
      StoryItemEnum.text => StoryItem.text(
          title: storyItem.title,
          backgroundColor: storyItem.backgroundColor ?? Colors.white,
        ),
      StoryItemEnum.inlineImage => StoryItem.inlineImage(
          url: storyItem.url,
          controller: controller,
          caption: Text(
            storyItem.caption,
            style: TextStyle(
              color: Colors.white,
              backgroundColor: Colors.black54,
              fontSize: 17,
            ),
          ),
        ),
      StoryItemEnum.pageImage =>
        StoryItem.pageImage(url: storyItem.url, controller: controller),
      StoryItemEnum.pageVideo => StoryItem.pageVideo(
          storyItem.url,
          controller: controller,
        ),
    };
  }

  @override
  Widget build(BuildContext context) {
    return StoryView(
      controller: controller,
      storyItems: widget.storyItemList
          .map<StoryItem>((e) => storyItemSwitch(e))
          .toList(),
      onStoryShow: (storyItem, index) {
        print("Showing a story");
      },
      onComplete: () {
        print("Completed a cycle");
      },
      progressPosition: ProgressPosition.bottom,
      repeat: false,
      inline: true,
    );
  }
}
