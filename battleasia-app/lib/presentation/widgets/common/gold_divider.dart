import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

class GoldDivider extends StatelessWidget {
  final double width;
  final double height;

  const GoldDivider({
    super.key,
    this.width = 180,
    this.height = 2,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.transparent,
            AppColors.gold.withValues(alpha: 0.15),
            AppColors.gold,
            AppColors.gold.withValues(alpha: 0.15),
            Colors.transparent,
          ],
        ),
        borderRadius: BorderRadius.circular(height),
      ),
    );
  }
}
