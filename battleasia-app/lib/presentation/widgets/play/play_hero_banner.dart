import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class PlayHeroBanner extends StatefulWidget {
  final List<Map<String, dynamic>> slides;
  final VoidCallback? onWatchLive;

  const PlayHeroBanner({super.key, required this.slides, this.onWatchLive});

  @override
  State<PlayHeroBanner> createState() => _PlayHeroBannerState();
}

class _PlayHeroBannerState extends State<PlayHeroBanner> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.slides.isEmpty) {
      return const SizedBox.shrink();
    }

    // Responsive banner height based on screen width
    final bannerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 300.0,
    ).clamp(250.0, 400.0);

    // Responsive indicator sizes
    final indicatorBottom = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final indicatorLeft = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final activeIndicatorWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 26.0,
    ).clamp(22.0, 32.0);
    final inactiveIndicatorWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 10.0);
    final indicatorHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 3.0,
    ).clamp(2.5, 4.0);
    final indicatorMargin = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 6.0);

    return SizedBox(
      height: bannerHeight,
      child: Stack(
        children: [
          // PageView for slides
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemCount: widget.slides.length,
            itemBuilder: (context, index) {
              final slide = widget.slides[index];
              return _buildSlide(slide, context);
            },
          ),

          // Indicators
          Positioned(
            bottom: indicatorBottom,
            left: indicatorLeft,
            child: Row(
              children: List.generate(
                widget.slides.length,
                (index) => Container(
                  width: _currentIndex == index
                      ? activeIndicatorWidth
                      : inactiveIndicatorWidth,
                  height: indicatorHeight,
                  margin: EdgeInsets.only(right: indicatorMargin),
                  decoration: BoxDecoration(
                    color: _currentIndex == index
                        ? AppColors.gold
                        : Colors.white.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlide(Map<String, dynamic> slide, BuildContext context) {
    // Responsive padding
    final padding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 24.0);

    // Responsive font sizes
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 32.0,
    );
    final descriptionFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final liveBadgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    // Responsive spacing
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    // Responsive button padding
    final buttonPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final buttonPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    // Responsive icon size
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);

    // Responsive badge padding
    final badgePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final badgePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 6.0);

    // Responsive border radius
    final borderRadius = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        image: DecorationImage(
          image: AssetImage(slide['imageUrl'] ?? 'assets/images/game.webp'),
          fit: BoxFit.cover,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(borderRadius),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.transparent, Colors.black.withValues(alpha: 0.8)],
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(padding),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                slide['title'] ?? '',
                style: AppTheme.heading1.copyWith(
                  color: Colors.white,
                  fontSize: titleFontSize,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      offset: const Offset(0, 2),
                      blurRadius: 4,
                      color: Colors.black.withValues(alpha: 0.8),
                    ),
                  ],
                ),
              ),
              SizedBox(height: spacing8),
              Text(
                slide['description'] ?? '',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontSize: descriptionFontSize,
                  shadows: [
                    Shadow(
                      offset: const Offset(0, 1),
                      blurRadius: 2,
                      color: Colors.black.withValues(alpha: 0.8),
                    ),
                  ],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: spacing16),
              Row(
                children: [
                  GoldButton(
                    label: 'Watch Live',
                    expanded: false,
                    onPressed: widget.onWatchLive,
                  ),
                  SizedBox(width: spacing12),
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: badgePaddingH,
                      vertical: badgePaddingV,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: Text(
                      'LIVE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: liveBadgeFontSize,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: spacing8),
            ],
          ),
        ),
      ),
    );
  }
}
