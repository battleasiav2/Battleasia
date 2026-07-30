import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

enum FeedHubSection { feed, explore, reels, saved, messages }

class FeedHubTabs extends StatelessWidget {
  final FeedHubSection active;
  final ValueChanged<FeedHubSection> onChanged;

  const FeedHubTabs({
    super.key,
    required this.active,
    required this.onChanged,
  });

  static const _tabs = [
    (FeedHubSection.feed, Icons.home_outlined, 'feedHub.feed'),
    (FeedHubSection.explore, Icons.search, 'feedHub.explore'),
    (FeedHubSection.reels, Icons.play_circle_outline, 'feedHub.reels'),
    (FeedHubSection.saved, Icons.bookmark_outline, 'feedHub.saved'),
    (FeedHubSection.messages, Icons.chat_bubble_outline, 'feedHub.messages'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.9),
        border: Border(bottom: BorderSide(color: AppColors.border(0.14))),
      ),
      child: Row(
        children: _tabs.map((tab) {
          final isActive = active == tab.$1;
          return Expanded(
            child: InkWell(
              onTap: () => onChanged(tab.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isActive ? AppColors.gold : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tab.$2,
                      size: 22,
                      color: isActive ? AppColors.gold : AppColors.textMuted,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tab.$3.tr().toUpperCase(),
                      style: AppTheme.bodySmall.copyWith(
                        fontSize: 9,
                        fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                        letterSpacing: 0.6,
                        color: isActive ? AppColors.gold : AppColors.textMuted,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
