import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

class GameCard extends StatelessWidget {
  final String title;
  final String? subTitle;
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
    this.imageUrl,
    this.comingSoon = false,
    this.liveCount = 0,
    this.playerCount = 0,
    this.liveBadgeLabel = 'LIVE',
    this.joinLabel = 'JOIN',
    this.onTap,
  });

  static const _fallbackImage = 'assets/images/game2.webp';
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
      child: InkWell(
        onTap: isDisabled ? null : onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: _cardBg,
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 28,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: AspectRatio(
            aspectRatio: 1,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  height: 2,
                  decoration: BoxDecoration(
                    color: AppColors.gold,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.gold.withValues(alpha: 0.45),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      _buildCoverImage(),
                      DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.18),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.55),
                              _cardBg.withValues(alpha: 0.95),
                            ],
                            stops: const [0, 0.3, 0.72, 1],
                          ),
                        ),
                      ),
                      if (showLive)
                        Positioned(
                          top: 0,
                          left: 0,
                          child: _LiveBadge(count: liveCount, label: liveBadgeLabel),
                        ),
                      if (comingSoon)
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              border: Border.all(
                                color: AppColors.gold.withValues(alpha: 0.35),
                              ),
                            ),
                            child: const Text(
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
                        Positioned.fill(
                          child: ColoredBox(
                            color: Colors.black.withValues(alpha: 0.28),
                          ),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                  color: _cardBg,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (subTitle != null)
                        Text(
                          subTitle!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: AppColors.gold.withValues(alpha: 0.92),
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.1,
                          ),
                        ),
                      if (subTitle != null) const SizedBox(height: 2),
                      Text(
                        title.toUpperCase(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: ResponsiveUtils.getResponsiveFontSize(
                            context,
                            baseSize: 12.0,
                            min: 11.0,
                            max: 13.0,
                          ),
                          height: 1.2,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 6),
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
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            joinLabel,
                            style: const TextStyle(
                              color: AppColors.gold,
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1,
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
        border: Border(
          bottom: BorderSide(color: GameCard._liveGreen.withValues(alpha: 0.45)),
          right: BorderSide(color: GameCard._liveGreen.withValues(alpha: 0.45)),
        ),
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
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }
}
