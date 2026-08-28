import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Shared label style for auth form fields — title case, not all-caps.
class AuthFieldLabel extends StatelessWidget {
  final String label;

  const AuthFieldLabel({super.key, required this.label});

  static TextStyle style(BuildContext context) {
    return AppTheme.bodySmall.copyWith(
      color: const Color(0xFFD1D5DB),
      fontWeight: FontWeight.w600,
      letterSpacing: 0.15,
      fontSize: 11.5,
      height: 1.25,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Text(label, style: style(context));
  }
}

class AuthTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String label;
  final String? hint;
  final bool obscureText;
  final TextInputType keyboardType;
  final Widget? suffix;
  final Widget? prefix;
  final IconData? prefixIcon;
  final String? Function(String?)? validator;
  final int maxLines;
  final TextInputAction? textInputAction;
  final VoidCallback? onEditingComplete;

  const AuthTextField({
    super.key,
    this.controller,
    required this.label,
    this.hint,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.suffix,
    this.prefix,
    this.prefixIcon,
    this.validator,
    this.maxLines = 1,
    this.textInputAction,
    this.onEditingComplete,
  });

  @override
  Widget build(BuildContext context) {
    final goldBorder = AppColors.gold.withValues(alpha: 0.28);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AuthFieldLabel(label: label),
        const SizedBox(height: 6),
        DecoratedBox(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withValues(alpha: 0.12),
                blurRadius: 10,
              ),
            ],
          ),
          child: TextFormField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            maxLines: maxLines,
            validator: validator,
            textInputAction: textInputAction,
            onEditingComplete: onEditingComplete,
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
              fontSize: 16,
            ),
            cursorColor: AppColors.gold,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: AppTheme.bodyMedium.copyWith(
                color: const Color(0xFF9CA3AF),
                fontSize: 16,
              ),
              filled: true,
              fillColor: const Color(0xFF0E0E0E),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 13,
              ),
              prefixIcon: prefix ??
                  (prefixIcon != null
                      ? Icon(prefixIcon, color: const Color(0xFF9CA3AF), size: 18)
                      : null),
              suffixIcon: suffix,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(color: goldBorder),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(
                  color: AppColors.gold.withValues(alpha: 0.55),
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: const BorderSide(color: AppColors.error),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: const BorderSide(color: AppColors.error, width: 1.2),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
