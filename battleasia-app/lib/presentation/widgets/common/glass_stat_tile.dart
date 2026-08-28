import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Flat blur stat tile — matches web HomeBlurPanel + gold top bar.
class GlassStatTile extends StatelessWidget {
  final String label;
  final String value;
  final String? suffix;
  final IconData? icon;
  final EdgeInsetsGeometry padding;

  const GlassStatTile({
    super.key,
    required this.label,
    required this.value,
    this.suffix,
    this.icon,
    this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
  });

  static const double radius = 0;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
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
              child: icon != null ? _buildWithIcon() : _buildSimple(),
            ),
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
      ),
    );
  }

  Widget _buildSimple() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textMuted.withValues(alpha: 0.85),
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.7,
            height: 1.25,
          ),
        ),
        const SizedBox(height: 6),
        _buildValueRow(),
      ],
    );
  }

  Widget _buildWithIcon() {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.gold.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(2),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.22)),
          ),
          child: Icon(icon, color: AppColors.gold, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label.toUpperCase(),
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textMuted.withValues(alpha: 0.85),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.7,
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 4),
              _buildValueRow(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildValueRow() {
    return Row(
      children: [
        Flexible(
          child: Text(
            value,
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w800,
              fontSize: 16,
              height: 1.1,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (suffix != null && suffix!.isNotEmpty) ...[
          const SizedBox(width: 4),
          Text(
            suffix!,
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.gold.withValues(alpha: 0.85),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }
}
