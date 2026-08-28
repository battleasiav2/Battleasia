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

  static const _flagEmoji = {
    'en': '🇺🇸',
    'bn': '🇧🇩',
    'zh': '🇨🇳',
    'hi': '🇮🇳',
    'ur': '🇵🇰',
  };

  @override
  Widget build(BuildContext context) {
    final code = context.locale.languageCode;
    final current = code.toUpperCase();
    final flag = _flagEmoji[code] ?? '🌐';

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
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(flag, style: const TextStyle(fontSize: 14, height: 1)),
            const SizedBox(width: 6),
            Text(
              current,
              style: AppTheme.bodySmall.copyWith(
                color: Colors.white.withValues(alpha: 0.88),
                fontWeight: FontWeight.w600,
                fontSize: 13,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
