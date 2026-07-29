import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:typed_data';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/account/account_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
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
        final displayName = user?.username ?? user?.email ?? 'User';
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
                backgroundColor: AppTheme.accentColor,
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
    final bg = backgroundColor ?? AppTheme.accentColor;
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
      backgroundColor: AppTheme.surfaceColor,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
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
            color: AppTheme.textSecondary.withOpacity(0.3),
            borderRadius: BorderRadius.circular(2),
          ),
        ),

        // Close button
        Align(
          alignment: Alignment.topRight,
          child: IconButton(
            icon: const Icon(Icons.close, color: AppTheme.textPrimary),
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
                  // Avatar section
                  AccountDrawer._buildAvatarWidget(
                    avatarUrl: avatarUrl,
                    radius: avatarSize,
                    displayName: displayName,
                    fontSize: avatarFontSize,
                    textColor: Colors.black,
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
                      fontWeight: FontWeight.bold,
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
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 32.0,
                    ).clamp(24.0, 40.0),
                  ),

                  // Menu items - Based on web menu-items-config.tsx
                  // Account (with children)
                  _buildExpandableAccountMenu(context),
                  const Divider(color: AppTheme.textSecondary, height: 1),

                  // Play
                  _buildMenuItem(
                    context,
                    icon: Icons.sports_esports,
                    label: 'Play',
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
                  const Divider(color: AppTheme.textSecondary, height: 1),

                  // Shop
                  _buildMenuItem(
                    context,
                    icon: Icons.shopping_bag,
                    label: 'Shop',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ShopScreen(),
                        ),
                      );
                    },
                  ),
                  const Divider(color: AppTheme.textSecondary, height: 1),

                  // Referral
                  _buildMenuItem(
                    context,
                    icon: Icons.people,
                    label: 'Referral',
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
                  const Divider(color: AppTheme.textSecondary, height: 1),

                  // Feed
                  _buildMenuItem(
                    context,
                    icon: Icons.article,
                    label: 'Feed',
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
                  const SizedBox(height: 24),

                  // Sign out button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
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
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: EdgeInsets.symmetric(
                          vertical: ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 16.0,
                          ).clamp(12.0, 20.0),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Logout',
                        style: AppTheme.bodyLarge.copyWith(
                          fontSize: buttonFontSize,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
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

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    return ListTile(
      leading: Icon(icon, color: AppTheme.textPrimary, size: iconSize),
      title: Text(
        label,
        style: AppTheme.bodyLarge.copyWith(
          fontSize: bodyFontSize,
          color: AppTheme.textPrimary,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: AppTheme.textSecondary,
        size: iconSize,
      ),
      onTap: onTap,
    );
  }

  Widget _buildExpandableAccountMenu(BuildContext context) {
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    return ExpansionTile(
      leading: Icon(Icons.person, color: AppTheme.textPrimary, size: iconSize),
      title: Text(
        'Account',
        style: AppTheme.bodyLarge.copyWith(
          fontSize: bodyFontSize,
          color: AppTheme.textPrimary,
        ),
      ),
      iconColor: AppTheme.textSecondary,
      collapsedIconColor: AppTheme.textSecondary,
      children: [
        // Profile
        _buildChildMenuItem(
          context,
          icon: Icons.person_outline,
          label: 'Profile',
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const AccountScreen()),
            );
          },
        ),
        // Wallet
        _buildChildMenuItem(
          context,
          icon: Icons.account_balance_wallet,
          label: 'Wallet',
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const WalletScreen()),
            );
          },
        ),
        // My Matches
        _buildChildMenuItem(
          context,
          icon: Icons.sports_esports,
          label: 'My Matches',
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const MyMatchesScreen()),
            );
          },
        ),
        // My Orders
        _buildChildMenuItem(
          context,
          icon: Icons.shopping_bag,
          label: 'My Orders',
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const MyOrdersScreen()),
            );
          },
        ),
        // My Statistics
        _buildChildMenuItem(
          context,
          icon: Icons.bar_chart,
          label: 'My Statistics',
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
        // My Referrals
        _buildChildMenuItem(
          context,
          icon: Icons.people,
          label: 'My Referrals',
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
        // Notifications
        _buildChildMenuItem(
          context,
          icon: Icons.notifications,
          label: 'Notifications',
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
        // Leader Board
        _buildChildMenuItem(
          context,
          icon: Icons.emoji_events,
          label: 'Leader Board',
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
        // Customer Support
        _buildChildMenuItem(
          context,
          icon: Icons.support_agent,
          label: 'Customer Support',
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
    );
  }

  Widget _buildChildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);
    final horizontalPadding = isMobile ? 24.0 : 40.0;

    return ListTile(
      leading: Icon(icon, color: AppTheme.textPrimary, size: iconSize),
      title: Text(
        label,
        style: AppTheme.bodyMedium.copyWith(
          fontSize: labelFontSize,
          color: AppTheme.textPrimary,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: AppTheme.textSecondary,
        size: iconSize,
      ),
      onTap: onTap,
      contentPadding: EdgeInsets.symmetric(
        horizontal: horizontalPadding,
        vertical: ResponsiveUtils.getResponsiveSpacing(
          context,
          baseSize: 4.0,
        ).clamp(2.0, 6.0),
      ),
      dense: true,
    );
  }
}
