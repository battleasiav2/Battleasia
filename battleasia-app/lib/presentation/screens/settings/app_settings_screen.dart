import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/customer_support/customer_support_screen.dart';
import 'package:battleasia_app/presentation/screens/legal/legal_screen.dart';

class AppSettingsScreen extends StatelessWidget {
  const AppSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      appBar: AppBar(
        backgroundColor: AppColors.pageBg,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text('settings.title'.tr(), style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          _SectionLabel('settings.support'.tr()),
          _Group(
            children: [
              _Row(
                icon: Icons.chat_bubble_outline,
                title: 'settings.chat'.tr(),
                subtitle: 'settings.chatLead'.tr(),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const CustomerSupportScreen()),
                  );
                },
              ),
            ],
          ),
          _SectionLabel('settings.play'.tr()),
          _Group(
            children: [
              _Row(
                icon: Icons.gavel_outlined,
                title: 'settings.rules'.tr(),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const _RulesScreen())),
              ),
              _Row(
                icon: Icons.help_outline,
                title: 'settings.faq'.tr(),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const _FaqScreen())),
              ),
            ],
          ),
          _SectionLabel('settings.legal'.tr()),
          _Group(
            children: [
              _Row(
                icon: Icons.privacy_tip_outlined,
                title: 'settings.privacy'.tr(),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LegalScreen.privacy())),
              ),
              _Row(
                icon: Icons.description_outlined,
                title: 'legal.termsTitle'.tr(),
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LegalScreen.terms())),
              ),
            ],
          ),
          _SectionLabel('settings.about'.tr()),
          _Group(
            children: [
              _Row(
                icon: Icons.smartphone_outlined,
                title: 'settings.version'.tr(),
                trailing: 'v${AppConstants.appVersion}',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RulesScreen extends StatelessWidget {
  const _RulesScreen();

  @override
  Widget build(BuildContext context) {
    return _AccordionPage(
      title: 'settings.rules'.tr(),
      lead: 'settings.rulesLead'.tr(),
      items: AppConstants.faqData
          .map((row) => (row['question'] ?? '', row['answer'] ?? ''))
          .toList(),
    );
  }
}

class _FaqScreen extends StatelessWidget {
  const _FaqScreen();

  @override
  Widget build(BuildContext context) {
    return _AccordionPage(
      title: 'settings.faq'.tr(),
      lead: 'settings.faqLead'.tr(),
      items: const [
        (
          'How fast are BAC deposits and withdrawals?',
          'Deposits usually credit within seconds after confirmation. Withdrawals go through a short security check and typically land within a few minutes.',
        ),
        (
          'How do I dispute a match result?',
          'Open a Match ticket within 15 minutes of the match ending. Include the match ID and screenshots or video of the final score.',
        ),
        (
          'What anti-cheat rules apply?',
          'Emulators where banned, injected tools, and account sharing can void a match and ban the account. Report with proof via Support.',
        ),
        (
          'Can I play on mobile and PC?',
          'Mobile tournaments require the native app. PC titles use verified desktop clients. Queues stay separate for fair play.',
        ),
      ],
    );
  }
}

class _AccordionPage extends StatelessWidget {
  final String title;
  final String lead;
  final List<(String, String)> items;

  const _AccordionPage({required this.title, required this.lead, required this.items});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      appBar: AppBar(
        backgroundColor: AppColors.pageBg,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          Text(lead, style: TextStyle(color: Colors.white.withValues(alpha: 0.55), height: 1.4)),
          const SizedBox(height: 14),
          ...items.map(
            (item) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF161618),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 14),
                  childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                  iconColor: AppColors.gold,
                  collapsedIconColor: const Color(0xFF9CA3AF),
                  title: Text(item.$1, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(item.$2, style: TextStyle(color: Colors.white.withValues(alpha: 0.72), height: 1.45)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 16, 4, 8),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFF9CA3AF),
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _Group extends StatelessWidget {
  final List<Widget> children;
  const _Group({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF161618),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(children: children),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? trailing;
  final VoidCallback? onTap;

  const _Row({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            Icon(icon, color: AppColors.gold, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                  if (subtitle != null) ...[
                    const SizedBox(height: 3),
                    Text(subtitle!, style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 12, height: 1.35)),
                  ],
                ],
              ),
            ),
            if (trailing != null)
              Text(trailing!, style: const TextStyle(color: Color(0xFF9CA3AF), fontWeight: FontWeight.w700))
            else if (onTap != null)
              const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF), size: 20),
          ],
        ),
      ),
    );
  }
}
