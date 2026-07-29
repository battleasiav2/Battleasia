import 'package:flutter/material.dart';

class AppUtils {
  // Screen Size Helpers
  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  static bool isMobile(BuildContext context) {
    return screenWidth(context) < 600;
  }

  static bool isTablet(BuildContext context) {
    return screenWidth(context) >= 600 && screenWidth(context) < 1200;
  }

  static bool isDesktop(BuildContext context) {
    return screenWidth(context) >= 1200;
  }

  // Text Shadow
  static List<Shadow> getTextShadow({
    double blurRadius = 4.0,
    Color color = Colors.black87,
    Offset offset = const Offset(2, 2),
  }) {
    return [Shadow(offset: offset, blurRadius: blurRadius, color: color)];
  }

  // Box Shadow
  static List<BoxShadow> getBoxShadow({
    Color color = Colors.black26,
    double blurRadius = 8.0,
    Offset offset = const Offset(0, 4),
  }) {
    return [BoxShadow(color: color, blurRadius: blurRadius, offset: offset)];
  }
}
