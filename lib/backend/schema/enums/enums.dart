import "package:community_testing_ryusdv/backend/schema/enums/enums.dart"
    as community_testing_ryusdv_enums;
import "package:f_f_story_view_live_zhm3f3/backend/schema/enums/enums.dart"
    as f_f_story_view_live_zhm3f3_enums;
import "package:build_ship_1r9r3f/backend/schema/enums/enums.dart"
    as build_ship_1r9r3f_enums;
import 'package:ff_commons/flutter_flow/enums.dart';
export 'package:ff_commons/flutter_flow/enums.dart';

enum Role {
  user,
  assistant,
}

T? deserializeEnum<T>(String? value) {
  switch (T) {
    case (Role):
      return Role.values.deserialize(value) as T?;
    case (community_testing_ryusdv_enums.ToastType):
      return community_testing_ryusdv_enums.ToastType.values.deserialize(value)
          as T?;
    case (community_testing_ryusdv_enums.ToastStyle):
      return community_testing_ryusdv_enums.ToastStyle.values.deserialize(value)
          as T?;
    case (community_testing_ryusdv_enums.ToastPosition):
      return community_testing_ryusdv_enums.ToastPosition.values
          .deserialize(value) as T?;
    case (f_f_story_view_live_zhm3f3_enums.StoryItemEnum):
      return f_f_story_view_live_zhm3f3_enums.StoryItemEnum.values
          .deserialize(value) as T?;
    case (build_ship_1r9r3f_enums.AuthOption):
      return build_ship_1r9r3f_enums.AuthOption.values.deserialize(value) as T?;
    default:
      return null;
  }
}
