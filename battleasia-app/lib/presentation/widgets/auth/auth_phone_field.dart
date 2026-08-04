import 'package:flutter/material.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class AuthPhoneField extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onNumberChanged;
  final ValueChanged<String> onCountryChanged;

  const AuthPhoneField({
    super.key,
    required this.controller,
    required this.onNumberChanged,
    required this.onCountryChanged,
  });

  @override
  Widget build(BuildContext context) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'MOBILE NUMBER',
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textMuted,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
            fontSize: 11,
          ),
        ),
        const SizedBox(height: 8),
        IntlPhoneField(
          controller: controller,
          initialCountryCode: 'BD',
          disableLengthCheck: true,
          dropdownTextStyle: AppTheme.bodyMedium.copyWith(
            color: AppColors.textPrimary,
          ),
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
          dropdownIcon: const Icon(
            Icons.arrow_drop_down,
            color: AppColors.textMuted,
          ),
          decoration: InputDecoration(
            hintText: 'Enter phone number',
            hintStyle: AppTheme.bodyMedium.copyWith(
              color: Colors.white.withValues(alpha: 0.35),
            ),
            filled: true,
            fillColor: const Color(0xFF1A1A1A),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 15,
            ),
            enabledBorder: border,
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.gold, width: 1.2),
            ),
            border: border,
          ),
          onChanged: (phone) => onNumberChanged(phone.number),
          onCountryChanged: (country) => onCountryChanged(country.dialCode),
        ),
      ],
    );
  }
}
