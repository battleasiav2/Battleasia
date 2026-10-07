import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/data/models/match_participant_model.dart';
import 'package:battleasia_app/presentation/widgets/play/room_seats.dart';

/// Seat board for a room. Anyone signed in can open it, joined or not.
class RoomSeatsDialog extends StatefulWidget {
  final MatchModel match;
  final GamesService gamesService;

  const RoomSeatsDialog({super.key, required this.match, required this.gamesService});

  @override
  State<RoomSeatsDialog> createState() => _RoomSeatsDialogState();
}

class _RoomSeatsDialogState extends State<RoomSeatsDialog> {
  List<MatchParticipantModel> _players = [];
  int _total = 0;
  int _used = 0;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _total = widget.match.totalPlayer;
    _used = widget.match.participantsCount ?? 0;
    _load();
  }

  Future<void> _load() async {
    final result = await widget.gamesService.getMatchDetail(widget.match.id);
    if (!mounted) return;
    if (result['success'] != true) {
      setState(() {
        _loading = false;
        _error = result['message']?.toString() ?? 'Could not load who joined this room.';
      });
      return;
    }
    final data = result['data'] as Map<String, dynamic>?;
    final rows = data?['participants'] as List<dynamic>? ?? [];
    setState(() {
      _loading = false;
      _players = rows
          .whereType<Map>()
          .map((row) => MatchParticipantModel.fromJson(Map<String, dynamic>.from(row)))
          .toList();
      _total = (data?['totalPlayer'] as num?)?.toInt() ?? widget.match.totalPlayer;
      _used = (data?['participantsCount'] as num?)?.toInt() ?? _players.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return Dialog(
      backgroundColor: const Color(0xFF0E1014),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 760, maxHeight: width < 600 ? 640 : 760),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.match.matchName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$_used of $_total joined',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.62), fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, color: Colors.white),
                  ),
                ],
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(_error!, style: const TextStyle(color: AppColors.error)),
                ),
              if (_loading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 28),
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold)),
                )
              else
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 520),
                  child: SingleChildScrollView(
                    child: RoomSeats(total: _total, players: _players),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
