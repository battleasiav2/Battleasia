import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:typed_data';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/widgets/common/account_menu_tile.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/account/account_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_withdrawal_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth.dart';
import 'package:battleasia_app/presentation/screens/referral/referral_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/wallet/wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/my_matches/my_matches_screen.dart';
import 'package:battleasia_app/presentation/screens/my_orders/my_orders_screen.dart';
import 'package:battleasia_app/presentation/screens/my_statistics/my_statistics_screen.dart';
import 'package:battleasia_app/presentation/screens/my_referrals/my_referrals_screen.dart';
import 'package:battleasia_app/presentation/screens/notifications/notifications_screen.dart';
import 'package:battleasia_app/presentation/screens/leaderboard/leaderboard_screen.dart';
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
                color: const Color(0xE8060607),
                border: Border(
                  left: BorderSide(
                    color: Colors.white.withValues(alpha: 0.09),
                  ),
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
                const SizedBox(height: 16),
                _buildExpandableAccountMenu(context),
                AccountMenuTile(
                  label: 'nav.play'.tr(),
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
                  onTap: () {
                    Navigator.pop(context);
                    openShopRoute(context, const ShopScreen(), routeName: '/shop');
                  },
                ),
                AccountMenuTile(
                  label: 'nav.referral'.tr(),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ReferralScreen()),
                    );
                  },
                ),
                AccountMenuTile(
                  label: 'nav.feed'.tr(),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const FeedScreen()),
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
          child: SizedBox(
            width: double.infinity,
            height: 36,
            child: OutlinedButton.icon(
              onPressed: () async {
                await authProvider.signOut();
                if (context.mounted) {
                  Navigator.pop(context);
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (context) => const SignInScreen()),
                  );
                }
              },
              icon: const Icon(Icons.logout, size: 16),
              label: Text(
                'account.logout'.tr().toUpperCase(),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFFECACA),
                backgroundColor: const Color(0x24EF4444),
                side: BorderSide(color: Colors.red.withValues(alpha: 0.55)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
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
          tilePadding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
          childrenPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          collapsedBackgroundColor: Colors.transparent,
          shape: const Border(),
          collapsedShape: const Border(),
          title: Row(
            children: [
              Container(
                width: 5,
                height: 5,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.transparent,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'account.menuAccount'.tr(),
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.55),
                    fontWeight: FontWeight.w500,
                    fontSize: 20,
                    height: 1.25,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
            ],
          ),
        iconColor: Colors.white.withValues(alpha: 0.42),
        collapsedIconColor: Colors.white.withValues(alpha: 0.42),
        children: [
          Container(
            margin: const EdgeInsets.only(left: 14, bottom: 4),
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(
                  color: AppColors.gold.withValues(alpha: 0.85),
                  width: 2,
                ),
              ),
            ),
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
