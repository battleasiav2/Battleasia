import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class MessagingProviderModel {
  MessagingProviderModel({
    required this.id,
    required this.label,
    required this.type,
    required this.enabled,
    required this.url,
    this.openInNewTab = true,
  });

  final String id;
  final String label;
  final String type;
  final bool enabled;
  final String url;
  final bool openInNewTab;

  factory MessagingProviderModel.fromJson(Map<String, dynamic> json) {
    return MessagingProviderModel(
      id: json['id']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      enabled: json['enabled'] == true,
      url: json['url']?.toString() ?? '',
      openInNewTab: json['openInNewTab'] != false,
    );
  }
}

class MessagingSettingsModel {
  MessagingSettingsModel({
    required this.builtinEnabled,
    required this.providers,
  });

  final bool builtinEnabled;
  final List<MessagingProviderModel> providers;

  factory MessagingSettingsModel.fromJson(Map<String, dynamic>? json) {
    final raw = json ?? {};
    final list = raw['providers'] as List? ?? [];
    return MessagingSettingsModel(
      builtinEnabled: raw['builtinEnabled'] != false,
      providers: list
          .map((e) => MessagingProviderModel.fromJson(e as Map<String, dynamic>))
          .where((p) => p.enabled)
          .toList(),
    );
  }

  List<MessagingProviderModel> get externalProviders =>
      providers.where((p) => p.type != 'builtin').toList();
}

class ExternalMessagingPanel extends StatelessWidget {
  const ExternalMessagingPanel({
    super.key,
    required this.settings,
  });

  final MessagingSettingsModel settings;

  @override
  Widget build(BuildContext context) {
    final external = settings.externalProviders;
    if (external.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Text(
            'messages.externalUnavailable'.tr(),
            textAlign: TextAlign.center,
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.chat_rounded, size: 48, color: AppColors.gold.withValues(alpha: 0.8)),
          const SizedBox(height: 12),
          Text(
            'messages.externalTitle'.tr(),
            style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'messages.externalDesc'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ...external.map(
            (p) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: OutlinedButton.icon(
                onPressed: () async {
                  final uri = Uri.tryParse(p.url);
                  if (uri != null) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.open_in_new, size: 18),
                label: Text('messages.openProvider'.tr(namedArgs: {'provider': p.label})),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
