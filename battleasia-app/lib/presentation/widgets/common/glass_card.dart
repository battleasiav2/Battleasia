import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final bool showGoldGlow;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.margin,
    this.borderRadius = 2,
    this.showGoldGlow = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.65),
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
          if (showGoldGlow)
            BoxShadow(
              color: AppColors.goldGlow(0.08),
              blurRadius: 40,
              spreadRadius: 0,
            ),
        ],
      ),
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius),
          // Solid translucent fill — avoids per-frame BackdropFilter cost on scroll.
          color: AppColors.surface.withValues(alpha: 0.94),
          border: Border.all(color: AppColors.border(0.14)),
        ),
        child: child,
      ),
    );
  }
}
