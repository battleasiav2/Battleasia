import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class LocaleToggle extends StatelessWidget {
  const LocaleToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final isBn = context.locale.languageCode == 'bn';

    return TextButton(
      onPressed: () {
        context.setLocale(isBn ? const Locale('en') : const Locale('bn'));
      },
      style: TextButton.styleFrom(
        foregroundColor: AppColors.gold,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Text(
        isBn ? 'EN' : 'বাং',
        style: AppTheme.bodySmall.copyWith(
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
