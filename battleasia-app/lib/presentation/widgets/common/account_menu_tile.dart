import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Demo 1 — flat auth-card nav row: #161618 + 4px gold left bar, no glow.
class AccountMenuTile extends StatelessWidget {
  static const Color _cardBg = Color(0xF0161618);
  static const double _radius = 8;
  static const double _goldBarWidth = 4;

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool nested;
  final bool showChevron;
  final bool active;

  const AccountMenuTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.nested = false,
    this.showChevron = true,
    this.active = false,
  });

  static Widget shell({
    required Widget child,
    VoidCallback? onTap,
    bool nested = false,
    bool active = false,
    EdgeInsetsGeometry? margin,
  }) {
    final borderColor = active
        ? AppColors.gold.withValues(alpha: 0.35)
        : Colors.white.withValues(alpha: 0.08);

    return Padding(
      padding: margin ?? EdgeInsets.only(left: nested ? 12 : 0, bottom: 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(_radius),
        child: Material(
          color: _cardBg,
          child: InkWell(
            onTap: onTap,
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: borderColor),
                borderRadius: BorderRadius.circular(_radius),
              ),
              child: IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      width: _goldBarWidth,
                      color: AppColors.gold,
                    ),
                    Expanded(child: child),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final iconColor = Colors.white.withValues(alpha: 0.88);
    final iconSize = nested ? 20.0 : 22.0;

    return shell(
      onTap: onTap,
      nested: nested,
      active: active,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: nested ? 12 : 14,
          vertical: nested ? 11 : 13,
        ),
        child: Row(
          children: [
            Icon(icon, size: iconSize, color: iconColor),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: nested ? 14 : 15,
                ),
              ),
            ),
            if (showChevron)
              Icon(
                Icons.chevron_right,
                color: Colors.white.withValues(alpha: 0.42),
                size: nested ? 18 : 20,
              ),
          ],
        ),
      ),
    );
  }
}
