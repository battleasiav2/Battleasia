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
    final accent = AppColors.gold;
    const idle = Color(0xFF9AA0AB);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.fromLTRB(nested ? 18 : 2, 11, 4, 11),
          child: Row(
            children: [
              Icon(
                icon ?? Icons.circle,
                size: 20,
                color: active ? accent : idle,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    color: active ? Colors.white : const Color(0xFFE8EAEE),
                    fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 15,
                    height: 1.2,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
              if (active)
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(color: accent, shape: BoxShape.circle),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
