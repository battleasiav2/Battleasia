import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Zip glass card — 18px radius, 20px blur, matches web landing panels.
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final bool showGoldBar;
  /// Blur is opt-in (hero cards only) to keep scroll lists performant.
  final bool useBlur;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.margin,
    this.showGoldBar = true,
    this.useBlur = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget card = Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppColors.radius),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Container(
            width: double.infinity,
            padding: padding,
            decoration: BoxDecoration(
              color: AppColors.panelFill(),
              borderRadius: BorderRadius.circular(AppColors.radius),
              border: Border.all(color: AppColors.hair()),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x70000000),
                  blurRadius: 40,
                  offset: Offset(0, 24),
                ),
              ],
            ),
            child: child,
          ),
          if (showGoldBar)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: ColoredBox(
                color: AppColors.gold,
                child: const SizedBox(height: 2),
              ),
            ),
        ],
      ),
    );

    if (!useBlur) return card;

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppColors.radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: card,
      ),
    );
  }
}
