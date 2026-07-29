import 'package:flutter/material.dart';

/// Utility class for responsive sizing based on screen width
/// Base reference: 16px font size at 900px screen width
class ResponsiveUtils {
  ResponsiveUtils._();

  /// Base screen width reference (900px)
  static const double baseWidth = 450.0;

  /// Base font size at base width (16px)
  static const double baseFontSize = 16.0;

  /// Minimum font size to prevent text from being too small
  static const double minFontSize = 12.0;

  /// Maximum font size to prevent text from being too large
  static const double maxFontSize = 48.0;

  /// Get responsive font size based on screen width
  ///
  /// [baseSize] - The font size at 900px screen width (default: 16)
  /// [context] - BuildContext to get screen width
  /// [min] - Minimum font size (default: 12)
  /// [max] - Maximum font size (default: 48)
  ///
  /// Returns a font size that scales proportionally with screen width
  static double getResponsiveFontSize(
    BuildContext context, {
    double baseSize = baseFontSize,
    double? min,
    double? max,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final minSize = min ?? minFontSize;
    final maxSize = max ?? maxFontSize;

    // Calculate responsive size: (screenWidth / baseWidth) * baseSize
    double responsiveSize = (screenWidth / baseWidth) * baseSize;

    // Apply constraints
    if (responsiveSize < minSize) {
      responsiveSize = minSize;
    } else if (responsiveSize > maxSize) {
      responsiveSize = maxSize;
    }

    return responsiveSize;
  }

  /// Get responsive font size for a specific screen width
  /// Useful when you don't have BuildContext
  ///
  /// [screenWidth] - Current screen width
  /// [baseSize] - The font size at 900px screen width (default: 16)
  /// [min] - Minimum font size (default: 12)
  /// [max] - Maximum font size (default: 48)
  static double getResponsiveFontSizeByWidth(
    double screenWidth, {
    double baseSize = baseFontSize,
    double? min,
    double? max,
  }) {
    final minSize = min ?? minFontSize;
    final maxSize = max ?? maxFontSize;

    // Calculate responsive size: (screenWidth / baseWidth) * baseSize
    double responsiveSize = (screenWidth / baseWidth) * baseSize;

    // Apply constraints
    if (responsiveSize < minSize) {
      responsiveSize = minSize;
    } else if (responsiveSize > maxSize) {
      responsiveSize = maxSize;
    }

    return responsiveSize;
  }

  /// Get responsive padding/spacing based on screen width
  ///
  /// [baseSize] - The spacing at 900px screen width
  /// [context] - BuildContext to get screen width
  static double getResponsiveSpacing(
    BuildContext context, {
    required double baseSize,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    return (screenWidth / baseWidth) * baseSize;
  }

  /// Get responsive padding/spacing for a specific screen width
  static double getResponsiveSpacingByWidth(
    double screenWidth, {
    required double baseSize,
  }) {
    return (screenWidth / baseWidth) * baseSize;
  }

  /// Check if screen is mobile (width < 600)
  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < 600;
  }

  /// Check if screen is tablet (600 <= width < 900)
  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= 600 && width < 900;
  }

  /// Check if screen is desktop (width >= 900)
  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= 900;
  }
}
