import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Input chrome shared with [AuthTextField] — hint inside, dark fill, gold focus.
abstract final class AuthInputStyle {
  static TextStyle get textStyle => AppTheme.bodyMedium.copyWith(
        color: AppColors.textPrimary,
        fontSize: 15,
        fontWeight: FontWeight.w500,
      );

  static InputDecoration decoration(
    String hintText, {
    Widget? suffixIcon,
    Widget? prefixIcon,
    String? helperText,
    TextStyle? helperStyle,
    EdgeInsetsGeometry? contentPadding,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: AppTheme.bodyMedium.copyWith(
        color: Colors.white.withValues(alpha: 0.42),
        fontSize: 15,
      ),
      helperText: helperText,
      helperStyle: helperStyle ??
          AppTheme.bodySmall.copyWith(
            color: AppColors.textMuted,
            fontSize: 11,
          ),
      filled: true,
      fillColor: const Color(0xFF14161C),
      isDense: true,
      contentPadding: contentPadding ??
          const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.7)),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: const BorderSide(color: AppColors.error, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: const BorderSide(color: AppColors.error, width: 1.5),
      ),
    );
  }
}
