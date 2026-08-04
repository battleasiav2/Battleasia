import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class LocaleToggle extends StatelessWidget {
  const LocaleToggle({super.key});

  static const _langs = [
    (Locale('en'), 'English', 'EN'),
    (Locale('bn'), 'বাংলা', 'BN'),
    (Locale('zh'), '中文', 'ZH'),
    (Locale('hi'), 'हिन्दी', 'HI'),
    (Locale('ur'), 'اردو', 'UR'),
  ];

  @override
  Widget build(BuildContext context) {
    final current = context.locale.languageCode.toUpperCase();

    return PopupMenuButton<Locale>(
      tooltip: 'Language',
      onSelected: (locale) => context.setLocale(locale),
      offset: const Offset(0, 36),
      color: AppColors.surfaceElevated,
      itemBuilder: (context) => _langs
          .map(
            (lang) => PopupMenuItem<Locale>(
              value: lang.$1,
              child: Row(
                children: [
                  SizedBox(
                    width: 28,
                    child: Text(
                      lang.$3,
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Text(
                    lang.$2,
                    style: AppTheme.bodySmall.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: context.locale.languageCode == lang.$1.languageCode
                          ? FontWeight.w800
                          : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Text(
          current,
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.gold,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}
