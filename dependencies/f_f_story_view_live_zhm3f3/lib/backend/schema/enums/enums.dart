import 'package:collection/collection.dart';
import 'package:ff_commons/flutter_flow/enums.dart';
export 'package:ff_commons/flutter_flow/enums.dart';

enum StoryItemEnum {
  text,
  inlineImage,
  pageImage,
  pageVideo,
}

T? deserializeEnum<T>(String? value) {
  switch (T) {
    case (StoryItemEnum):
      return StoryItemEnum.values.deserialize(value) as T?;
    default:
      return null;
  }
}
