import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/match_participant_model.dart';

/// One tile per spot. Filled tiles show the player photo and name.
class RoomSeats extends StatelessWidget {
  final int total;
  final List<MatchParticipantModel> players;
  final String? selfId;
  final void Function(String userId)? onReport;

  const RoomSeats({
    super.key,
    required this.total,
    required this.players,
    this.selfId,
    this.onReport,
  });

  @override
  Widget build(BuildContext context) {
    final cap = total > players.length ? total : players.length;
    if (cap <= 0) {
      return Text(
        'match.noPlayers'.tr(),
        style: TextStyle(color: Colors.white.withValues(alpha: 0.55)),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: cap,
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 108,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.82,
      ),
      itemBuilder: (context, index) {
        final player = index < players.length ? players[index] : null;
        if (player == null) {
          return _OpenSeat(number: index + 1);
        }
        final canReport = onReport != null &&
            player.userId != null &&
            player.userId!.isNotEmpty &&
            player.userId != selfId;
        return _FilledSeat(
          player: player,
          onReport: canReport ? () => onReport!(player.userId!) : null,
        );
      },
    );
  }
}

class _OpenSeat extends StatelessWidget {
  final int number;
  const _OpenSeat({required this.number});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
            ),
            child: Text(
              number > 0 ? '$number' : '',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.55),
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'match.seatOpen'.tr(),
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.42),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilledSeat extends StatelessWidget {
  final MatchParticipantModel player;
  final VoidCallback? onReport;

  const _FilledSeat({required this.player, this.onReport});

  @override
  Widget build(BuildContext context) {
    final photo = ImageUtils.getImageUrl(player.avatar);
    final initial = player.username.isEmpty ? '?' : player.username[0].toUpperCase();
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFF16181E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.45)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: const Color(0xFF121318),
              backgroundImage: photo != null && photo.isNotEmpty ? NetworkImage(photo) : null,
              child: photo == null || photo.isEmpty
                  ? Text(initial, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700))
                  : null,
            ),
            const SizedBox(height: 8),
            Text(
              player.username,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
            if (onReport != null)
              GestureDetector(
                onTap: onReport,
                child: Text('match.report'.tr(), style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
          ],
        ),
      ),
    );
  }
}
