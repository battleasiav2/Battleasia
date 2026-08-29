class MatchCapacityState {
  final int joined;
  final int max;
  final double percent;
  final bool isFull;
  final int spotsLeft;

  const MatchCapacityState({
    required this.joined,
    required this.max,
    required this.percent,
    required this.isFull,
    required this.spotsLeft,
  });
}

MatchCapacityState getMatchCapacityState({
  int? participantsCount,
  int? totalPlayer,
}) {
  final joined = (participantsCount ?? 0).clamp(0, 999999);
  final max = (totalPlayer ?? 100).clamp(1, 999999);
  final percent = (joined / max * 100).clamp(0, 100).toDouble();
  final isFull = joined >= max;
  final spotsLeft = (max - joined).clamp(0, max);

  return MatchCapacityState(
    joined: joined,
    max: max,
    percent: percent,
    isFull: isFull,
    spotsLeft: spotsLeft,
  );
}

bool isMatchJoinableByCapacity({
  int? participantsCount,
  int? totalPlayer,
}) {
  return !getMatchCapacityState(
    participantsCount: participantsCount,
    totalPlayer: totalPlayer,
  ).isFull;
}
