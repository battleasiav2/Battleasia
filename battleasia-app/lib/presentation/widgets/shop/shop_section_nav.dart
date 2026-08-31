import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_withdrawal_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';

/// Store section tabs — matches web shop nav: Shop / Wallet / Withdrawal.
enum ShopSectionTab { shop, wallet, withdrawal }

class ShopSectionNav extends StatelessWidget {
  final ShopSectionTab current;

  const ShopSectionNav({super.key, required this.current});

  void _go(BuildContext context, ShopSectionTab tab) {
    if (tab == current) return;

    final Widget page;
    switch (tab) {
      case ShopSectionTab.shop:
        page = const ShopScreen();
        break;
      case ShopSectionTab.wallet:
        page = const ShopWalletScreen();
        break;
      case ShopSectionTab.withdrawal:
        page = const ShopWithdrawalScreen();
        break;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => page),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      (ShopSectionTab.shop, 'shop.tabShop'.tr(), Icons.storefront_outlined),
      (ShopSectionTab.wallet, 'shop.tabWallet'.tr(), Icons.account_balance_wallet_outlined),
      (ShopSectionTab.withdrawal, 'shop.tabWithdraw'.tr(), Icons.payments_outlined),
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.18)),
      ),
      child: Row(
        children: tabs.map((t) {
          final selected = t.$1 == current;
          return Expanded(
            child: InkWell(
              onTap: () => _go(context, t.$1),
              borderRadius: BorderRadius.circular(2),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.gold.withValues(alpha: 0.16)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(2),
                  border: Border.all(
                    color: selected ? AppColors.gold : Colors.transparent,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      t.$3,
                      size: 18,
                      color: selected ? AppColors.gold : AppColors.textMuted,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      t.$2,
                      style: AppTheme.bodySmall.copyWith(
                        fontSize: 11,
                        fontWeight:
                            selected ? FontWeight.w800 : FontWeight.w500,
                        color: selected ? AppColors.gold : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
