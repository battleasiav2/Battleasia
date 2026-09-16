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

  static const Color pageBg = Color(0xC2060607);
  static const Color surface = Color(0xFF0B0B0D);
  static const Color surfaceElevated = Color(0xFF161618);
  static const Color panel = Color(0xFF161618);

  static const Color textPrimary = Color(0xFFF4F4F1);
  static const Color textBody = Color(0xFFF4F4F1);
  static const Color textSecondary = Color(0x9EF4F4F1);
  static const Color textPlaceholder = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0x9EF4F4F1);
  static const Color textSubtle = Color(0xD1F4F4F1);

  static const double radius = 18;
  static const double radiusSm = 12;

  static Color panelFill([double opacity = 0.38]) =>
      panel.withValues(alpha: opacity);

  static Color hair([double opacity = 0.09]) =>
      Colors.white.withValues(alpha: opacity);

  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF38BDF8);

  static Color border([double opacity = 0.09]) =>
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
