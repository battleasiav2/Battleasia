import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/match_capacity_utils.dart';

enum MatchSpotsProgressVariant { compact, normal, featured }

class MatchSpotsProgress extends StatelessWidget {
  final int? participantsCount;
  final int? totalPlayer;
  final MatchSpotsProgressVariant variant;

  const MatchSpotsProgress({
    super.key,
    this.participantsCount,
    this.totalPlayer,
    this.variant = MatchSpotsProgressVariant.normal,
  });

  static const _fullRed = Color(0xFFEF4444);
  static const _cardBg = Color(0xFF161618);

  double _visualPercent(double percent, int joined) {
    if (joined <= 0) return 0;
    if (percent >= 100) return 100;
    return percent < 6 ? 6 : percent;
  }

  double _barHeight() {
    switch (variant) {
      case MatchSpotsProgressVariant.compact:
        return 8;
      case MatchSpotsProgressVariant.featured:
        return 14;
      case MatchSpotsProgressVariant.normal:
        return 10;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = getMatchCapacityState(
      participantsCount: participantsCount,
      totalPlayer: totalPlayer,
    );
    final nearlyFull = !state.isFull && state.percent >= 85;
    final visualPercent = _visualPercent(state.percent, state.joined);
    final isFeatured = variant == MatchSpotsProgressVariant.featured;
    final barHeight = _barHeight();

    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Container(
              width: isFeatured ? 3 : 2,
              height: isFeatured ? 14 : 10,
              color: state.isFull ? _fullRed : AppColors.gold,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'match.spotsJoined'.tr(),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: isFeatured ? 0.78 : 0.55),
                  fontSize: isFeatured ? 11 : (variant == MatchSpotsProgressVariant.compact ? 9 : 10),
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
            ),
            if (state.isFull)
              Container(
                margin: const EdgeInsets.only(right: 6),
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: _fullRed.withValues(alpha: 0.16),
                  border: Border.all(color: _fullRed.withValues(alpha: 0.42)),
                ),
                child: Text(
                  'match.matchFull'.tr(),
                  style: const TextStyle(
                    color: _fullRed,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            Text(
              '${state.joined} / ${state.max}',
              style: TextStyle(
                color: state.isFull ? _fullRed : Colors.white,
                fontSize: isFeatured ? 13 : (variant == MatchSpotsProgressVariant.compact ? 10 : 11),
                fontWeight: FontWeight.w800,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
            if (isFeatured) ...[
              const SizedBox(width: 8),
              Text(
                '${state.percent.round()}%',
                style: TextStyle(
                  color: state.isFull ? _fullRed : AppColors.gold,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ],
        ),
        SizedBox(height: isFeatured ? 10 : 6),
        Semantics(
          label: '${state.joined} of ${state.max} players joined',
          value: '${state.percent.round()} percent',
          child: Container(
            height: barHeight,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.55),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                  spreadRadius: -2,
                ),
              ],
            ),
            child: Align(
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: visualPercent / 100,
                child: Container(
                  height: barHeight,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: state.isFull
                          ? [
                              _fullRed.withValues(alpha: 0.75),
                              _fullRed,
                              const Color(0xFFF87171),
                            ]
                          : nearlyFull
                              ? [
                                  AppColors.gold.withValues(alpha: 0.7),
                                  AppColors.gold,
                                  const Color(0xFFFBBF24),
                                ]
                              : [
                                  AppColors.gold.withValues(alpha: 0.45),
                                  AppColors.gold,
                                  const Color(0xFFFDE68A),
                                ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (state.isFull ? _fullRed : AppColors.gold).withValues(alpha: 0.42),
                        blurRadius: 14,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        if (isFeatured) ...[
          const SizedBox(height: 8),
          Text(
            state.isFull ? 'match.matchFullHint'.tr() : 'match.spotsJoinedHint'.tr(),
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.45),
              fontSize: 10,
              height: 1.4,
            ),
          ),
        ],
      ],
    );

    if (!isFeatured) return content;

    return Container(
      decoration: BoxDecoration(
        color: _cardBg,
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 2,
            color: AppColors.gold,
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: content,
          ),
        ],
      ),
    );
  }
}
