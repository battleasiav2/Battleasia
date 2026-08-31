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
          baseSize: 18.0,
        ).clamp(16.0, 22.0);
        final avatarFontSize = ResponsiveUtils.getResponsiveFontSize(
          context,
          baseSize: 16.0,
          min: 14.0,
          max: 18.0,
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
                gradient: const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF0C0C0E), Colors.black],
                ),
                border: Border(
                  left: BorderSide(
                    color: AppColors.gold.withValues(alpha: 0.12),
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
                if (displayName.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Text(
                      displayName,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.42),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
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
          padding: const EdgeInsets.fromLTRB(28, 0, 24, 28),
          child: TextButton(
            onPressed: () async {
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.pop(context);
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (context) => const SignInScreen()),
                );
              }
            },
            style: TextButton.styleFrom(
              alignment: Alignment.centerLeft,
              foregroundColor: Colors.white.withValues(alpha: 0.55),
              padding: EdgeInsets.zero,
            ),
            child: Text(
              'account.logout'.tr(),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExpandableAccountMenu(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.gold.withValues(alpha: 0.1)),
        ),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
          dividerColor: Colors.transparent,
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
        ),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
          childrenPadding: const EdgeInsets.only(left: 4, bottom: 4),
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
                  ),
                ),
              ),
            ],
          ),
        iconColor: Colors.white.withValues(alpha: 0.42),
        collapsedIconColor: Colors.white.withValues(alpha: 0.42),
        children: [
          AccountMenuTile(
            label: 'account.profile'.tr(),
            nested: true,
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
            onTap: () {
              Navigator.pop(context);
              openShopRoute(
                context,
                const ShopWalletScreen(),
                routeName: '/shop/wallet',
              );
            },
          ),
          AccountMenuTile(
            label: 'account.withdraw'.tr(),
            nested: true,
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
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CustomerSupportScreen()),
              );
            },
          ),
        ],
        ),
      ),
    );
  }
}
