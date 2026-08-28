import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';

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
    final goldBorder = AppColors.gold.withValues(alpha: 0.28);
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(4),
      borderSide: BorderSide(color: goldBorder),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AuthFieldLabel(label: 'auth.mobileNumber'.tr()),
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
          child: IntlPhoneField(
            controller: controller,
            initialCountryCode: 'BD',
            disableLengthCheck: true,
            dropdownTextStyle: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
            ),
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
              fontSize: 16,
            ),
            dropdownIcon: const Icon(
              Icons.arrow_drop_down,
              color: Colors.white,
            ),
            decoration: InputDecoration(
              hintText: 'Enter phone number',
              hintStyle: AppTheme.bodyMedium.copyWith(
                color: const Color(0xFF808080),
                fontSize: 16,
              ),
              filled: true,
              fillColor: const Color(0xFF0E0E0E),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 13,
              ),
              enabledBorder: border,
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(
                  color: AppColors.gold.withValues(alpha: 0.55),
                ),
              ),
              border: border,
            ),
            onChanged: (phone) => onNumberChanged(phone.number),
            onCountryChanged: (country) => onCountryChanged(country.dialCode),
          ),
        ),
      ],
    );
  }
}
