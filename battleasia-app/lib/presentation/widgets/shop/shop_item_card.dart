import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';

const Map<String, Color> _kBadgeColor = {
  'new': Color(0xFF38BDF8),
  'hot': Color(0xFFEF4444),
  'best': Color(0xFF22C55E),
};

bool _isCustomArt(String image) {
  final src = image.trim();
  if (src.isEmpty) return false;
  if (src.contains('currency.webp') || src.toLowerCase().contains('bac-coin')) {
    return false;
  }
  return true;
}

String _artUrl(String image, {int? cacheEpoch}) {
  var path = image.trim();
  if (path.startsWith('/uploads/')) {
    path = '/api$path';
  }
  String url;
  if (path.startsWith('http')) {
    url = path;
  } else {
    final base = AppConfig.serverUrl.replaceAll(RegExp(r'/$'), '');
    url = '$base$path';
  }
  if (cacheEpoch == null) return url;
  return '$url${url.contains('?') ? '&' : '?'}v=$cacheEpoch';
}

class ShopItemCard extends StatelessWidget {
  final ShopItemModel item;
  final VoidCallback? onTap;
  final VoidCallback? onBuy;
  final double bdtRate;
  final int? imageCacheEpoch;

  const ShopItemCard({
    super.key,
    required this.item,
    this.onTap,
    this.onBuy,
    this.bdtRate = 1,
    this.imageCacheEpoch,
  });

  @override
  Widget build(BuildContext context) {
    final showBadge =
        item.badge.isNotEmpty && item.badge.toLowerCase() != 'none';
    final hasDiscount = item.discountPercent > 0;
    final badgeColor =
        _kBadgeColor[item.badge.toLowerCase()] ?? AppColors.gold;
    final bdtPrice = bdtRate > 0 ? item.price * bdtRate : null;

    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 168;
        final padH = compact ? 12.0 : 16.0;
        final padT = compact ? 16.0 : 20.0;
        final coinMax = compact ? 96.0 : 112.0;
        final titleSize = compact ? 17.0 : 19.0;
        final badgeSize = compact ? 8.0 : 10.0;

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(14),
            child: Ink(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF141519), Color(0xFF101014)],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.28),
                    blurRadius: 18,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Padding(
                    padding: EdgeInsets.fromLTRB(
                      padH,
                      showBadge || hasDiscount ? padT + 8 : padT,
                      padH,
                      compact ? 14 : 16,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SizedBox(
                          height: coinMax + 8,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              Container(
                                width: coinMax * 0.85,
                                height: coinMax * 0.55,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(999),
                                  gradient: RadialGradient(
                                    colors: [
                                      AppColors.gold.withValues(alpha: 0.22),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                              Image(
                                image: _isCustomArt(item.image)
                                    ? NetworkImage(
                                        _artUrl(item.image, cacheEpoch: imageCacheEpoch),
                                      )
                                    : const AssetImage('assets/images/currency.webp')
                                        as ImageProvider,
                                width: coinMax,
                                height: coinMax,
                                fit: BoxFit.contain,
                                errorBuilder: (_, __, ___) => Icon(
                                  Icons.monetization_on,
                                  size: coinMax * 0.85,
                                  color: AppColors.gold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${_fmt(item.amount)} BAC',
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            fontSize: titleSize,
                            color: AppColors.gold,
                            fontWeight: FontWeight.w800,
                            height: 1.15,
                          ),
                        ),
                        const SizedBox(height: 10),
                        _PackDivider(gold: AppColors.gold),
                        const SizedBox(height: 12),
                        Text(
                          bdtPrice != null
                              ? '৳ ${_fmtMoney(bdtPrice)} Taka'
                              : '\$${_fmtMoney(item.price)}',
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            fontSize: compact ? 14 : 16,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w800,
                            height: 1.25,
                          ),
                        ),
                        if (hasDiscount && item.originalPrice > item.price) ...[
                          const SizedBox(height: 4),
                          Text(
                            bdtPrice != null
                                ? '৳ ${_fmtMoney(item.originalPrice * bdtRate)}'
                                : '\$${_fmtMoney(item.originalPrice)}',
                            textAlign: TextAlign.center,
                            style: AppTheme.bodySmall.copyWith(
                              fontSize: compact ? 10 : 11,
                              color: AppColors.textMuted,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                        SizedBox(height: compact ? 12 : 14),
                        SizedBox(
                          width: double.infinity,
                          height: compact ? 40 : 44,
                          child: FilledButton.icon(
                            onPressed: onBuy,
                            icon: Icon(
                              Icons.shopping_cart_outlined,
                              size: compact ? 17 : 18,
                              color: AppColors.goldInk,
                            ),
                            label: Text(
                              'shop.buyNow'.tr(),
                              style: TextStyle(
                                fontSize: compact ? 13 : 14,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                                color: AppColors.goldInk,
                              ),
                            ),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.gold,
                              foregroundColor: AppColors.goldInk,
                              padding: EdgeInsets.zero,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(999),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (showBadge)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: compact ? 6 : 8,
                          vertical: compact ? 3 : 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.82),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: badgeColor.withValues(alpha: 0.55),
                          ),
                        ),
                        child: Text(
                          item.badge,
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
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: compact ? 6 : 8,
                          vertical: compact ? 3 : 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '-${item.discountPercent.toStringAsFixed(item.discountPercent == item.discountPercent.roundToDouble() ? 0 : 1)}%',
                          style: TextStyle(
                            fontSize: compact ? 8 : 9,
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
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

class _PackDivider extends StatelessWidget {
  const _PackDivider({required this.gold});

  final Color gold;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  gold.withValues(alpha: 0.55),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        Transform.rotate(
          angle: 0.785398,
          child: Container(
            width: 7,
            height: 7,
            margin: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: gold,
              boxShadow: [
                BoxShadow(
                  color: gold.withValues(alpha: 0.45),
                  blurRadius: 8,
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  gold.withValues(alpha: 0.55),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
