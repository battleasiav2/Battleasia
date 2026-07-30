import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/time_utils.dart';
import 'package:battleasia_app/data/models/feed_model.dart';
import 'package:battleasia_app/presentation/screens/profile/public_profile_screen.dart';

String _stripHtml(String html) {
  return html
      .replaceAll(RegExp(r'<[^>]*>'), ' ')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll(RegExp(r'\s{2,}'), ' ')
      .trim();
}

class FeedItem extends StatelessWidget {
  final FeedModel feed;
  final VoidCallback? onTap;
  final VoidCallback? onLike;
  final VoidCallback? onShare;

  const FeedItem({
    super.key,
    required this.feed,
    this.onTap,
    this.onLike,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 22.0,
    );

    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final captionFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final avatarSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 40.0,
    ).clamp(36.0, 48.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);

    final coverImageHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 200.0,
    ).clamp(150.0, 250.0);

    return Container(
      margin: EdgeInsets.only(bottom: spacing16),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.12)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(2),
          child: Padding(
            padding: EdgeInsets.all(cardPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => _openAuthor(context),
                      child: _buildAvatar(avatarSize),
                    ),
                    SizedBox(width: spacing12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _openAuthor(context),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              feed.author?.name ?? 'Unknown',
                              style: AppTheme.bodyMedium.copyWith(
                                fontSize: bodyFontSize,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (feed.createdAt != null) ...[
                              SizedBox(height: spacing8 / 2),
                              Text(
                                TimeUtils.timeAgo(feed.createdAt!),
                                style: AppTheme.bodySmall.copyWith(
                                  fontSize: captionFontSize,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                    if (feed.category != null)
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: spacing8,
                          vertical: spacing8 / 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(2),
                          border: Border.all(
                            color: AppColors.gold.withValues(alpha: 0.35),
                          ),
                        ),
                        child: Text(
                          feed.category!.name,
                          style: AppTheme.bodySmall.copyWith(
                            fontSize: captionFontSize,
                            color: AppColors.gold,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                  ],
                ),
                SizedBox(height: spacing16),
                if (feed.coverUrl.isNotEmpty)
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: Image.network(
                          ImageUtils.getImageUrl(feed.coverUrl) ?? '',
                          height: coverImageHeight,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              height: coverImageHeight,
                              color: AppColors.surface,
                              child: Icon(
                                Icons.image_not_supported,
                                size: iconSize * 2,
                                color: AppColors.textMuted,
                              ),
                            );
                          },
                        ),
                      ),
                      if (feed.premiumOnly)
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.gold,
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Icon(
                                  Icons.workspace_premium,
                                  color: Colors.black,
                                  size: 12,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'PREMIUM',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                if (feed.coverUrl.isNotEmpty) SizedBox(height: spacing16),
                Text(
                  feed.title,
                  style: AppTheme.heading3.copyWith(
                    fontSize: titleFontSize,
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: spacing8),
                Text(
                  _stripHtml(feed.description),
                  style: AppTheme.bodyMedium.copyWith(
                    fontSize: bodyFontSize,
                    color: AppColors.textMuted,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: spacing16),
                Row(
                  children: [
                    _buildStatItem(
                      icon: Icons.visibility_outlined,
                      count: feed.totalViews,
                      iconSize: iconSize,
                      fontSize: captionFontSize,
                    ),
                    SizedBox(width: spacing16),
                    _buildStatItem(
                      icon: Icons.comment_outlined,
                      count: feed.totalComments,
                      iconSize: iconSize,
                      fontSize: captionFontSize,
                    ),
                    SizedBox(width: spacing16),
                    InkWell(
                      onTap: onLike,
                      borderRadius: BorderRadius.circular(2),
                      child: _buildStatItem(
                        icon: feed.isLiked
                            ? Icons.favorite
                            : Icons.favorite_border,
                        count: feed.totalLikes,
                        iconSize: iconSize,
                        fontSize: captionFontSize,
                        iconColor: feed.isLiked ? AppColors.error : null,
                      ),
                    ),
                    const Spacer(),
                    InkWell(
                      onTap: onShare,
                      borderRadius: BorderRadius.circular(2),
                      child: Icon(
                        Icons.share_outlined,
                        size: iconSize,
                        color: AppColors.goldAccent,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openAuthor(BuildContext context) {
    if (feed.author?.id != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PublicProfileScreen(userId: feed.author!.id),
        ),
      );
    }
  }

  Widget _buildAvatar(double size) {
    final avatarUrl = ImageUtils.getImageUrl(feed.author?.avatarUrl);
    final radius = size / 2;
    final initial = (feed.author?.name ?? 'U').substring(0, 1).toUpperCase();

    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      if (ImageUtils.isBase64DataUri(avatarUrl)) {
        final bytes = ImageUtils.decodeBase64DataUri(avatarUrl);
        if (bytes != null) {
          return CircleAvatar(
            radius: radius,
            backgroundColor: AppColors.gold,
            backgroundImage: MemoryImage(bytes),
          );
        }
      } else {
        return CircleAvatar(
          radius: radius,
          backgroundColor: AppColors.gold,
          backgroundImage: NetworkImage(avatarUrl),
        );
      }
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.gold,
      child: Text(
        initial,
        style: const TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required int count,
    required double iconSize,
    required double fontSize,
    Color? iconColor,
  }) {
    return Row(
      children: [
        Icon(icon, size: iconSize, color: iconColor ?? AppColors.textMuted),
        const SizedBox(width: 4),
        Text(
          _formatCount(count),
          style: AppTheme.bodySmall.copyWith(
            fontSize: fontSize,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }
}
