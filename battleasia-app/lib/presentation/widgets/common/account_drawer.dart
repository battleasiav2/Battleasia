import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:typed_data';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/account_menu_tile.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_divider.dart';
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
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => _AccountDrawerContent(
          scrollController: scrollController,
          authProvider: authProvider,
          displayName: displayName,
          email: email,
          avatarUrl: avatarUrl,
        ),
      ),
    );
  }
}

class _AccountDrawerContent extends StatelessWidget {
  final ScrollController scrollController;
  final AuthProvider authProvider;
  final String displayName;
  final String email;
  final String? avatarUrl;

  const _AccountDrawerContent({
    required this.scrollController,
    required this.authProvider,
    required this.displayName,
    required this.email,
    this.avatarUrl,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 36.0,
    );
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );
    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 20.0,
    );
    final avatarSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 48.0,
    ).clamp(40.0, 56.0);
    final avatarFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 36.0,
      min: 28.0,
      max: 44.0,
    );

    return Column(
      children: [
        // Handle bar
        Container(
          margin: const EdgeInsets.only(top: 12),
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: AppColors.textMuted.withValues(alpha: 0.35),
            borderRadius: BorderRadius.circular(2),
          ),
        ),

        Align(
          alignment: Alignment.topRight,
          child: IconButton(
            icon: const Icon(Icons.close, color: AppColors.textPrimary),
            onPressed: () => Navigator.pop(context),
          ),
        ),

        // Scrollable content
        Expanded(
          child: SingleChildScrollView(
            controller: scrollController,
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 24 : 40,
              vertical: 16,
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                children: [
                  // Avatar section — gold ring
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.gold, width: 2),
                    ),
                    child: AccountDrawer._buildAvatarWidget(
                      avatarUrl: avatarUrl,
                      radius: avatarSize,
                      displayName: displayName,
                      fontSize: avatarFontSize,
                      textColor: Colors.black,
                    ),
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 16.0,
                    ).clamp(12.0, 20.0),
                  ),

                  // Display name
                  Text(
                    displayName,
                    style: AppTheme.heading3.copyWith(
                      fontSize: titleFontSize,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 4.0,
                    ).clamp(2.0, 6.0),
                  ),

                  // Email
                  Text(
                    email,
                    style: AppTheme.bodyMedium.copyWith(
                      fontSize: bodyFontSize,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Center(child: GoldDivider(width: 140)),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 32.0,
                    ).clamp(24.0, 40.0),
                  ),

                  // Menu items - Based on web menu-items-config.tsx
                  // Account (with children)
                  _buildExpandableAccountMenu(context),

                  AccountMenuTile(
                    icon: Icons.sports_esports,
                    label: 'nav.play'.tr(),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const PlayScreen(),
                        ),
                      );
                    },
                  ),

                  AccountMenuTile(
                    icon: Icons.shopping_bag,
                    label: 'nav.shop'.tr(),
                    onTap: () {
                      Navigator.pop(context);
                      openShopRoute(context, const ShopScreen(), routeName: '/shop');
                    },
                  ),

                  AccountMenuTile(
                    icon: Icons.people,
                    label: 'nav.referral'.tr(),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ReferralScreen(),
                        ),
                      );
                    },
                  ),

                  AccountMenuTile(
                    icon: Icons.article,
                    label: 'nav.feed'.tr(),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const FeedScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 16),

                  // Sign out
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () async {
                        await authProvider.signOut();
                        if (context.mounted) {
                          Navigator.pop(context);
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (context) => const SignInScreen(),
                            ),
                          );
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red.shade300,
                        side: BorderSide(color: Colors.red.shade400.withValues(alpha: 0.6)),
                        padding: EdgeInsets.symmetric(
                          vertical: ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 16.0,
                          ).clamp(12.0, 20.0),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      child: Text(
                        'account.logout'.tr(),
                        style: AppTheme.bodyLarge.copyWith(
                          fontSize: buttonFontSize,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 24.0,
                    ).clamp(16.0, 32.0),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExpandableAccountMenu(BuildContext context) {
    return AccountMenuTile.shell(
      child: Theme(
        data: Theme.of(context).copyWith(
          dividerColor: Colors.transparent,
          splashColor: AppColors.gold.withValues(alpha: 0.08),
          highlightColor: AppColors.gold.withValues(alpha: 0.05),
        ),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
          childrenPadding: const EdgeInsets.fromLTRB(4, 0, 8, 10),
          leading: Icon(
            Icons.person,
            color: Colors.white.withValues(alpha: 0.88),
            size: 22,
          ),
          title: Text(
            'account.menuAccount'.tr(),
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
          iconColor: Colors.white.withValues(alpha: 0.42),
          collapsedIconColor: Colors.white.withValues(alpha: 0.42),
          children: [
            AccountMenuTile(
              icon: Icons.person_outline,
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
              icon: Icons.account_balance_wallet,
              label: 'account.wallet'.tr(),
              nested: true,
              onTap: () {
                Navigator.pop(context);
                openShopRoute(
                  context,
                  const WalletScreen(fromShop: true),
                  routeName: '/shop/wallet',
                );
              },
            ),
            AccountMenuTile(
              icon: Icons.payments_outlined,
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
              icon: Icons.sports_esports,
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
              icon: Icons.shopping_bag,
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
              icon: Icons.bar_chart,
              label: 'account.myStatistics'.tr(),
              nested: true,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MyStatisticsScreen(),
                  ),
                );
              },
            ),
            AccountMenuTile(
              icon: Icons.people,
              label: 'account.myReferrals'.tr(),
              nested: true,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MyReferralsScreen(),
                  ),
                );
              },
            ),
            AccountMenuTile(
              icon: Icons.notifications_active_outlined,
              label: 'account.notifications'.tr(),
              nested: true,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const NotificationsScreen(),
                  ),
                );
              },
            ),
            AccountMenuTile(
              icon: Icons.emoji_events,
              label: 'account.leaderboard'.tr(),
              nested: true,
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LeaderboardScreen(),
                  ),
                );
              },
            ),
            AccountMenuTile(
              icon: Icons.support_agent,
              label: 'account.customerSupport'.tr(),
              nested: true,
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
    );
  }
}
