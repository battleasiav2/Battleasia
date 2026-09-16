import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

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
  final Iterable<String>? autofillHints;

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
    this.autofillHints,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textMuted,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.8,
            fontSize: 11.5,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            maxLines: maxLines,
            validator: validator,
            textInputAction: textInputAction,
            onEditingComplete: onEditingComplete,
            autofillHints: autofillHints,
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            cursorColor: AppColors.gold,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: AppTheme.bodyMedium.copyWith(
                color: Colors.white.withValues(alpha: 0.42),
                fontSize: 15,
              ),
              filled: true,
              fillColor: const Color(0x9E0A0A0C),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 13,
              ),
              prefixIcon: prefix ??
                  (prefixIcon != null
                      ? Icon(prefixIcon, color: Colors.white.withValues(alpha: 0.42), size: 18)
                      : null),
              suffixIcon: suffix,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.09)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.gold),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.error),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.error, width: 1.2),
              ),
            ),
          ),
      ],
    );
  }
}
