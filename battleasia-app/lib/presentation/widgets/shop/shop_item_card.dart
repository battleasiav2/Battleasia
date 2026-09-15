import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';

const Map<String, Color> _kBadgeColor = {
  'popular': Color(0xFFF5C518),
  'new': Color(0xFF38BDF8),
  'hot': Color(0xFFEF4444),
  'best': Color(0xFF22C55E),
};

class ShopItemCard extends StatelessWidget {
  final ShopItemModel item;
  final VoidCallback? onTap;
  final VoidCallback? onBuy;
  /// BDT FX rate from `/shop/coins` — web multiplies pack price by this.
  final double bdtRate;

  const ShopItemCard({
    super.key,
    required this.item,
    this.onTap,
    this.onBuy,
    this.bdtRate = 1,
  });

  @override
  Widget build(BuildContext context) {
    final showBadge =
        item.badge.isNotEmpty && item.badge.toLowerCase() != 'none';
    final hasDiscount = item.discountPercent > 0;
    final badgeColor =
        _kBadgeColor[item.badge.toLowerCase()] ?? AppColors.gold;
    final rate = bdtRate > 0 ? bdtRate : 1.0;
    final priceBdt = item.price * rate;
    final originalBdt = item.originalPrice * rate;

    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 120;
        final pad = compact ? 6.0 : 10.0;
        final coinSize = compact ? 36.0 : 54.0;
        final amountSize = compact ? 10.0 : 13.0;
        final priceSize = compact ? 9.0 : 11.5;
        final badgeSize = compact ? 7.0 : 8.5;

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(compact ? 12 : 14),
            child: Stack(
              children: [
                Ink(
                  decoration: BoxDecoration(
                    color: AppColors.panelFill(0.55),
                    borderRadius: BorderRadius.circular(compact ? 12 : 14),
                    border: Border.all(color: AppColors.hair()),
                  ),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      pad,
                      compact ? 22 : 26,
                      pad,
                      compact ? 8 : 10,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: coinSize,
                          width: coinSize,
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
                                      AppColors.gold.withValues(alpha: 0.18),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                              Image.asset(
                                'assets/images/currency.webp',
                                width: coinSize * 0.9,
                                height: coinSize * 0.9,
                                fit: BoxFit.contain,
                                errorBuilder: (_, __, ___) => Icon(
                                  Icons.monetization_on,
                                  size: coinSize * 0.85,
                                  color: AppColors.gold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: compact ? 6 : 8),
                        Text(
                          '${_fmt(item.amount)} ${item.symbol}',
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            fontSize: amountSize,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w900,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '৳ ${_fmtMoney(priceBdt)} BDT',
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            fontSize: priceSize,
                            color: AppColors.gold,
                            fontWeight: FontWeight.w800,
                            height: 1.2,
                          ),
                        ),
                        if (hasDiscount && item.originalPrice > item.price) ...[
                          const SizedBox(height: 2),
                          Text(
                            '৳ ${_fmtMoney(originalBdt)}',
                            style: AppTheme.bodySmall.copyWith(
                              fontSize: compact ? 8 : 9,
                              color: AppColors.textMuted,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                        const Spacer(),
                        SizedBox(
                          width: double.infinity,
                          height: compact ? 26 : 32,
                          child: OutlinedButton(
                            onPressed: onBuy,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.gold,
                              side: BorderSide(
                                color: AppColors.gold.withValues(alpha: 0.85),
                              ),
                              backgroundColor:
                                  Colors.black.withValues(alpha: 0.35),
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(compact ? 8 : 10),
                              ),
                            ),
                            child: Text(
                              'shop.buyNow'.tr(),
                              style: TextStyle(
                                fontSize: compact ? 8 : 10,
                                fontWeight: FontWeight.w900,
                                letterSpacing: compact ? 0.2 : 0.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 1,
                    color: Colors.white.withValues(alpha: 0.08),
                  ),
                ),
                if (showBadge)
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: compact ? 4 : 6,
                        vertical: compact ? 2 : 3,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.82),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: badgeColor.withValues(alpha: 0.55),
                        ),
                      ),
                      child: Text(
                        item.badge.toUpperCase(),
                        style: TextStyle(
                          fontSize: badgeSize,
                          color: badgeColor,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ),
                if (hasDiscount)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: compact ? 4 : 6,
                        vertical: compact ? 2 : 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '-${item.discountPercent.toInt()}%',
                        style: TextStyle(
                          fontSize: compact ? 7.5 : 9,
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _fmt(num n) {
    final s = n.round().toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      final fromEnd = s.length - i;
      buf.write(s[i]);
      if (fromEnd > 1 && fromEnd % 3 == 1) buf.write(',');
    }
    return buf.toString();
  }

  String _fmtMoney(double n) {
    if (n == n.roundToDouble()) return _fmt(n.round());
    return n.toStringAsFixed(2);
  }
}
