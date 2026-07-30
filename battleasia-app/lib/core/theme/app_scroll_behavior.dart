import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

/// Native-feel scrolling: iOS bounce + always scrollable lists.
class AppScrollBehavior extends MaterialScrollBehavior {
  const AppScrollBehavior();

  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.trackpad,
        PointerDeviceKind.stylus,
      };

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const AlwaysScrollableScrollPhysics(
      parent: BouncingScrollPhysics(),
    );
  }
}

const ScrollPhysics appScrollPhysics = AlwaysScrollableScrollPhysics(
  parent: BouncingScrollPhysics(),
);
