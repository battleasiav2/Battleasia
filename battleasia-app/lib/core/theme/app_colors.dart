import 'package:flutter/material.dart';

/// Website-aligned brand tokens (battleasia.gg user area).
class AppColors {
  AppColors._();

  static const Color gold = Color(0xFFF5C518);
  static const Color goldDark = Color(0xFFD97706);
  static const Color goldLight = Color(0xFFFBBF24);
  static const Color goldAccent = Color(0xFFF59E0B);

  static const Color pageBg = Color(0xFF000000);
  static const Color surface = Color(0xFF0A0A0A);
  static const Color surfaceElevated = Color(0xFF141414);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textBody = Color(0xFFF5F5F5);
  static const Color textMuted = Color(0xFFC5CED9);
  static const Color textSubtle = Color(0xFFE8EEF5);

  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF38BDF8);

  static Color border([double opacity = 0.12]) =>
      Colors.white.withValues(alpha: opacity);

  static Color goldGlow([double opacity = 0.08]) =>
      gold.withValues(alpha: opacity);

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFF59E0B), Color(0xFFEA8C00), Color(0xFFD97706)],
  );

  static const LinearGradient goldGradientHover = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFFBBF24), Color(0xFFF59E0B), Color(0xFFEA8C00)],
  );
}
