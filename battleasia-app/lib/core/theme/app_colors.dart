import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/accent_palette.dart';

/// Website-aligned brand tokens (battleasia.gg user area).
class AppColors {
  AppColors._();

  static Color gold = const Color(0xFFF5C518);
  static Color goldDark = const Color(0xFFD97706);
  static Color goldLight = const Color(0xFFFBBF24);
  static Color goldAccent = const Color(0xFFF59E0B);
  static Color goldInk = const Color(0xFF111111);

  static const Color pageBg = Color(0xFF000000);
  static const Color surface = Color(0xFF0A0A0A);
  static const Color surfaceElevated = Color(0xFF141414);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textBody = Color(0xFFF5F5F5);
  static const Color textSecondary = Color(0xFFD1D5DB);
  static const Color textPlaceholder = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0xFF9CA3AF);
  static const Color textSubtle = Color(0xFFE8EEF5);

  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF38BDF8);

  static Color border([double opacity = 0.12]) =>
      Colors.white.withValues(alpha: opacity);

  static Color goldGlow([double opacity = 0.08]) =>
      gold.withValues(alpha: opacity);

  static LinearGradient goldGradient = const LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFF59E0B), Color(0xFFEA8C00), Color(0xFFD97706)],
  );

  static LinearGradient goldGradientHover = const LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFFBBF24), Color(0xFFF59E0B), Color(0xFFEA8C00)],
  );

  static void bind(AccentPalette palette) {
    gold = palette.gold;
    goldLight = palette.goldLight;
    goldDark = palette.goldDark;
    goldAccent = palette.goldLight;
    goldInk = palette.ink;
    goldGradient = palette.gradient;
    goldGradientHover = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [palette.goldLight, palette.gold, palette.gold],
    );
  }
}
