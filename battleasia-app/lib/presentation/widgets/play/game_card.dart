import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class GameCard extends StatelessWidget {
  final String title;
  final String? subTitle;
  final String? imageAsset;
  final String? imageUrl;
  final bool comingSoon;
  final int liveCount;
  final int playerCount;
  final String liveBadgeLabel;
  final String joinLabel;
  final VoidCallback? onTap;

  const GameCard({
    super.key,
    required this.title,
    this.subTitle,
    this.imageAsset,
    this.imageUrl,
    this.comingSoon = false,
    this.liveCount = 0,
    this.playerCount = 0,
    this.liveBadgeLabel = 'LIVE',
    this.joinLabel = 'JOIN',
    this.onTap,
  });

  static const _fallbackImage = 'assets/images/games/pubg-mobile.webp';
  static const _cardBg = Color(0xFF161618);
  static const _liveGreen = Color(0xFF22C55E);

  static String formatPlayerCount(int value) {
    if (value >= 1000000) {
      final m = value / 1000000;
      return '${m.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}M';
    }
    if (value >= 1000) {
      final k = value / 1000;
      return '${k.toStringAsFixed(1).replaceAll(RegExp(r'\.0$'), '')}K';
    }
    return value.toString();
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = comingSoon || onTap == null;
    final showLive = liveCount > 0 && !comingSoon;

    return Material(
      color: Colors.transparent,
      clipBehavior: Clip.antiAlias,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: isDisabled ? null : onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: _cardBg.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    _buildCoverImage(),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Color(0x1F000000),
                            Color(0x00000000),
                            Color(0xEB161618),
                          ],
                          stops: [0, 0.42, 1],
                        ),
                      ),
                    ),
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: ColoredBox(
                        color: AppColors.gold,
                        child: const SizedBox(height: 2),
                      ),
                    ),
                    if (showLive)
                      Positioned(
                        top: 10,
                        left: 10,
                        child: _LiveBadge(count: liveCount, label: liveBadgeLabel),
                      ),
                    if (comingSoon)
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.7),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                              color: AppColors.gold.withValues(alpha: 0.35),
                            ),
                          ),
                          child: Text(
                            'SOON',
                            style: TextStyle(
                              color: AppColors.gold,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                    if (isDisabled)
                      const Positioned.fill(
                        child: ColoredBox(color: Color(0x47000000)),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (subTitle != null)
                      Text(
                        subTitle!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.42),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.0,
                        ),
                      ),
                    if (subTitle != null) const SizedBox(height: 2),
                    Text(
                      title.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: ResponsiveUtils.getResponsiveFontSize(
                          context,
                          baseSize: 12.5,
                          min: 11.0,
                          max: 14.0,
                        ),
                        height: 1.2,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.groups_rounded,
                          size: 14,
                          color: Colors.white.withValues(alpha: 0.45),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          formatPlayerCount(playerCount),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.72),
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    GoldButton(
                      label: joinLabel,
                      height: 36,
                      fontSize: 11,
                      onPressed: isDisabled ? null : onTap,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCoverImage() {
    final asset = (imageAsset != null && imageAsset!.isNotEmpty)
        ? imageAsset!
        : _fallbackImage;
    return Image.asset(
      asset,
      fit: BoxFit.cover,
      alignment: const Alignment(0, -0.2),
      errorBuilder: (_, __, ___) => Image.asset(
        _fallbackImage,
        fit: BoxFit.cover,
      ),
    );
  }
}

class _LiveBadge extends StatelessWidget {
  final int count;
  final String label;

  const _LiveBadge({required this.count, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.72),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: GameCard._liveGreen.withValues(alpha: 0.45)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: GameCard._liveGreen,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            '$count $label',
            style: const TextStyle(
              color: GameCard._liveGreen,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }
}
