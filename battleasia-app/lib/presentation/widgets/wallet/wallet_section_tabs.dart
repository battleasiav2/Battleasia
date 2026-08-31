import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

enum WalletSectionTab { overview, earn, history }

class WalletSectionTabs extends StatelessWidget {
  final WalletSectionTab activeTab;
  final ValueChanged<WalletSectionTab> onChanged;
  final bool showEarn;

  const WalletSectionTabs({
    super.key,
    required this.activeTab,
    required this.onChanged,
    this.showEarn = true,
  });

  @override
  Widget build(BuildContext context) {
    final tabs = <({WalletSectionTab value, String label})>[
      (value: WalletSectionTab.overview, label: 'wallet.tabOverview'.tr()),
      if (showEarn) (value: WalletSectionTab.earn, label: 'wallet.tabEarn'.tr()),
      (value: WalletSectionTab.history, label: 'wallet.tabHistory'.tr()),
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF161618).withValues(alpha: 0.55),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        children: tabs.map((tab) {
          final selected = tab.value == activeTab;
          return Expanded(
            child: InkWell(
              onTap: () => onChanged(tab.value),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: selected ? AppColors.gold : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  tab.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: selected ? AppColors.gold : AppColors.textMuted,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                    fontSize: 12.5,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
