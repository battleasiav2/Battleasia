import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

class GameCard extends StatelessWidget {
  final String title;
  final String? subTitle;
  final String? imageUrl;
  final String? logo;
  final bool comingSoon;
  final VoidCallback? onTap;

  const GameCard({
    super.key,
    required this.title,
    this.subTitle,
    this.imageUrl,
    this.logo,
    this.comingSoon = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = comingSoon || onTap == null;

    // Responsive sizes
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 20.0,
    );

    final subtitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 11.0,
      max: 16.0,
    );

    final badgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 10.0,
      min: 8.0,
      max: 12.0,
    );

    final badgePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final badgePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    final badgePosition = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final logoSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 30.0,
    ).clamp(24.0, 30.0);

    final logoPosition = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 10.0,
    ).clamp(8.0, 10.0);

    final spacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 4.0);

    return Card(
      color: AppTheme.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: InkWell(
        onTap: isDisabled ? null : onTap,
        borderRadius: BorderRadius.circular(8),
        child: Stack(
          children: [
            // Game image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                height: double.infinity,
                width: double.infinity,
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage('assets/images/game2.webp'),
                    fit: BoxFit.cover,
                  ),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.8),
                      ],
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: EdgeInsets.all(cardPadding),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: AppTheme.bodyLarge.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: titleFontSize,
                                shadows: [
                                  Shadow(
                                    offset: const Offset(0, 1),
                                    blurRadius: 2,
                                    color: Colors.black.withOpacity(0.8),
                                  ),
                                ],
                              ),
                            ),
                            if (subTitle != null) ...[
                              SizedBox(height: spacing),
                              Text(
                                subTitle!,
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppTheme.accentColor,
                                  fontSize: subtitleFontSize,
                                  shadows: [
                                    Shadow(
                                      offset: const Offset(0, 1),
                                      blurRadius: 2,
                                      color: Colors.black.withOpacity(0.8),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Coming Soon badge
            if (comingSoon)
              Positioned(
                top: badgePosition,
                left: badgePosition,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: badgePaddingH,
                    vertical: badgePaddingV,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'COMING SOON',
                    style: AppTheme.bodySmall.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: badgeFontSize,
                    ),
                  ),
                ),
              ),

            // Logo overlay
            if (logo != null)
              Positioned(
                top: logoPosition,
                right: logoPosition,
                child: Image.asset(
                  'assets/images/logo.webp',
                  width: logoSize,
                  height: logoSize,
                  errorBuilder: (context, error, stackTrace) =>
                      const SizedBox.shrink(),
                ),
              ),

            // Disabled overlay
            if (isDisabled)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
