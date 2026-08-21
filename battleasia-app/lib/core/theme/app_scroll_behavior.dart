import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

/// Native-feel scrolling:
/// - Android → clamping (Material / APK feel, no rubber-band “web bounce”)
/// - iOS → bouncing
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

/// Prefer Android clamping so the APK does not feel like a browser overscroll.
ScrollPhysics get appScrollPhysics {
  switch (defaultTargetPlatform) {
    case TargetPlatform.iOS:
    case TargetPlatform.macOS:
      return const AlwaysScrollableScrollPhysics(
        parent: BouncingScrollPhysics(),
      );
    default:
      return const AlwaysScrollableScrollPhysics(
        parent: ClampingScrollPhysics(),
      );
  }
}
