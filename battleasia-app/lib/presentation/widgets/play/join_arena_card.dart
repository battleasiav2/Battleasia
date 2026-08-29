import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

enum JoinArenaCardAccent { gold, success, error }

class JoinArenaCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final JoinArenaCardAccent accent;

  const JoinArenaCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.fromLTRB(14, 16, 14, 14),
    this.accent = JoinArenaCardAccent.gold,
  });

  static const _cardBg = Color(0xFF161618);

  Color _accentColor() {
    switch (accent) {
      case JoinArenaCardAccent.success:
        return AppColors.success;
      case JoinArenaCardAccent.error:
        return const Color(0xFFEF4444);
      case JoinArenaCardAccent.gold:
        return AppColors.gold;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _cardBg,
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(height: 2, color: _accentColor()),
          Padding(padding: padding, child: child),
        ],
      ),
    );
  }
}
