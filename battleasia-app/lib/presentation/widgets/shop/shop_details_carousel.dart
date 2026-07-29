import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

class ShopDetailsCarousel extends StatefulWidget {
  final List<String> images;
  final String? name;

  const ShopDetailsCarousel({
    super.key,
    required this.images,
    this.name,
  });

  @override
  State<ShopDetailsCarousel> createState() => _ShopDetailsCarouselState();
}

class _ShopDetailsCarouselState extends State<ShopDetailsCarousel> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    // Responsive image height based on screen width
    final imageHeight = screenWidth < 600
        ? screenWidth * 0.8 // Small screens: 80% of width
        : screenWidth < 900
            ? screenWidth * 0.6 // Medium screens: 60% of width
            : ResponsiveUtils.getResponsiveSpacing(
                context,
                baseSize: 400.0,
              ).clamp(300.0, 500.0); // Large screens: fixed height

    final thumbSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(60.0, 100.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    if (widget.images.isEmpty) {
      return Container(
        height: imageHeight,
        decoration: BoxDecoration(
          color: AppTheme.textSecondary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          Icons.shopping_bag,
          size: 64,
          color: AppTheme.textSecondary,
        ),
      );
    }

    return Column(
      children: [
        // Main Image Carousel
        Stack(
          children: [
            Container(
              height: imageHeight,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: AppTheme.textSecondary.withOpacity(0.1),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: widget.images.length,
                  onPageChanged: (index) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                  itemBuilder: (context, index) {
                    return _buildImage(widget.images[index]);
                  },
                ),
              ),
            ),
            // Navigation arrows and counter
            if (widget.images.length > 1)
              Positioned(
                right: spacing16,
                bottom: spacing16,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: spacing16,
                    vertical: spacing16 / 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: _currentIndex > 0
                            ? () {
                                _pageController.previousPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              }
                            : null,
                        icon: Icon(
                          Icons.arrow_back_ios,
                          size: iconSize * 0.8,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        '${_currentIndex + 1} / ${widget.images.length}',
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      IconButton(
                        onPressed: _currentIndex < widget.images.length - 1
                            ? () {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              }
                            : null,
                        icon: Icon(
                          Icons.arrow_forward_ios,
                          size: iconSize * 0.8,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),

        // Thumbnail Navigation
        if (widget.images.length > 1) ...[
          SizedBox(height: spacing16),
          SizedBox(
            height: thumbSize,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: widget.images.length,
              itemBuilder: (context, index) {
                final isSelected = _currentIndex == index;
                return GestureDetector(
                  onTap: () {
                    _pageController.animateToPage(
                      index,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  },
                  child: Container(
                    width: thumbSize,
                    margin: EdgeInsets.only(
                      right: index < widget.images.length - 1 ? spacing16 / 2 : 0,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: _buildImage(widget.images[index]),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildImage(String imageUrl) {
    if (imageUrl.isEmpty) {
      return Container(
        color: AppTheme.textSecondary.withOpacity(0.1),
        child: Icon(
          Icons.image_not_supported,
          size: 64,
          color: AppTheme.textSecondary,
        ),
      );
    }

    // Check if it's a local asset
    if (imageUrl.startsWith('assets/')) {
      return Image.asset(
        imageUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: AppTheme.textSecondary.withOpacity(0.1),
            child: Icon(
              Icons.image_not_supported,
              size: 64,
              color: AppTheme.textSecondary,
            ),
          );
        },
      );
    }

    // Network image
    return Image.network(
      ImageUtils.getImageUrl(imageUrl) ?? '',
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: AppTheme.textSecondary.withOpacity(0.1),
          child: Icon(
            Icons.image_not_supported,
            size: 64,
            color: AppTheme.textSecondary,
          ),
        );
      },
    );
  }
}

