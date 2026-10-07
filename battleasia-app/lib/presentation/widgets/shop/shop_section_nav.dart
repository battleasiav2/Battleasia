import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/earn/earn_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/wallet/wallet_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth.dart';

/// Shop-area footer — Shop / Wallet / Transfer. Withdraw lives inside Wallet.
class ShopSectionNav extends StatelessWidget {
  const ShopSectionNav({super.key, this.active = ShopNavTab.shop});

  final ShopNavTab active;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    final items = <({ShopNavTab tab, String label, IconData icon})>[
      (tab: ShopNavTab.play, label: 'nav.play'.tr(), icon: Icons.sports_esports_outlined),
      (tab: ShopNavTab.shop, label: 'nav.shop'.tr(), icon: Icons.storefront_outlined),
      (tab: ShopNavTab.earn, label: 'nav.earn'.tr(), icon: Icons.bolt_outlined),
      (tab: ShopNavTab.transfer, label: 'nav.transfer'.tr(), icon: Icons.swap_horiz_rounded),
      (tab: ShopNavTab.feed, label: 'nav.feed'.tr(), icon: Icons.dynamic_feed_outlined),
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
                  child: AnimatedScale(
                    scale: isActive ? 1 : 0.96,
                    duration: const Duration(milliseconds: 280),
                    curve: Curves.easeOutCubic,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 280),
                      curve: Curves.easeOutCubic,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      decoration: BoxDecoration(
                        color: isActive ? AppColors.gold.withValues(alpha: 0.16) : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isActive ? AppColors.gold.withValues(alpha: 0.55) : Colors.transparent,
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            item.icon,
                            size: 20,
                            color: isActive ? AppColors.gold : const Color(0xFFA5A7AE),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTheme.bodyMedium.copyWith(
                              color: isActive ? AppColors.gold : const Color(0xFFA5A7AE),
                              fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                              fontSize: 10,
                              letterSpacing: 0.3,
                              decoration: TextDecoration.none,
                            ),
                          ),
                        ],
                      ),
                    ),
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
      case ShopNavTab.play:
        openShopRoute(context, const PlayScreen(), routeName: '/play');
        break;
      case ShopNavTab.shop:
        openShopRoute(context, const ShopScreen(), routeName: '/shop');
        break;
      case ShopNavTab.earn:
        openShopRoute(context, const EarnScreen(), routeName: '/earn');
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
      case ShopNavTab.feed:
        openShopRoute(context, const FeedScreen(), routeName: '/feed');
        break;
      case ShopNavTab.withdraw:
        openShopRoute(
          context,
          const WalletScreen(fromShop: true),
          routeName: '/shop/wallet',
        );
        break;
    }
  }
}

enum ShopNavTab { play, shop, earn, transfer, feed, wallet, withdraw }
