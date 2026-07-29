import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/time_utils.dart';
import 'package:battleasia_app/data/models/notification_model.dart';

class NotificationItem extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback? onMarkRead;

  const NotificationItem({
    super.key,
    required this.notification,
    this.onMarkRead,
  });

  @override
  Widget build(BuildContext context) {
    final combinedTitle = notification.subject != null
        ? '${notification.subject}\n${notification.title}'
        : notification.title;
    
    final itemPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(16.0, 24.0);
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 6.0);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );
    final smallFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );
    final dotSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 5.0);
    final badgeSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 10.0);

    return InkWell(
      onTap: onMarkRead,
      child: Container(
        padding: EdgeInsets.all(itemPadding),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: AppTheme.textSecondary.withOpacity(0.2),
              width: 1,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar
            _buildAvatar(context),
            SizedBox(width: spacing16),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    combinedTitle,
                    style: AppTheme.bodyLarge.copyWith(
                      fontSize: titleFontSize,
                      color: Colors.black,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: spacing4),
                  // Time and Category
                  Row(
                    children: [
                      Text(
                        TimeUtils.timeAgo(notification.createdAt),
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.textSecondary,
                          fontSize: smallFontSize,
                        ),
                      ),
                      Container(
                        width: dotSize,
                        height: dotSize,
                        margin: EdgeInsets.symmetric(horizontal: spacing8),
                        decoration: BoxDecoration(
                          color: AppTheme.textSecondary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      Text(
                        notification.category,
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.textSecondary,
                          fontSize: smallFontSize,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Unread Badge
            if (notification.isUnRead)
              Container(
                width: badgeSize,
                height: badgeSize,
                margin: EdgeInsets.only(left: spacing8),
                decoration: const BoxDecoration(
                  color: AppTheme.primaryColor,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar(BuildContext context) {
    final avatarRadius = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);
    final avatarSize = avatarRadius * 2;
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    // ── 1. Base64 data URI (e.g. "data:image/jpeg;base64,…") ──────────────
    if (ImageUtils.isBase64DataUri(notification.avatarUrl)) {
      final Uint8List? bytes =
          ImageUtils.decodeBase64DataUri(notification.avatarUrl!);
      if (bytes != null) {
        return CircleAvatar(
          radius: avatarRadius,
          backgroundColor: AppTheme.textSecondary.withOpacity(0.1),
          backgroundImage: MemoryImage(bytes),
        );
      }
    }

    // ── 2. Regular HTTP / HTTPS URL ────────────────────────────────────────
    final resolvedUrl = ImageUtils.getImageUrl(notification.avatarUrl);
    if (resolvedUrl != null && resolvedUrl.isNotEmpty) {
      return CircleAvatar(
        radius: avatarRadius,
        backgroundColor: AppTheme.textSecondary.withOpacity(0.1),
        child: ClipOval(
          child: Image.network(
            resolvedUrl,
            width: avatarSize,
            height: avatarSize,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _buildDefaultAvatar(
              avatarSize: avatarSize,
              iconSize: iconSize,
            ),
          ),
        ),
      );
    }

    // ── 3. No avatar — branded default ────────────────────────────────────
    return _buildDefaultAvatar(avatarSize: avatarSize, iconSize: iconSize);
  }

  /// Branded default avatar: gradient circle with a notification bell icon.
  Widget _buildDefaultAvatar({
    required double avatarSize,
    required double iconSize,
  }) {
    return Container(
      width: avatarSize,
      height: avatarSize,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: AppTheme.accentGradient,
      ),
      child: Icon(
        Icons.notifications,
        size: iconSize,
        color: Colors.white,
      ),
    );
  }
}

