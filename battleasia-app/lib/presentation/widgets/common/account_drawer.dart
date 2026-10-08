import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:typed_data';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/providers/accent_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/widgets/common/account_menu_tile.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/account/account_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/bac_gate_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_withdrawal_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth.dart';
import 'package:battleasia_app/presentation/screens/earn/earn_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/screens/labs/labs_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/wallet/wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/my_matches/my_matches_screen.dart';
import 'package:battleasia_app/presentation/screens/my_orders/my_orders_screen.dart';
import 'package:battleasia_app/presentation/screens/my_statistics/my_statistics_screen.dart';
import 'package:battleasia_app/presentation/screens/my_referrals/my_referrals_screen.dart';
import 'package:battleasia_app/presentation/screens/notifications/notifications_screen.dart';
import 'package:battleasia_app/presentation/screens/leaderboard/leaderboard_screen.dart';
import 'package:battleasia_app/presentation/screens/legal/legal_screen.dart';
import 'package:battleasia_app/presentation/screens/customer_support/customer_support_screen.dart';

class AccountDrawer extends StatelessWidget {
  const AccountDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;
        final displayName = user?.username ?? user?.email ?? 'account.user'.tr();
        final email = user?.email ?? '';
        final avatarUrl = ImageUtils.getImageUrl(user?.avatar);
        final pendingFile = authProvider.pendingAvatarFile;

        // Responsive avatar size for header icon
        final avatarSize = ResponsiveUtils.getResponsiveSpacing(
          context,
          baseSize: 22.0,
        ).clamp(20.0, 26.0);
        final avatarFontSize = ResponsiveUtils.getResponsiveFontSize(
          context,
          baseSize: 18.0,
          min: 16.0,
          max: 20.0,
        );

        // If user just picked a new image, show it immediately via FileImage
        final Widget avatarIcon = pendingFile != null
            ? CircleAvatar(
                radius: avatarSize,
                backgroundColor: AppColors.gold,
                backgroundImage: FileImage(pendingFile),
              )
            : _buildAvatarWidget(
                avatarUrl: (avatarUrl != null && avatarUrl.isNotEmpty)
                    ? avatarUrl
                    : null,
                radius: avatarSize,
                displayName: displayName,
                fontSize: avatarFontSize,
              );

        return IconButton(
          onPressed: () => _showAccountDrawer(
            context,
            authProvider,
            displayName,
            email,
            avatarUrl,
          ),
          icon: avatarIcon,
        );
      },
    );
  }

  /// Builds a [CircleAvatar] that correctly handles both network URLs and
  /// base64 data URI avatars (stored as "data:image/...;base64,...").
  static Widget _buildAvatarWidget({
    required String? avatarUrl,
    required double radius,
    required String displayName,
    required double fontSize,
    Color? backgroundColor,
    Color? textColor,
    FontWeight fontWeight = FontWeight.bold,
  }) {
    final bg = backgroundColor ?? AppColors.gold;
    final fg = textColor ?? Colors.black;
    final initial =
        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'U';

    if (avatarUrl == null || avatarUrl.isEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: bg,
        child: Text(
          initial,
          style: TextStyle(
            color: fg,
            fontWeight: fontWeight,
            fontSize: fontSize,
          ),
        ),
      );
    }

    if (ImageUtils.isBase64DataUri(avatarUrl)) {
      final Uint8List? bytes = ImageUtils.decodeBase64DataUri(avatarUrl);
      if (bytes == null) {
        return CircleAvatar(
          radius: radius,
          backgroundColor: bg,
          child: Text(
            initial,
            style: TextStyle(
              color: fg,
              fontWeight: fontWeight,
              fontSize: fontSize,
            ),
          ),
        );
      }
      return CircleAvatar(
        radius: radius,
        backgroundColor: bg,
        backgroundImage: MemoryImage(bytes),
      );
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: bg,
      backgroundImage: NetworkImage(avatarUrl),
    );
  }

  void _showAccountDrawer(
    BuildContext context,
    AuthProvider authProvider,
    String displayName,
    String email,
    String? avatarUrl,
  ) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Close menu',
      barrierColor: Colors.black.withValues(alpha: 0.72),
      transitionDuration: const Duration(milliseconds: 280),
      pageBuilder: (context, _, __) => const SizedBox.shrink(),
      transitionBuilder: (context, animation, _, __) {
        final width = MediaQuery.sizeOf(context).width;
        final panelWidth = width >= 600 ? 400.0 : (width * 0.88).clamp(280.0, 360.0);

        return Align(
          alignment: Alignment.centerRight,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1, 0),
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: const Color(0xFF0B0C10),
                border: const Border(
                  left: BorderSide(color: Color(0xFF232634)),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.6),
                    blurRadius: 48,
                    offset: const Offset(-12, 0),
                  ),
                ],
              ),
              child: SizedBox(
                width: panelWidth,
                height: double.infinity,
                child: _AccountDrawerContent(
                  authProvider: authProvider,
                  displayName: displayName,
                  email: email,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AccountDrawerContent extends StatelessWidget {
  final AuthProvider authProvider;
  final String displayName;
  final String email;

  const _AccountDrawerContent({
    required this.authProvider,
    required this.displayName,
    required this.email,
  });

  @override
  Widget build(BuildContext context) {
    context.watch<AccentProvider>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Align(
          alignment: Alignment.topRight,
          child: IconButton(
            icon: Icon(Icons.close, color: Colors.white.withValues(alpha: 0.88), size: 26),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(28, 8, 24, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _HomeProfileCard(
                  displayName: displayName,
                  pubgId: authProvider.user?.pubgId ?? '',
                  balance: authProvider.user?.balance ?? 0,
                  avatarUrl: ImageUtils.getImageUrl(authProvider.user?.avatar),
                  onWalletTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        settings: const RouteSettings(name: '/wallet'),
                        builder: (context) => const WalletScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 8),
                Divider(height: 1, color: Colors.white.withValues(alpha: 0.08)),
                const SizedBox(height: 8),
                _buildExpandableAccountMenu(context),
                Divider(height: 1, color: Colors.white.withValues(alpha: 0.08)),
                const SizedBox(height: 6),
                AccountMenuTile(
                  label: 'nav.play'.tr(),
                  icon: Icons.sports_esports_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const PlayScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'nav.shop'.tr(),
                  icon: Icons.storefront_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const BacGateScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'nav.earn'.tr(),
                  icon: Icons.bolt_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        settings: const RouteSettings(name: '/earn'),
                        builder: (context) => const EarnScreen(),
                      ),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'nav.transfer'.tr(),
                  icon: Icons.swap_horiz_rounded,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        settings: const RouteSettings(name: '/transfer'),
                        builder: (context) => const ShopWalletScreen(),
                      ),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'nav.feed'.tr(),
                  icon: Icons.dynamic_feed_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const FeedScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'nav.labs'.tr(),
                  icon: Icons.science_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LabsScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.fromLTRB(
            28,
            8,
            24,
            16 + MediaQuery.of(context).padding.bottom,
          ),
          child: TextButton.icon(
            onPressed: () async {
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.pop(context);
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (context) => const SignInScreen()),
                );
              }
            },
            icon: const Icon(Icons.logout, size: 18),
            label: Text(
              'account.logout'.tr(),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFFFB7185),
              alignment: Alignment.centerLeft,
              padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 10),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExpandableAccountMenu(BuildContext context) {
    return Theme(
        data: Theme.of(context).copyWith(
          dividerColor: Colors.transparent,
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
        ),
        child: ExpansionTile(
          clipBehavior: Clip.antiAlias,
          tilePadding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
          childrenPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          collapsedBackgroundColor: Colors.transparent,
          shape: const RoundedRectangleBorder(),
          collapsedShape: const RoundedRectangleBorder(),
          title: Text(
            'account.menuAccount'.tr(),
            style: const TextStyle(
              color: Color(0xFFE8EAEE),
              fontWeight: FontWeight.w600,
              fontSize: 15,
              height: 1.2,
              decoration: TextDecoration.none,
            ),
          ),
          leading: const Icon(Icons.manage_accounts_outlined, size: 20, color: Color(0xFF9AA0AB)),
          iconColor: const Color(0xFF9AA0AB),
          collapsedIconColor: const Color(0xFF9AA0AB),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
              child: Column(
                children: [
                AccountMenuTile(
                  label: 'account.profile'.tr(),
                  nested: true,
                  icon: Icons.person_outline,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AccountScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.settings'.tr(),
                  nested: true,
                  icon: Icons.settings_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AccountScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.wallet'.tr(),
                  nested: true,
                  icon: Icons.account_balance_wallet_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        settings: const RouteSettings(name: '/wallet'),
                        builder: (context) => const WalletScreen(),
                      ),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'wallet.transferTitle'.tr(),
                  nested: true,
                  icon: Icons.swap_horiz,
                  onTap: () {
                    Navigator.pop(context);
                    openShopRoute(
                      context,
                      const ShopWalletScreen(),
                      routeName: '/shop/transfer',
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.withdraw'.tr(),
                  nested: true,
                  icon: Icons.payments_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    openShopRoute(
                      context,
                      const ShopWithdrawalScreen(),
                      routeName: '/shop/withdraw',
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.myMatches'.tr(),
                  nested: true,
                  icon: Icons.sports_esports_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MyMatchesScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.myOrders'.tr(),
                  nested: true,
                  icon: Icons.receipt_long_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MyOrdersScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.myStatistics'.tr(),
                  nested: true,
                  icon: Icons.bar_chart_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MyStatisticsScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.myReferrals'.tr(),
                  nested: true,
                  icon: Icons.group_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const MyReferralsScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.notifications'.tr(),
                  nested: true,
                  icon: Icons.notifications_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.leaderboard'.tr(),
                  nested: true,
                  icon: Icons.emoji_events_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LeaderboardScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'account.customerSupport'.tr(),
                  nested: true,
                  icon: Icons.chat_bubble_outline,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CustomerSupportScreen(),
                      ),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'legal.privacyTitle'.tr(),
                  nested: true,
                  icon: Icons.privacy_tip_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LegalScreen.privacy()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'legal.termsTitle'.tr(),
                  nested: true,
                  icon: Icons.gavel_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LegalScreen.terms()),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Home Pulse-style profile card — matches web Command Matrix card.
class _HomeProfileCard extends StatelessWidget {
  final String displayName;
  final String pubgId;
  final double balance;
  final String? avatarUrl;
  final VoidCallback onWalletTap;

  const _HomeProfileCard({
    required this.displayName,
    required this.pubgId,
    required this.balance,
    required this.avatarUrl,
    required this.onWalletTap,
  });

  @override
  Widget build(BuildContext context) {
    final bal = balance.round().toString();

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0x6B161618),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: avatarUrl != null && avatarUrl!.isNotEmpty
                          ? Image.network(
                              avatarUrl!,
                              width: 48,
                              height: 48,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  _avatarFallback(displayName),
                            )
                          : _avatarFallback(displayName),
                    ),
                    Positioned(
                      right: -2,
                      bottom: -2,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: const Color(0xFF22C55E),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF161618),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        displayName.toUpperCase(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                          decoration: TextDecoration.none,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: AppColors.gold.withValues(alpha: 0.35),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.verified,
                                  size: 11,
                                  color: AppColors.gold,
                                ),
                                const SizedBox(width: 3),
                                Text(
                                  'VERIFIED',
                                  style: TextStyle(
                                    color: AppColors.gold,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.6,
                                    decoration: TextDecoration.none,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (pubgId.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                'ID: $pubgId',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.48),
                                  fontSize: 10.5,
                                  fontFamily: 'monospace',
                                  decoration: TextDecoration.none,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Icon(Icons.monetization_on, size: 18, color: AppColors.gold),
                const SizedBox(width: 6),
                Text(
                  '$bal BAC',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    decoration: TextDecoration.none,
                  ),
                ),
                const Spacer(),
                OutlinedButton(
                  onPressed: onWalletTap,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.gold,
                    side: BorderSide(
                      color: AppColors.gold.withValues(alpha: 0.45),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'WALLET HUB >',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.6,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _avatarFallback(String name) {
    return Container(
      width: 48,
      height: 48,
      alignment: Alignment.center,
      color: const Color(0xFF0A0A0A),
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: 18,
        ),
      ),
    );
  }
}
