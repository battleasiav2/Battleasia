import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';

// Badge colour map — mirrors BADGE_COLOR_MAP in the web shop frontend.
const Map<String, Color> _kBadgeBgColor = {
  'Popular': Color(0xFF22c55e), // success / green
  'New': Color(0xFF3b82f6),     // info   / blue
  'Hot': Color(0xFFf59e0b),     // warning / amber
  'Best': Color(0xFF8b5cf6),    // secondary / purple
};

class ShopItemCard extends StatelessWidget {
  final ShopItemModel item;
  final VoidCallback? onTap;
  final VoidCallback? onBuy;

  const ShopItemCard({super.key, required this.item, this.onTap, this.onBuy});

  @override
  Widget build(BuildContext context) {
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 22.0,
    );

    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    final priceFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 18.0,
      max: 24.0,
    );

    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final screenWidth = MediaQuery.of(context).size.width;
    final imageHeight = screenWidth < 600
        ? screenWidth * 0.42
        : screenWidth < 900
            ? 180.0
            : 220.0;

    final showBadge =
        item.badge.isNotEmpty && item.badge.toLowerCase() != 'none';

    return Card(
      color: AppTheme.surfaceColor,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Coin image ────────────────────────────────────────────────
            Stack(
              children: [
                Container(
                  height: imageHeight,
                  width: double.infinity,
                  color: const Color(0xFF1A1A1A),
                  child: _buildImage(item.image),
                ),
                // Badge chip (top-left)
                if (showBadge)
                  Positioned(
                    top: spacing8,
                    left: spacing8,
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: spacing8,
                        vertical: spacing8 / 2,
                      ),
                      decoration: BoxDecoration(
                        color:
                            _kBadgeBgColor[item.badge] ?? AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.badge,
                        style: TextStyle(
                          fontSize: bodyFontSize - 1,
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            // ── Content ───────────────────────────────────────────────────
            Padding(
              padding: EdgeInsets.fromLTRB(
                cardPadding, spacing8, cardPadding, cardPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Coin amount + symbol  e.g. "100 BAC"
                  Text(
                    '${item.amount} ${item.symbol}',
                    style: AppTheme.heading3.copyWith(
                      fontSize: titleFontSize,
                      color: Colors.black,
                      fontWeight: FontWeight.w700,
                      height: 1.1,
                    ),
                  ),

                  SizedBox(height: spacing8 * 0.75),

                  // ── Price row + Buy button ────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Price column
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Active price
                          Text(
                            _displayPrice(),
                            style: AppTheme.heading3.copyWith(
                              fontSize: priceFontSize,
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w700,
                              height: 1.15,
                            ),
                          ),
                          // Strikethrough original  +  premium chip on same row
                          if (item.discountPercent > 0)
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  '\$${item.originalPrice.toStringAsFixed(0)}',
                                  style: AppTheme.bodySmall.copyWith(
                                    fontSize: bodyFontSize - 1,
                                    color: AppTheme.textSecondary,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                                SizedBox(width: spacing8 * 0.5),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: spacing8 * 0.6,
                                    vertical: 1,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFf59e0b)
                                        .withOpacity(0.15),
                                    border: Border.all(
                                        color: const Color(0xFFf59e0b),
                                        width: 1),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                  child: Text(
                                    '-${item.discountPercent.toInt()}%',
                                    style: TextStyle(
                                      fontSize: bodyFontSize - 2,
                                      color: const Color(0xFFf59e0b),
                                      fontWeight: FontWeight.w700,
                                      height: 1.3,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),

                      // Buy button
                      Material(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(8),
                        child: InkWell(
                          onTap: onBuy,
                          borderRadius: BorderRadius.circular(8),
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: spacing12,
                              vertical: spacing8,
                            ),
                            child: Text(
                              'Buy',
                              style: AppTheme.bodyMedium.copyWith(
                                fontSize: buttonFontSize,
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Returns the price text to display on the card.
  ///
  /// Premium logic (mirrors web frontend):
  ///   - If the current user IS premium AND the item has discountPercent > 0,
  ///     the server already applies a price reduction **or** we show the
  ///     discounted price computed from originalPrice.
  ///   - The server currently stores the already-discounted `price` field, so
  ///     we just show `item.price` as the active price.
  String _displayPrice() {
    return '\$${item.price.toStringAsFixed(0)}';
  }

  Widget _buildImage(String imageUrl) {
    if (imageUrl.isEmpty) {
      return const Center(
        child: Icon(Icons.monetization_on_outlined,
            size: 64, color: Colors.white38),
      );
    }

    final fullUrl = AppConfig.getImageUrl(imageUrl);
    if (fullUrl == null) {
      return const Center(
        child: Icon(Icons.monetization_on_outlined,
            size: 64, color: Colors.white38),
      );
    }

    return Image.network(
      fullUrl,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => const Center(
        child: Icon(Icons.monetization_on_outlined,
            size: 64, color: Colors.white38),
      ),
    );
  }
}
