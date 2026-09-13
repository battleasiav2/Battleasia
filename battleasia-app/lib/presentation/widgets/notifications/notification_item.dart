import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/time_utils.dart';
import 'package:battleasia_app/data/models/notification_model.dart';

/// Flat horizontal row — matches web NotificationItem (no nested glass).
class NotificationItem extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback? onMarkRead;
  final bool isLast;

  const NotificationItem({
    super.key,
    required this.notification,
    this.onMarkRead,
    this.isLast = false,
  });

  String get _titleText {
    if (notification.subject != null && notification.subject!.isNotEmpty) {
      return notification.subject!;
    }
    return _stripHtml(notification.title).isNotEmpty
        ? _stripHtml(notification.title)
        : notification.category;
  }

  String? get _previewText {
    if (notification.subject != null && notification.subject!.isNotEmpty) {
      final preview = _stripHtml(notification.title);
      return preview.isEmpty ? null : preview;
    }
    return null;
  }

  static String _stripHtml(String html) =>
      html.replaceAll(RegExp(r'<[^>]*>'), ' ').replaceAll(RegExp(r'\s+'), ' ').trim();

  @override
  Widget build(BuildContext context) {
    final metaBits = [
      TimeUtils.timeAgo(notification.createdAt),
      notification.category,
      if (_previewText != null) _previewText!,
    ];

    return InkWell(
      onTap: onMarkRead,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: notification.isUnRead
              ? AppColors.gold.withValues(alpha: 0.04)
              : Colors.transparent,
          border: Border(
            bottom: BorderSide(
              color: Colors.white.withValues(alpha: isLast ? 0 : 0.08),
            ),
          ),
        ),
        child: Row(
          children: [
            _buildThumb(),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _titleText.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.bodyMedium.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      if (notification.isUnRead) ...[
                        const SizedBox(width: 8),
                        Text(
                          'UNREAD',
                          style: TextStyle(
                            color: AppColors.info,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    metaBits.join(' · '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTheme.bodySmall.copyWith(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (notification.isUnRead) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.info,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildThumb() {
    const size = 44.0;
    final border = Border.all(color: Colors.white.withValues(alpha: 0.1));

    if (ImageUtils.isBase64DataUri(notification.avatarUrl)) {
      final bytes = ImageUtils.decodeBase64DataUri(notification.avatarUrl!);
      if (bytes != null) {
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(border: border),
          child: Image.memory(bytes, fit: BoxFit.cover),
        );
      }
    }

    final resolvedUrl = ImageUtils.getImageUrl(notification.avatarUrl);
    if (resolvedUrl != null && resolvedUrl.isNotEmpty) {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(border: border),
        child: Image.network(
          resolvedUrl,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _defaultThumb(size, border),
        ),
      );
    }

    return _defaultThumb(size, border);
  }

  Widget _defaultThumb(double size, Border border) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        border: border,
      ),
      child: Icon(Icons.notifications, size: 20, color: AppColors.gold),
    );
  }
}
