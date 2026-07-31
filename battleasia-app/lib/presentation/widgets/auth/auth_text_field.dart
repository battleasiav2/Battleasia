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
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textPrimary.withValues(alpha: 0.82),
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          style: AppTheme.bodyMedium.copyWith(
            color: AppColors.textPrimary,
            fontSize: 14,
          ),
          cursorColor: AppColors.goldAccent,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTheme.bodyMedium.copyWith(
              color: Colors.white.withValues(alpha: 0.55),
            ),
            filled: true,
            fillColor: Colors.black.withValues(alpha: 0.5),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 14,
            ),
            prefixIcon: prefix ??
                (prefixIcon != null
                    ? Icon(prefixIcon, color: AppColors.goldAccent, size: 20)
                    : null),
            suffixIcon: suffix,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: BorderSide(color: AppColors.border(0.22)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: const BorderSide(color: AppColors.goldAccent),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: const BorderSide(color: AppColors.error),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(2),
              borderSide: const BorderSide(color: AppColors.error),
            ),
          ),
        ),
      ],
    );
  }
}
