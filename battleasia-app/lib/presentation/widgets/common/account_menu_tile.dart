import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Aurora Edge profile drawer link — flat list row with optional icon.
class AccountMenuTile extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool nested;
  final bool active;
  final IconData? icon;

  const AccountMenuTile({
    super.key,
    required this.label,
    required this.onTap,
    this.nested = false,
    this.active = false,
    this.icon,
  });

  /// Expandable section wrapper (Account submenu).
  static Widget shell({
    required Widget child,
    VoidCallback? onTap,
    bool nested = false,
    bool active = false,
    EdgeInsetsGeometry? margin,
  }) {
    return Padding(
      padding: margin ?? EdgeInsets.only(left: nested ? 12 : 0, bottom: 0),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: child,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (nested) {
      return InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 18,
                  color: active
                      ? AppColors.gold
                      : Colors.white.withValues(alpha: 0.55),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    color: active
                        ? Colors.white
                        : Colors.white.withValues(alpha: 0.72),
                    fontWeight: active ? FontWeight.w800 : FontWeight.w600,
                    fontSize: 13,
                    letterSpacing: 0.6,
                    height: 1.2,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(0, 10, 8, 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: active ? AppColors.gold : Colors.transparent,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: active
                      ? Colors.white
                      : Colors.white.withValues(alpha: 0.72),
                  fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                  fontSize: 20,
                  height: 1.25,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
