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

    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 110;
        final pad = compact ? 6.0 : 14.0;
        final coinSize = compact ? 48.0 : 96.0;
        final amountSize = compact ? 11.0 : 18.0;
        final priceSize = compact ? 12.0 : 20.0;
        final badgeSize = compact ? 7.0 : 10.0;

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            child: Stack(
              children: [
                Ink(
                  decoration: BoxDecoration(
                    color: const Color(0xFF161618),
                    borderRadius: BorderRadius.circular(compact ? 12 : 18),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.09),
                    ),
                  ),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(pad, compact ? 10 : 16, pad, compact ? 8 : 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        if (showBadge)
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: compact ? 4 : 8,
                                vertical: compact ? 2 : 3,
                              ),
                              color: _kBadgeBgColor[item.badge] ?? AppColors.gold,
                              child: Text(
                                item.badge.toUpperCase(),
                                style: TextStyle(
                                  fontSize: badgeSize,
                                  color: Colors.black,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: compact ? 0.2 : 0.4,
                                ),
                              ),
                            ),
                          )
                        else
                          SizedBox(height: compact ? 14 : 22),
                        SizedBox(height: compact ? 2 : 4),
                        SizedBox(
                          height: coinSize,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              Container(
                                width: coinSize,
                                height: coinSize,
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
                              _CoinStack(
                                imageUrl: item.image,
                                size: coinSize,
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: compact ? 4 : 8),
                        Text(
                          '${item.amount} ${item.symbol}',
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            fontSize: amountSize,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w800,
                            height: 1.1,
                          ),
                        ),
                        SizedBox(height: compact ? 2 : 4),
                        Text(
                          _displayPrice(),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            fontSize: priceSize,
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            height: 1.15,
                          ),
                        ),
                        if (!compact && item.discountPercent > 0) ...[
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
                          height: compact ? 28 : 44,
                          fontSize: compact ? 9 : 13,
                          borderRadius: compact ? 8 : 12,
                        ),
                      ],
                    ),
                  ),
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
      },
    );
  }

  String _displayPrice() => '\$${item.price.toStringAsFixed(0)}';
}

class _CoinStack extends StatelessWidget {
  final String imageUrl;
  final double size;
  const _CoinStack({required this.imageUrl, this.size = 96});

  @override
  Widget build(BuildContext context) {
    final main = size * 0.75;
    final side = size * 0.56;

    Widget coin({double s = 64, double dx = 0, double dy = 0, double opacity = 1}) {
      return Transform.translate(
        offset: Offset(dx, dy),
        child: Opacity(
          opacity: opacity,
          child: Image.asset(
            'assets/images/currency.webp',
            width: s,
            height: s,
            errorBuilder: (_, __, ___) => Icon(
              Icons.monetization_on,
              size: s,
              color: AppColors.gold,
            ),
          ),
        ),
      );
    }

    final pack = imageUrl.isNotEmpty ? AppConfig.getImageUrl(imageUrl) : null;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (size >= 70) ...[
            coin(s: side, dx: -size * 0.15, dy: size * 0.1, opacity: 0.45),
            coin(s: side, dx: size * 0.15, dy: size * 0.1, opacity: 0.45),
          ],
          if (pack != null)
            ImageUtils.networkImage(
              pack,
              width: main,
              height: main,
              fit: BoxFit.contain,
              memCacheWidth: 220,
              errorWidget: coin(s: main),
            )
          else
            coin(s: main),
        ],
      ),
    );
  }
}
