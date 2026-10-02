import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/match_capacity_utils.dart';
import 'package:battleasia_app/core/utils/match_cover_utils.dart';
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';
import 'package:battleasia_app/presentation/widgets/play/match_spots_progress.dart';

/// Room join confirm sheet — layout parity with web `MatchJoinDialog`.
class MatchJoinSheet extends StatelessWidget {
  final MatchModel match;
  final double balance;
  final bool joining;
  final VoidCallback onClose;
  final VoidCallback onConfirm;

  const MatchJoinSheet({
    super.key,
    required this.match,
    required this.balance,
    required this.joining,
    required this.onClose,
    required this.onConfirm,
  });

  String _formatSchedule(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw).toLocal();
      return DateFormat.yMMMd().add_jm().format(dt);
    } catch (_) {
      return raw;
    }
  }

  Widget _cover(String url) {
    if (url.startsWith('assets/')) {
      return Image.asset(
        url,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (_, __, ___) => ColoredBox(color: AppColors.panel),
      );
    }
    return ImageUtils.networkImage(
      url,
      fit: BoxFit.cover,
      width: double.infinity,
      height: double.infinity,
      memCacheWidth: 900,
      errorWidget: ColoredBox(color: AppColors.panel),
    );
  }

  Widget _specCell(String label, Widget value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            color: AppColors.textMuted,
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.7,
          ),
        ),
        const SizedBox(height: 4),
        DefaultTextStyle(
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            height: 1.35,
          ),
          child: value,
        ),
      ],
    );
  }

  Widget _coin(double amount, {double size = 14}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/currency.webp',
          width: size,
          height: size,
          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
        ),
        const SizedBox(width: 4),
        Text(
          amount.toStringAsFixed(0),
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: size + 1),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final used = match.participantsCount ?? 0;
    final cap = match.totalPlayer;
    final insufficient = match.entryFee > balance;
    final isFull = !isMatchJoinableByCapacity(
      participantsCount: match.participantsCount,
      totalPlayer: match.totalPlayer,
    );
    final coverUrl = MatchCoverUtils.resolve(match);

    final cells = <(String, Widget)>[
      ('match.game'.tr(), Text(match.gameName.isNotEmpty ? match.gameName : '—')),
      ('match.schedule'.tr(), Text(_formatSchedule(match.matchSchedule))),
      ('match.teamType'.tr(), Text(match.teamType ?? '—')),
      ('match.map'.tr(), Text(match.map ?? 'match.mapTbd'.tr())),
      ('match.typeLabel'.tr(), Text(match.matchType ?? '—')),
      (
        'match.entryFee'.tr(),
        match.entryFee <= 0 ? Text('match.free'.tr()) : _coin(match.entryFee),
      ),
      ('match.perKill'.tr(), _coin(match.perKill)),
      (
        'match.yourBalance'.tr(),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _coin(balance, size: 14),
            if (insufficient) ...[
              const SizedBox(width: 6),
              Text(
                'match.insufficient'.tr(),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Colors.red.shade400,
                ),
              ),
            ],
          ],
        ),
      ),
    ];

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420, maxHeight: 720),
        decoration: AppTheme.surfaceCard(radius: 20),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _cover(coverUrl),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.35),
                          Colors.black.withValues(alpha: 0.82),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      onPressed: onClose,
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.black.withValues(alpha: 0.55),
                        foregroundColor: Colors.white,
                      ),
                      icon: const Icon(Icons.close, size: 20),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 14,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'match.secureEntry'.tr().toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.1,
                            color: AppColors.gold.withValues(alpha: 0.9),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          match.matchName.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            height: 1.15,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withValues(alpha: 0.22),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                              color: AppColors.gold.withValues(alpha: 0.35),
                            ),
                          ),
                          child: Text(
                            '$used/$cap ${'match.spots'.tr()}',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 14, 18, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'match.joinMatchFor'.tr(namedArgs: {'name': match.matchName}),
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.62),
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 14),
                    for (var i = 0; i < cells.length; i += 2)
                      Padding(
                        padding: EdgeInsets.only(
                          bottom: i + 2 < cells.length ? 14 : 0,
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: _specCell(cells[i].$1, cells[i].$2),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: i + 1 < cells.length
                                  ? _specCell(cells[i + 1].$1, cells[i + 1].$2)
                                  : const SizedBox.shrink(),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 12),
                    MatchSpotsProgress(
                      participantsCount: match.participantsCount,
                      totalPlayer: match.totalPlayer,
                      variant: MatchSpotsProgressVariant.compact,
                    ),
                    if (match.prizeDescription != null &&
                        match.prizeDescription!.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      const Divider(height: 1, color: Color(0x14FFFFFF)),
                      const SizedBox(height: 12),
                      Text(
                        'match.prize'.tr().toUpperCase(),
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.7,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        match.prizeDescription!,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 8, 18, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  GoldButton(
                    label: isFull
                        ? 'match.matchFull'.tr()
                        : 'match.joinMatch'.tr(),
                    onPressed: (joining || insufficient || isFull) ? null : onConfirm,
                    loading: joining,
                    height: 48,
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: joining ? null : onClose,
                    child: Text('match.cancel'.tr()),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
