import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/match_capacity_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as date_utils;
import 'package:battleasia_app/data/models/match_model.dart';

/// Compact vertical match tile — 2-up grid after Play → game.
class MatchCard extends StatelessWidget {
  final MatchModel match;
  final VoidCallback? onWatchLive;
  final VoidCallback onJoin;
  final VoidCallback? onShowRoomDetails;
  final VoidCallback? onMatchNameTap;
  final bool joining;
  final bool canJoin;
  final bool isJoined;
  final bool showLive;
  final bool isPremiumUser;

  const MatchCard({
    super.key,
    required this.match,
    this.onWatchLive,
    required this.onJoin,
    this.onShowRoomDetails,
    this.onMatchNameTap,
    this.joining = false,
    this.canJoin = true,
    this.isJoined = false,
    this.showLive = false,
    this.isPremiumUser = false,
  });

  @override
  Widget build(BuildContext context) {
    final capacity = getMatchCapacityState(
      participantsCount: match.participantsCount,
      totalPlayer: match.totalPlayer,
    );
    final isMatchFull = capacity.isFull;
    final buttonDisabled = joining || isJoined || !canJoin;
    final bannerUrl =
        ImageUtils.getImageUrl(match.banner) ?? 'assets/images/game.webp';

    return RepaintBoundary(
      child: Material(
        color: Colors.transparent,
        clipBehavior: Clip.antiAlias,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          decoration: BoxDecoration(
            color: const Color(0xFF161618),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.4),
                blurRadius: 18,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(height: 2, color: AppColors.gold),
              Expanded(
                flex: 11,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    ImageUtils.networkImage(
                      bannerUrl,
                      fit: BoxFit.cover,
                      memCacheWidth: 420,
                      errorWidget: Image.asset(
                        'assets/images/game.webp',
                        fit: BoxFit.cover,
                      ),
                    ),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Color(0x33000000),
                            Color(0x00000000),
                            Color(0xE0161618),
                          ],
                          stops: [0, 0.45, 1],
                        ),
                      ),
                    ),
                    if (showLive)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: _Pill(
                          color: const Color(0xFF22C55E),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 5,
                                height: 5,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text(
                                'LIVE',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    if (match.premiumOnly)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: _Pill(
                          color: Colors.amber.shade700,
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.workspace_premium, size: 10, color: Colors.white),
                              SizedBox(width: 3),
                              Text(
                                'PRO',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                flex: 12,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      GestureDetector(
                        onTap: onMatchNameTap,
                        child: Text(
                          match.matchName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.heading3.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                            height: 1.2,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${date_utils.DateUtils.formatDateTime(match.matchSchedule)} · ${capacity.joined}/${capacity.max}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: AppColors.gold.withValues(alpha: 0.95),
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: _Stat(
                              label: 'ENTRY',
                              value: match.entryFee.toStringAsFixed(0),
                              accent: AppColors.gold,
                            ),
                          ),
                          Expanded(
                            child: _Stat(
                              label: 'KILL',
                              value: match.perKill.toStringAsFixed(0),
                            ),
                          ),
                        ],
                      ),
                      if (match.prizeDescription != null &&
                          match.prizeDescription!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          match.prizeDescription!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Color(0xFF22C55E),
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                      const Spacer(),
                      if (isJoined && (match.roomId?.isNotEmpty ?? false))
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: GestureDetector(
                            onTap: onShowRoomDetails,
                            child: Text(
                              'ID & PASS',
                              style: TextStyle(
                                color: AppColors.gold,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                decoration: TextDecoration.underline,
                                decorationColor: AppColors.gold,
                              ),
                            ),
                          ),
                        )
                      else if (isJoined)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: GestureDetector(
                            onTap: onShowRoomDetails,
                            child: Text(
                              'ID & PASSWORD',
                              style: TextStyle(
                                color: AppColors.gold,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                decoration: TextDecoration.underline,
                                decorationColor: AppColors.gold,
                              ),
                            ),
                          ),
                        ),
                      SizedBox(
                        height: 34,
                        child: isJoined
                            ? OutlinedButton(
                                onPressed: buttonDisabled ? null : onJoin,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.gold,
                                  side: BorderSide(
                                    color: AppColors.gold.withValues(alpha: 0.55),
                                  ),
                                  backgroundColor: Colors.black.withValues(alpha: 0.35),
                                  padding: EdgeInsets.zero,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                child: const Text(
                                  'SPECTATE',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                    letterSpacing: 0.6,
                                  ),
                                ),
                              )
                            : isMatchFull
                                ? OutlinedButton(
                                    onPressed: null,
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFFEF4444),
                                      side: BorderSide(
                                        color: const Color(0xFFEF4444)
                                            .withValues(alpha: 0.45),
                                      ),
                                      backgroundColor:
                                          Colors.black.withValues(alpha: 0.3),
                                      padding: EdgeInsets.zero,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    child: Text(
                                      'match.matchFull'.tr(),
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 11,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  )
                                : FilledButton(
                                    onPressed: buttonDisabled ? null : onJoin,
                                    style: FilledButton.styleFrom(
                                      backgroundColor: AppColors.gold,
                                      foregroundColor: const Color(0xFF111111),
                                      disabledBackgroundColor:
                                          AppColors.gold.withValues(alpha: 0.35),
                                      padding: EdgeInsets.zero,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    child: joining
                                        ? const SizedBox(
                                            width: 16,
                                            height: 16,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Color(0xFF111111),
                                            ),
                                          )
                                        : const Text(
                                            'JOIN',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 12,
                                              letterSpacing: 0.8,
                                            ),
                                          ),
                                  ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final Color color;
  final Widget child;

  const _Pill({required this.color, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(6),
      ),
      child: child,
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final Color? accent;

  const _Stat({required this.label, required this.value, this.accent});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.45),
            fontSize: 8,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: accent ?? Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}
