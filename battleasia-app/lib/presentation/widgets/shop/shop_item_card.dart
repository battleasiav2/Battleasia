import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

const Map<String, Color> _kBadgeBgColor = {
  'Popular': Color(0xFF22c55e),
  'New': Color(0xFF3b82f6),
  'Hot': Color(0xFFf59e0b),
  'Best': Color(0xFF8b5cf6),
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

    final screenWidth = MediaQuery.of(context).size.width;
    final imageHeight = screenWidth < 600
        ? screenWidth * 0.42
        : screenWidth < 900
            ? 180.0
            : 220.0;

    final showBadge =
        item.badge.isNotEmpty && item.badge.toLowerCase() != 'none';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(2),
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(2),
            border: Border.all(color: AppColors.border(0.12)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Container(
                      height: imageHeight,
                      width: double.infinity,
                      color: AppColors.surface,
                      child: _buildImage(item.image),
                    ),
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
                            color: _kBadgeBgColor[item.badge] ?? AppColors.gold,
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Text(
                            item.badge,
                            style: TextStyle(
                              fontSize: bodyFontSize - 1,
                              color: Colors.black,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(
                    cardPadding,
                    spacing8,
                    cardPadding,
                    cardPadding,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${item.amount} ${item.symbol}',
                        style: AppTheme.heading3.copyWith(
                          fontSize: titleFontSize,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                        ),
                      ),
                      SizedBox(height: spacing8 * 0.75),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _displayPrice(),
                                style: AppTheme.heading3.copyWith(
                                  fontSize: priceFontSize,
                                  color: AppColors.gold,
                                  fontWeight: FontWeight.w800,
                                  height: 1.15,
                                ),
                              ),
                              if (item.discountPercent > 0)
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '\$${item.originalPrice.toStringAsFixed(0)}',
                                      style: AppTheme.bodySmall.copyWith(
                                        fontSize: bodyFontSize - 1,
                                        color: AppColors.textMuted,
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
                                        color: AppColors.gold.withValues(alpha: 0.15),
                                        border: Border.all(color: AppColors.gold),
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                      child: Text(
                                        '-${item.discountPercent.toInt()}%',
                                        style: TextStyle(
                                          fontSize: bodyFontSize - 2,
                                          color: AppColors.gold,
                                          fontWeight: FontWeight.w700,
                                          height: 1.3,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                          GoldButton(
                            label: 'shop.buy'.tr(),
                            expanded: false,
                            onPressed: onBuy,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _displayPrice() => '\$${item.price.toStringAsFixed(0)}';

  Widget _buildImage(String imageUrl) {
    if (imageUrl.isEmpty) {
      return const Center(
        child: Icon(
          Icons.monetization_on_outlined,
          size: 64,
          color: AppColors.textMuted,
        ),
      );
    }

    final fullUrl = AppConfig.getImageUrl(imageUrl);
    if (fullUrl == null) {
      return const Center(
        child: Icon(
          Icons.monetization_on_outlined,
          size: 64,
          color: AppColors.textMuted,
        ),
      );
    }

    if (ImageUtils.isBase64DataUri(fullUrl)) {
      final bytes = ImageUtils.decodeBase64DataUri(fullUrl);
      if (bytes != null) {
        return Image.memory(bytes, fit: BoxFit.contain);
      }
    }

    return Image.network(
      fullUrl,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => const Center(
        child: Icon(
          Icons.monetization_on_outlined,
          size: 64,
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}
