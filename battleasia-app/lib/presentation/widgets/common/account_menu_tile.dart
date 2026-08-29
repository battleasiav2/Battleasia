import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Aurora Edge profile drawer link — gold dot prefix + hairline stack.
class AccountMenuTile extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool nested;
  final bool active;

  const AccountMenuTile({
    super.key,
    required this.label,
    required this.onTap,
    this.nested = false,
    this.active = false,
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
    final fontSize = nested ? 16.0 : 20.0;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.fromLTRB(
          nested ? 16 : 0,
          nested ? 8 : 10,
          8,
          nested ? 8 : 10,
        ),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: AppColors.gold.withValues(alpha: 0.1),
            ),
          ),
        ),
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
                      : Colors.white.withValues(alpha: 0.55),
                  fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                  fontSize: fontSize,
                  height: 1.25,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
