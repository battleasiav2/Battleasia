import 'package:flutter/material.dart';
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
    // Responsive font size
    final responsiveFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    final tabFontSize = fontSize ?? responsiveFontSize;
    
    // Responsive padding
    final verticalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    
    // Responsive border widths
    final bottomBorderWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 1.0,
    ).clamp(0.5, 1.5);
    final activeBorderWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 2.0,
    ).clamp(1.5, 3.0);

    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: AppTheme.textSecondary.withOpacity(0.2),
            width: bottomBorderWidth,
          ),
        ),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isActive = activeTab == tab['value'];
          return Expanded(
            child: InkWell(
              onTap: () => onTabChanged(tab['value']!),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: verticalPadding),
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.surfaceColor : Colors.transparent,
                  border: isActive
                      ? Border(
                          bottom: BorderSide(
                            color: AppTheme.accentColor,
                            width: activeBorderWidth,
                          ),
                        )
                      : null,
                ),
                child: Text(
                  tab['label'] ?? '',
                  textAlign: TextAlign.center,
                  style: AppTheme.bodyLarge.copyWith(
                    color: isActive
                        ? AppTheme.textPrimary
                        : AppTheme.textSecondary,
                    fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
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
