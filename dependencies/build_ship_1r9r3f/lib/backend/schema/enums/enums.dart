import 'package:collection/collection.dart';
import 'package:ff_commons/flutter_flow/enums.dart';
export 'package:ff_commons/flutter_flow/enums.dart';

enum AuthOption {
  Firebase,
  Supabase,
  None,
}

T? deserializeEnum<T>(String? value) {
  switch (T) {
    case (AuthOption):
      return AuthOption.values.deserialize(value) as T?;
    default:
      return null;
  }
}
