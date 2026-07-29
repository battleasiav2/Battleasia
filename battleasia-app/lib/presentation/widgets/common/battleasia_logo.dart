import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

/// Reusable BattleAsia logo component
///
/// Usage examples:
/// ```dart
/// // Logo with text (default)
/// BattleAsiaLogo()
///
/// // Logo only, no text
/// BattleAsiaLogo(showText: false)
///
/// // Custom size
/// BattleAsiaLogo(logoSize: 80)
///
/// // Custom colors
/// BattleAsiaLogo(
///   textColor: Colors.white,
///   subtitleColor: Colors.grey,
/// )
///
/// // Centered alignment
/// BattleAsiaLogo(alignment: MainAxisAlignment.center)
/// ```
class BattleAsiaLogo extends StatelessWidget {
  final double? logoSize;
  final bool showText;
  final bool isMobile;
  final MainAxisAlignment alignment;
  final Color? textColor;
  final Color? subtitleColor;

  const BattleAsiaLogo({
    super.key,
    this.logoSize,
    this.showText = true,
    this.isMobile = false,
    this.alignment = MainAxisAlignment.start,
    this.textColor,
    this.subtitleColor,
  });

  @override
  Widget build(BuildContext context) {
    final isMobileContext = isMobile || AppUtils.isMobile(context);
    final size = logoSize ?? (isMobileContext ? 40.0 : 60.0);

    // Responsive spacing between logo and text
    final logoTextSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(4.0, 16.0);

    // Responsive font sizes
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 14.0,
      max: 24.0,
    );

    final subtitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 8.0,
      max: 14.0,
    );

    return Row(
      mainAxisAlignment: alignment,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Logo Image
        Image.asset(
          'assets/images/logo.webp',
          width: size,
          height: size,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) {
            // Fallback if image doesn't load
            return Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.primaryColor, width: 2),
              ),
              child: Icon(
                Icons.shield,
                color: AppTheme.primaryColor,
                size: size * 0.6,
              ),
            );
          },
        ),

        // Text (if enabled)
        if (showText) ...[
          SizedBox(width: logoTextSpacing),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Battle Asia',
                style: AppTheme.heading3.copyWith(
                  fontSize: titleFontSize,
                  color: textColor ?? AppTheme.textPrimary,
                ),
              ),
              Text(
                'OFFICIAL PUBG ON MOBILE',
                style: AppTheme.bodySmall.copyWith(
                  fontSize: subtitleFontSize,
                  fontWeight: FontWeight.bold,
                  color: subtitleColor ?? AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
