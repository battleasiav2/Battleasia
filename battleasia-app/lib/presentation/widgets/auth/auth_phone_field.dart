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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'MOBILE NUMBER',
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textPrimary.withValues(alpha: 0.82),
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 8),
        IntlPhoneField(
          controller: controller,
          initialCountryCode: 'BD',
          dropdownTextStyle: AppTheme.bodyMedium.copyWith(
            color: AppColors.textPrimary,
          ),
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
          dropdownIcon: const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
          decoration: const InputDecoration(
            hintText: 'Enter phone number',
          ),
          onChanged: (phone) => onNumberChanged(phone.number),
          onCountryChanged: (country) => onCountryChanged(country.dialCode),
        ),
      ],
    );
  }
}
