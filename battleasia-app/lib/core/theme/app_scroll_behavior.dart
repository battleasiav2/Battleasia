import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

/// Native APK scrolling — clamping only (no rubber-band bounce).
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
  ScrollPhysics getScrollPhysics(BuildContext context) => appScrollPhysics;
}

ScrollPhysics get appScrollPhysics => const AlwaysScrollableScrollPhysics(
      parent: ClampingScrollPhysics(),
    );
