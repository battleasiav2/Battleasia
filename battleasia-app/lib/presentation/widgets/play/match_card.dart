import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/match_cover_utils.dart';
import 'package:battleasia_app/core/utils/match_capacity_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as date_utils;
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class MatchCard extends StatefulWidget {
  final MatchModel match;
  final VoidCallback? onWatchLive;
  final VoidCallback onJoin;
  final VoidCallback? onShowRoomDetails;
  final VoidCallback? onMatchNameTap;
  final VoidCallback? onOpenSeats;
  final bool joining;
  final bool canJoin;
  final bool isJoined;
  final bool showLive;
  final bool isPremiumUser;
  final String? displayRoomId;
  final String? displayPassword;

  const MatchCard({
    super.key,
    required this.match,
    this.onWatchLive,
    required this.onJoin,
    this.onShowRoomDetails,
    this.onMatchNameTap,
    this.onOpenSeats,
    this.joining = false,
    this.canJoin = true,
    this.isJoined = false,
    this.showLive = false,
    this.isPremiumUser = false,
    this.displayRoomId,
    this.displayPassword,
  });

  @override
  State<MatchCard> createState() => _MatchCardState();
}

class _MatchCardState extends State<MatchCard> {
  void _copyField(String raw) {
    final value = raw.trim();
    if (value.isEmpty || value == '—') return;
    Clipboard.setData(ClipboardData(text: value));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('match.roomCopied'.tr()),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.gold.withValues(alpha: 0.92),
      ),
    );
  }

  String _nonEmpty(String? value) {
    final trimmed = value?.trim() ?? '';
    return trimmed.isEmpty ? '—' : trimmed;
  }

  Widget _banner(String bannerUrl) {
    final fallback = Image.asset(
      'assets/images/game.webp',
      fit: BoxFit.cover,
      width: double.infinity,
      height: double.infinity,
    );
    if (bannerUrl.startsWith('assets/')) {
      return Image.asset(
        bannerUrl,
        fit: BoxFit.cover,
        alignment: const Alignment(0, -0.2),
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (_, __, ___) => fallback,
      );
    }
    return ImageUtils.networkImage(
      bannerUrl,
      fit: BoxFit.cover,
      width: double.infinity,
      height: double.infinity,
      memCacheWidth: 900,
      errorWidget: fallback,
    );
  }

  int _prize() {
    final match = widget.match;
    if (match.entryFee > 0 && match.totalPlayer > 0) {
      return (match.entryFee * match.totalPlayer).round();
    }
    final raw = match.prizeDescription ?? '';
    final hit = RegExp(r'(\d[\d,]*)').firstMatch(raw);
    if (hit == null) return 0;
    return int.tryParse(hit.group(1)!.replaceAll(',', '')) ?? 0;
  }

  String _money(num value) {
    if (value == value.roundToDouble()) return value.toStringAsFixed(0);
    return value.toStringAsFixed(2);
  }

  bool get _finished {
    final status = widget.match.status.toLowerCase();
    return status == 'complete' || status == 'cancel';
  }

  String get _actionLabel {
    if (_finished) return 'match.view'.tr();
    if (widget.isJoined) return 'match.lobby'.tr();
    if (widget.canJoin) return 'match.join'.tr();
    return 'match.view'.tr();
  }

  void _onAction() {
    if (widget.joining) return;
    if (!_finished && !widget.isJoined && widget.canJoin) {
      widget.onJoin();
      return;
    }
    if (widget.isJoined) {
      (widget.onShowRoomDetails ?? widget.onMatchNameTap)?.call();
      return;
    }
    widget.onMatchNameTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    final match = widget.match;
    final capacity = getMatchCapacityState(
      participantsCount: match.participantsCount,
      totalPlayer: match.totalPlayer,
    );
    final full = capacity.isFull;
    final used = capacity.joined;
    final cap = capacity.max;
    final prize = _prize();
    final spotPct = cap > 0 ? (used / cap).clamp(0.0, 1.0) : 0.0;
    final code = match.id.length > 6 ? match.id.substring(match.id.length - 6) : match.id;
    final free = match.matchType == 'free' || match.entryFee <= 0;
    final locked = 'match.roomLockedValue'.tr();
    final roomIdText = widget.isJoined
        ? _nonEmpty(widget.displayRoomId ?? match.roomId)
        : locked;
    final passText = widget.isJoined
        ? _nonEmpty(widget.displayPassword ?? match.password)
        : locked;

    return RepaintBoundary(
      child: GestureDetector(
        onTap: widget.onOpenSeats,
        behavior: HitTestBehavior.opaque,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xFF161618),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: widget.isJoined
                  ? AppColors.gold.withValues(alpha: 0.45)
                  : Colors.white.withValues(alpha: 0.08),
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  height: 148,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      _banner(MatchCoverUtils.resolve(match)),
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [Color(0xFF121318), Colors.transparent],
                            stops: [0.0, 0.65],
                          ),
                        ),
                      ),
                      if (widget.showLive)
                        Positioned(
                          top: 0,
                          left: 0,
                          right: 0,
                          child: Container(height: 2, color: AppColors.gold.withValues(alpha: 0.85)),
                        ),
                      if (widget.match.premiumOnly && !widget.isPremiumUser)
                        const Positioned(
                          top: 8,
                          right: 8,
                          child: Icon(Icons.workspace_premium, color: Colors.white, size: 16),
                        ),
                      Positioned(
                        top: 10,
                        left: 12,
                        child: _StatusChip(
                          label: widget.isJoined
                              ? 'match.joined'.tr()
                              : full
                                  ? 'match.full'.tr()
                                  : 'match.openEntry'.tr(),
                          joined: widget.isJoined,
                          full: full && !widget.isJoined,
                        ),
                      ),
                      Positioned(
                        left: 16,
                        bottom: 8,
                        right: 78,
                        child: Text(
                          (match.map ?? '').isEmpty ? 'match.mapTbd'.tr() : match.map!.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ),
                      Positioned(
                        right: 12,
                        bottom: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0A0B0F),
                            borderRadius: BorderRadius.circular(3),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                          ),
                          child: Text(
                            (match.teamType ?? 'Solo').toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        match.matchName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.schedule, size: 13, color: Colors.white.withValues(alpha: 0.55)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              date_utils.DateUtils.formatDateTime(match.matchSchedule),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.55),
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 13),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _Stat(
                              label: 'match.entry'.tr(),
                              value: free ? 'match.free'.tr() : _money(match.entryFee),
                            ),
                          ),
                          Expanded(
                            flex: 1,
                            child: _Stat(
                              label: 'match.prize'.tr(),
                              value: prize > 0 ? _money(prize) : '—',
                              accent: prize > 0,
                            ),
                          ),
                          Expanded(
                            child: _Stat(
                              label: 'match.spots'.tr(),
                              value: '$used',
                              total: '/ $cap',
                              bar: spotPct,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _Stat(
                              label: 'match.roomIdLabel'.tr(),
                              value: roomIdText,
                              muted: !widget.isJoined,
                              copyValue: widget.isJoined ? roomIdText : null,
                              onCopy: widget.isJoined ? () => _copyField(roomIdText) : null,
                            ),
                          ),
                          Expanded(
                            child: _Stat(
                              label: 'match.passLabel'.tr(),
                              value: passText,
                              muted: !widget.isJoined,
                              copyValue: widget.isJoined ? passText : null,
                              onCopy: widget.isJoined ? () => _copyField(passText) : null,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      GoldButton(
                        label: _actionLabel,
                        loading: widget.joining,
                        height: 36,
                        fontSize: 13,
                        borderRadius: 8,
                        onPressed: widget.joining ? null : _onAction,
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.only(top: 8),
                        decoration: BoxDecoration(
                          border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                match.gameName.isEmpty ? 'nav.play'.tr() : match.gameName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 10),
                              ),
                            ),
                            Text(
                              '#${code.toUpperCase()}',
                              style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 10),
                            ),
                          ],
                        ),
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
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool joined;
  final bool full;

  const _StatusChip({required this.label, required this.joined, required this.full});

  @override
  Widget build(BuildContext context) {
    final color = joined
        ? AppColors.gold
        : full
            ? Colors.white.withValues(alpha: 0.45)
            : const Color(0xFFD7DBE3);
    final dot = joined || !full ? AppColors.gold : Colors.white.withValues(alpha: 0.45);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0B0F),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
          const SizedBox(width: 5),
          Text(
            label.toUpperCase(),
            style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.4),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final String? total;
  final bool accent;
  final bool muted;
  final double? bar;
  final String? copyValue;
  final VoidCallback? onCopy;

  const _Stat({
    required this.label,
    required this.value,
    this.total,
    this.accent = false,
    this.muted = false,
    this.bar,
    this.copyValue,
    this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.45),
            fontSize: 9,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 5),
        Row(
          children: [
            Flexible(
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: accent
                      ? AppColors.gold
                      : muted
                          ? Colors.white.withValues(alpha: 0.45)
                          : Colors.white,
                  fontSize: muted ? 14 : 16,
                  fontWeight: FontWeight.w800,
                  letterSpacing: muted ? 1.2 : 0,
                ),
              ),
            ),
            if (total != null)
              Text(
                ' $total',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 11, fontWeight: FontWeight.w500),
              ),
            if (onCopy != null &&
                copyValue != null &&
                copyValue!.trim().isNotEmpty &&
                copyValue != '—')
              Padding(
                padding: const EdgeInsets.only(left: 4),
                child: Material(
                  color: AppColors.gold.withValues(alpha: 0.08),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: AppColors.gold.withValues(alpha: 0.35)),
                  ),
                  child: InkWell(
                    onTap: onCopy,
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.all(6),
                      child: Icon(Icons.copy, size: 14, color: AppColors.gold),
                    ),
                  ),
                ),
              ),
          ],
        ),
        if (bar != null) ...[
          const SizedBox(height: 7),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: SizedBox(
              height: 3,
              child: LinearProgressIndicator(
                value: bar,
                backgroundColor: Colors.white.withValues(alpha: 0.12),
                color: AppColors.gold,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
