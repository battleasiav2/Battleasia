import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

class PlayTabs extends StatelessWidget {
  final List<Map<String, String>> tabs;
  final String activeTab;
  final Function(String) onTabChanged;
  final double? fontSize;

  const PlayTabs({
    super.key,
    required this.tabs,
    required this.activeTab,
    required this.onTabChanged,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    final responsiveFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    final tabFontSize = fontSize ?? responsiveFontSize;

    final verticalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.border(0.12)),
        ),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isActive = activeTab == tab['value'];
          return Expanded(
            child: InkWell(
              onTap: () => onTabChanged(tab['value']!),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: EdgeInsets.symmetric(vertical: verticalPadding),
                decoration: BoxDecoration(
                  color: isActive
                      ? AppColors.surfaceElevated.withValues(alpha: 0.6)
                      : Colors.transparent,
                  border: isActive
                      ? const Border(
                          bottom: BorderSide(color: AppColors.gold, width: 2),
                        )
                      : null,
                ),
                child: Text(
                  tab['label'] ?? '',
                  textAlign: TextAlign.center,
                  style: AppTheme.bodyLarge.copyWith(
                    color: isActive ? AppColors.gold : AppColors.textMuted,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    fontSize: tabFontSize,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
