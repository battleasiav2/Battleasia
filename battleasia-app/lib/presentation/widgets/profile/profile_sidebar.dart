import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

class ActivityCard {
  final String title;
  final String subtitle;
  final String? image;
  final IconData? icon;

  ActivityCard({
    required this.title,
    required this.subtitle,
    this.image,
    this.icon,
  });
}

class ProfileSidebar extends StatelessWidget {
  final int gamesPlayed;
  final int totalKills;
  final double amountWon;
  final List<ActivityCard> activities;
  final int followers;
  final int following;
  final double? balance;
  final bool hideBalance;

  const ProfileSidebar({
    super.key,
    this.gamesPlayed = 0,
    this.totalKills = 0,
    this.amountWon = 0,
    this.activities = const [],
    this.followers = 0,
    this.following = 0,
    this.balance,
    this.hideBalance = false,
  });

  @override
  Widget build(BuildContext context) {
    // Responsive sizes
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 16.0,
      max: 24.0,
    );

    final balanceFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 16.0,
      max: 24.0,
    );

    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 20.0);

    final shareButtonIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 14.0,
    ).clamp(12.0, 14.0);

    final shareButtonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final shareButtonPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final shareButtonPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 6.0,
    ).clamp(4.0, 6.0);

    final shareButtonHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 28.0,
    ).clamp(24.0, 28.0);

    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    return Column(
      children: [
        // Account Balance Section
        if (!hideBalance && balance != null) ...[
          Card(
            color: AppTheme.surfaceColor,
            child: Padding(
              padding: EdgeInsets.all(cardPadding),
              child: Row(
                children: [
                  Flexible(
                    child: Text(
                      'Account Balance:',
                      style: AppTheme.bodyMedium.copyWith(color: Colors.black),
                    ),
                  ),
                  SizedBox(width: spacing8),
                  Image.asset(
                    'assets/images/currency.webp',
                    width: currencyIconSize,
                    height: currencyIconSize,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(
                        Icons.monetization_on,
                        color: AppTheme.accentColor,
                        size: currencyIconSize,
                      );
                    },
                  ),
                  SizedBox(width: spacing4),
                  Flexible(
                    child: Text(
                      balance!.toStringAsFixed(2),
                      style: AppTheme.heading3.copyWith(
                        fontSize: balanceFontSize,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  SizedBox(width: spacing4),
                  ElevatedButton.icon(
                    onPressed: () => _shareProfileLink(context),
                    icon: Icon(
                      Icons.link,
                      size: shareButtonIconSize,
                      color: Colors.white,
                    ),
                    label: Text(
                      'Share',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: shareButtonFontSize,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      padding: EdgeInsets.symmetric(
                        horizontal: shareButtonPaddingH,
                        vertical: shareButtonPaddingV,
                      ),
                      minimumSize: Size(0, shareButtonHeight),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: spacing8),
        ],

        // Stats Section
        Card(
          color: AppTheme.surfaceColor,
          child: Padding(
            padding: EdgeInsets.all(cardPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Stats',
                  style: AppTheme.heading3.copyWith(fontSize: titleFontSize),
                ),
                SizedBox(height: spacing16),
                _buildStatItem(
                  context: context,
                  icon: Icons.sports_esports,
                  label: 'Matches Played',
                  value: gamesPlayed.toString(),
                ),
                SizedBox(height: spacing16),
                _buildStatItem(
                  context: context,
                  icon: Icons.favorite,
                  label: 'Total Killed',
                  value: totalKills.toString(),
                ),
                SizedBox(height: spacing16),
                _buildStatItem(
                  context: context,
                  icon: Icons.monetization_on,
                  label: 'Amount Won',
                  value: amountWon.toStringAsFixed(2),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: spacing8),

        // Activity Section
        if (activities.isNotEmpty) ...[
          Card(
            color: AppTheme.surfaceColor,
            child: Padding(
              padding: EdgeInsets.all(cardPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Activity',
                    style: AppTheme.heading3.copyWith(fontSize: titleFontSize),
                  ),
                  SizedBox(height: spacing16),
                  ...activities.map(
                    (activity) => Padding(
                      padding: EdgeInsets.only(bottom: spacing12),
                      child: _buildActivityCard(context, activity),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStatItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
  }) {
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 40.0,
    ).clamp(32.0, 40.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: iconSize),
        SizedBox(width: spacing12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTheme.bodySmall.copyWith(fontSize: labelFontSize),
              ),
              Text(
                value,
                style: AppTheme.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: valueFontSize,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActivityCard(BuildContext context, ActivityCard activity) {
    final imageHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 120.0,
    ).clamp(100.0, 120.0);

    final imagePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final contentPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 48.0,
    ).clamp(40.0, 48.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final subtitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final activityIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(14.0, 16.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: imageHeight,
            width: double.infinity,
            decoration: BoxDecoration(
              image: activity.image != null
                  ? DecorationImage(
                      image: NetworkImage(
                        ImageUtils.getImageUrl(activity.image) ?? '',
                      ),
                      fit: BoxFit.cover,
                      onError: (exception, stackTrace) {},
                    )
                  : null,
              color: AppTheme.backgroundColor,
            ),
            child: activity.image == null
                ? Center(
                    child: Icon(
                      Icons.sports_esports,
                      size: iconSize,
                      color: AppTheme.textSecondary,
                    ),
                  )
                : Stack(
                    children: [
                      Positioned(
                        top: imagePadding,
                        left: imagePadding,
                        right: imagePadding,
                        child: Text(
                          activity.title,
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: titleFontSize,
                            shadows: [
                              Shadow(
                                offset: const Offset(0, 1),
                                blurRadius: 2,
                                color: Colors.black.withOpacity(0.8),
                              ),
                            ],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
          ),
          Padding(
            padding: EdgeInsets.all(contentPadding),
            child: Row(
              children: [
                if (activity.icon != null) ...[
                  Icon(
                    activity.icon,
                    size: activityIconSize,
                    color: AppTheme.textPrimary,
                  ),
                  SizedBox(width: spacing8),
                ],
                Expanded(
                  child: Text(
                    activity.subtitle,
                    style: AppTheme.bodySmall.copyWith(
                      fontSize: subtitleFontSize,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _shareProfileLink(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    final userId = user?.id ?? '';

    if (userId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to generate profile link'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // TODO: Replace with actual profile URL when available
    final profileUrl = 'https://battleasia.net/profile/$userId';
    Clipboard.setData(ClipboardData(text: profileUrl));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profile link copied to clipboard!'),
        backgroundColor: AppTheme.accentColor,
        duration: Duration(seconds: 2),
      ),
    );
  }
}
