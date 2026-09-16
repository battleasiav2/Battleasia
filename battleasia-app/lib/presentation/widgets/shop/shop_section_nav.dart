import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_withdrawal_screen.dart';
import 'package:battleasia_app/presentation/screens/wallet/wallet_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth.dart';

/// Shop-area footer — Shop / Wallet / Transfer / Withdraw (web shop parity).
class ShopSectionNav extends StatelessWidget {
  const ShopSectionNav({super.key, this.active = ShopNavTab.shop});

  final ShopNavTab active;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    final items = <({ShopNavTab tab, String label, IconData icon})>[
      (
        tab: ShopNavTab.shop,
        label: 'shop.tabShop'.tr(),
        icon: Icons.shopping_bag_outlined,
      ),
      (
        tab: ShopNavTab.wallet,
        label: 'shop.tabWallet'.tr(),
        icon: Icons.account_balance_wallet_outlined,
      ),
      (
        tab: ShopNavTab.transfer,
        label: 'shop.tabTransfer'.tr(),
        icon: Icons.swap_horiz,
      ),
      (
        tab: ShopNavTab.withdraw,
        label: 'shop.tabWithdraw'.tr(),
        icon: Icons.payments_outlined,
      ),
    ];

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: const Color(0xE8060607),
          border: Border(
            top: BorderSide(color: Colors.white.withValues(alpha: 0.09)),
          ),
        ),
        child: Padding(
          padding: EdgeInsets.fromLTRB(6, 8, 6, 8 + bottomInset),
          child: Row(
            children: items.map((item) {
              final isActive = item.tab == active;
              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => _go(context, item.tab),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        item.icon,
                        size: 20,
                        color: isActive ? AppColors.gold : AppColors.textMuted,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.bodySmall.copyWith(
                          color: isActive ? AppColors.gold : AppColors.textMuted,
                          fontWeight:
                              isActive ? FontWeight.w800 : FontWeight.w600,
                          fontSize: 10,
                          letterSpacing: 0.3,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  void _go(BuildContext context, ShopNavTab tab) {
    if (tab == active) return;
    HapticFeedback.selectionClick();
    switch (tab) {
      case ShopNavTab.shop:
        openShopRoute(context, const ShopScreen(), routeName: '/shop');
        break;
      case ShopNavTab.wallet:
        openShopRoute(
          context,
          const WalletScreen(fromShop: true),
          routeName: '/shop/wallet',
        );
        break;
      case ShopNavTab.transfer:
        openShopRoute(
          context,
          const ShopWalletScreen(),
          routeName: '/shop/transfer',
        );
        break;
      case ShopNavTab.withdraw:
        openShopRoute(
          context,
          const ShopWithdrawalScreen(),
          routeName: '/shop/withdraw',
        );
        break;
    }
  }
}

enum ShopNavTab { shop, wallet, transfer, withdraw }
