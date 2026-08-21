import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';

class GameCard extends StatelessWidget {
  final String title;
  final String? subTitle;
  final String? imageUrl;
  final bool comingSoon;
  final VoidCallback? onTap;

  const GameCard({
    super.key,
    required this.title,
    this.subTitle,
    this.imageUrl,
    this.comingSoon = false,
    this.onTap,
  });

  static const _fallbackImage = 'assets/images/game2.webp';

  @override
  Widget build(BuildContext context) {
    final isDisabled = comingSoon || onTap == null;

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
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final badgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 10.0,
      min: 8.0,
      max: 12.0,
    );

    final badgePosition = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final spacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 4.0);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isDisabled ? null : onTap,
        borderRadius: BorderRadius.circular(2),
        child: GlassCard(
          padding: EdgeInsets.zero,
          showGoldGlow: false,
          child: SizedBox.expand(
            child: Stack(
              fit: StackFit.expand,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: _buildCoverImage(),
                ),
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.85),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Padding(
                    padding: EdgeInsets.all(cardPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          title,
                          style: AppTheme.bodyLarge.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: titleFontSize,
                          ),
                        ),
                        if (subTitle != null) ...[
                          SizedBox(height: spacing),
                          Text(
                            subTitle!,
                            style: AppTheme.bodySmall.copyWith(
                              color: AppColors.gold,
                              fontSize: subtitleFontSize,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.6,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                if (comingSoon)
                  Positioned(
                    top: badgePosition,
                    left: badgePosition,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.gold,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Text(
                        'COMING SOON',
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.w800,
                          fontSize: badgeFontSize,
                        ),
                      ),
                    ),
                  ),
                if (isDisabled)
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCoverImage() {
    final url = imageUrl;
    if (url == null || url.isEmpty) {
      return Image.asset(_fallbackImage, fit: BoxFit.cover);
    }

    return ImageUtils.networkImage(
      url,
      fit: BoxFit.cover,
      memCacheWidth: 800,
      placeholder: Image.asset(_fallbackImage, fit: BoxFit.cover),
      errorWidget: Image.asset(_fallbackImage, fit: BoxFit.cover),
    );
  }
}
