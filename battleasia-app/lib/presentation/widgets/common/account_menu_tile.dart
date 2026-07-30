import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class AccountMenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool nested;
  final bool showChevron;

  const AccountMenuTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.nested = false,
    this.showChevron = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: nested ? 12 : 0,
        bottom: 8,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(2),
          child: Ink(
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated.withValues(alpha: nested ? 0.6 : 0.85),
              borderRadius: BorderRadius.circular(2),
              border: Border.all(color: AppColors.border(0.12)),
            ),
            padding: EdgeInsets.symmetric(
              horizontal: nested ? 14 : 16,
              vertical: nested ? 12 : 14,
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: nested ? 20 : 22,
                  color: AppColors.goldAccent,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    label,
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (showChevron)
                  Icon(
                    Icons.chevron_right,
                    color: AppColors.textMuted,
                    size: nested ? 18 : 20,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
