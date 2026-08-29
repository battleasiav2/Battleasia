import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Flat blur card surface — matches web UserGlassCard / HomeBlurPanel.
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
      child: Stack(
        children: [
          Container(
            width: double.infinity,
            padding: padding,
            decoration: BoxDecoration(
              color: const Color(0xFF161618).withValues(alpha: 0.4),
              border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
            ),
            foregroundDecoration: BoxDecoration(
              border: Border(
                top: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
              ),
            ),
            child: child,
          ),
          if (showGoldBar)
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: ColoredBox(
                color: AppColors.gold,
                child: SizedBox(height: 2),
              ),
            ),
        ],
      ),
    );

    if (!useBlur) return card;

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
        child: card,
      ),
    );
  }
}
