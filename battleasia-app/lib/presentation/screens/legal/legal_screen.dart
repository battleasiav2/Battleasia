import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class LegalScreen extends StatelessWidget {
  final String kind;

  const LegalScreen.privacy({super.key}) : kind = 'privacy';
  const LegalScreen.terms({super.key}) : kind = 'terms';

  static const _privacy = ['who', 'accounts', 'matches', 'payments', 'social', 'sharing', 'requests'];
  static const _terms = ['who', 'play', 'rooms', 'bac', 'earn', 'results', 'referral', 'eligibility'];

  @override
  Widget build(BuildContext context) {
    final sections = kind == 'terms' ? _terms : _privacy;
    return Scaffold(
      backgroundColor: const Color(0xFF0B0C10),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0C10),
        foregroundColor: Colors.white,
        title: Text('legal.back'.tr()),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          Text(
            'legal.${kind}Title'.tr(),
            style: AppTheme.heading2.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'legal.${kind}Body'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: Colors.white70, height: 1.45),
          ),
          const SizedBox(height: 8),
          Text(
            'legal.${kind}Intro'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: Colors.white70, height: 1.45),
          ),
          const SizedBox(height: 16),
          ...sections.map((id) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF16181F),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF232634)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'legal.$kind.$id'.tr(),
                    style: AppTheme.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'legal.$kind.${id}Body'.tr(),
                    style: AppTheme.bodySmall.copyWith(color: Colors.white70, height: 1.45),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
