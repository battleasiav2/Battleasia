import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_coin_transfer_panel.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_section_nav.dart';

/// Shop wallet tab — user-to-user BAC transfer (web `/user/shop/wallet` parity).
class ShopWalletScreen extends StatefulWidget {
  const ShopWalletScreen({super.key});

  @override
  State<ShopWalletScreen> createState() => _ShopWalletScreenState();
}

class _ShopWalletScreenState extends State<ShopWalletScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ShopAuthGate(
      afterLoginScreen: const ShopWalletScreen(),
      child: Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Stack(
          fit: StackFit.expand,
          children: [
            CustomScrollView(
              controller: _scrollController,
              slivers: [
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(context, baseSize: 100).clamp(80, 100),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: ResponsiveUtils.getResponsiveSpacing(context, baseSize: 16).clamp(12, 16),
                    ),
                    child: Column(
                      children: [
                        const ShopSectionNav(current: ShopSectionTab.wallet),
                        const SizedBox(height: 16),
                        const ShopCoinTransferPanel(),
                        SizedBox(
                          height: ResponsiveUtils.getResponsiveSpacing(context, baseSize: 80).clamp(60, 80),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: AppHeader(scrollController: _scrollController),
            ),
            const FloatingBottomNav(),
          ],
        ),
      ),
    );
  }
}
