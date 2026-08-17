import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
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
    final showBadge =
        item.badge.isNotEmpty && item.badge.toLowerCase() != 'none';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: const Color(0xFF181614),
            border: Border.all(color: const Color(0xFF2B2B2B)),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                if (showBadge)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      color: _kBadgeBgColor[item.badge] ?? AppColors.gold,
                      child: Text(
                        item.badge.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.black,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  )
                else
                  const SizedBox(height: 22),
                const SizedBox(height: 4),
                SizedBox(
                  height: 96,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              AppColors.gold.withValues(alpha: 0.22),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                      _CoinStack(imageUrl: item.image),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${item.amount} ${item.symbol}',
                  style: AppTheme.heading3.copyWith(
                    fontSize: 18,
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w800,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _displayPrice(),
                  style: AppTheme.heading3.copyWith(
                    fontSize: 20,
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                    height: 1.15,
                  ),
                ),
                if (item.discountPercent > 0) ...[
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '\$${item.originalPrice.toStringAsFixed(0)}',
                        style: AppTheme.bodySmall.copyWith(
                          fontSize: 11,
                          color: AppColors.textMuted,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '-${item.discountPercent.toInt()}%',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.gold,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
                const Spacer(),
                GoldButton(
                  label: 'shop.buy'.tr(),
                  onPressed: onBuy,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _displayPrice() => '\$${item.price.toStringAsFixed(0)}';
}

class _CoinStack extends StatelessWidget {
  final String imageUrl;
  const _CoinStack({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    Widget coin({double size = 64, double dx = 0, double dy = 0, double opacity = 1}) {
      return Transform.translate(
        offset: Offset(dx, dy),
        child: Opacity(
          opacity: opacity,
          child: Image.asset(
            'assets/images/currency.webp',
            width: size,
            height: size,
            errorBuilder: (_, __, ___) => Icon(
              Icons.monetization_on,
              size: size,
              color: AppColors.gold,
            ),
          ),
        ),
      );
    }

    final pack = imageUrl.isNotEmpty ? AppConfig.getImageUrl(imageUrl) : null;

    return SizedBox(
      width: 96,
      height: 96,
      child: Stack(
        alignment: Alignment.center,
        children: [
          coin(size: 54, dx: -14, dy: 10, opacity: 0.45),
          coin(size: 54, dx: 14, dy: 10, opacity: 0.45),
          if (pack != null)
            ImageUtils.networkImage(
              pack,
              width: 88,
              height: 88,
              fit: BoxFit.contain,
              memCacheWidth: 220,
              errorWidget: coin(size: 72),
            )
          else
            coin(size: 72),
        ],
      ),
    );
  }
}
