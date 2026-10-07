import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/accent_provider.dart';
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
    context.watch<AccentProvider>();
    const card = Color(0xFF16181F);
    const line = Color(0xFF232634);
    final accent = AppColors.gold;
    final ink = AppColors.goldInk;
    return Padding(
      padding: EdgeInsets.only(left: nested ? 8 : 0, bottom: 10),
      child: Material(
        color: active ? accent : card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
          side: BorderSide(color: active ? accent : line),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 16, 8),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: ink,
                    shape: BoxShape.circle,
                    border: Border.all(color: active ? ink : line),
                    boxShadow: active
                        ? [BoxShadow(color: accent.withValues(alpha: 0.7), blurRadius: 12)]
                        : null,
                  ),
                  child: Icon(
                    icon ?? Icons.circle,
                    size: 18,
                    color: active ? accent : Colors.white,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    nested ? label.toUpperCase() : label,
                    style: TextStyle(
                      color: active ? ink : Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: nested ? 13 : 16,
                      letterSpacing: nested ? 0.4 : 0.1,
                      height: 1.2,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ),
                if (active)
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: ink,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
