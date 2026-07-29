class MatchHistoryModel {
  final String id;
  final String? matchId;
  final String? gameName;
  final String? matchName;
  final String? matchType;
  final String? teamType;
  final String? map;
  final String? matchSchedule;
  final double? entryFee;
  final String? banner;
  final String? status;
  final int? kills;
  final int? rank;
  final double? amountWon;
  final double? winnings;
  final double? points;
  final double? prize;
  final double? reward;
  final String? createdAt;
  final String? joinedAt;
  final Map<String, dynamic>? match;

  MatchHistoryModel({
    required this.id,
    this.matchId,
    this.gameName,
    this.matchName,
    this.matchType,
    this.teamType,
    this.map,
    this.matchSchedule,
    this.entryFee,
    this.banner,
    this.status,
    this.kills,
    this.rank,
    this.amountWon,
    this.winnings,
    this.points,
    this.prize,
    this.reward,
    this.createdAt,
    this.joinedAt,
    this.match,
  });

  factory MatchHistoryModel.fromJson(Map<String, dynamic> json) {
    final matchData = json['match'] as Map<String, dynamic>?;
    
    return MatchHistoryModel(
      id: json['id']?.toString() ?? 
          json['_id']?.toString() ?? 
          matchData?['id']?.toString() ?? 
          '',
      matchId: json['matchId']?.toString() ?? 
               matchData?['id']?.toString(),
      gameName: matchData?['gameName']?.toString() ?? 
                json['gameName']?.toString() ?? 
                'PUBG MOBILE',
      matchName: matchData?['matchName']?.toString() ?? 
                 json['matchName']?.toString() ?? 
                 'Unknown Match',
      matchType: matchData?['matchType']?.toString() ?? 
                 json['matchType']?.toString() ?? 
                 matchData?['teamType']?.toString() ?? 
                 json['teamType']?.toString(),
      teamType: matchData?['teamType']?.toString() ?? 
                json['teamType']?.toString(),
      map: matchData?['map']?.toString() ?? 
           json['map']?.toString(),
      matchSchedule: matchData?['matchSchedule']?.toString() ?? 
                     json['matchSchedule']?.toString() ?? 
                     json['createdAt']?.toString() ?? 
                     json['joinedAt']?.toString(),
      entryFee: (matchData?['entryFee'] is num) 
          ? matchData!['entryFee'].toDouble() 
          : (json['entryFee'] is num) 
              ? json['entryFee'].toDouble() 
              : 0.0,
      banner: matchData?['banner']?.toString() ?? 
              json['banner']?.toString(),
      status: matchData?['status']?.toString() ?? 
              json['status']?.toString(),
      kills: json['kills'] is num 
          ? json['kills'].toInt() 
          : (json['stats'] is Map && json['stats']?['kills'] is num)
              ? json['stats']['kills'].toInt()
              : null,
      rank: json['rank'] is num 
          ? json['rank'].toInt() 
          : (json['stats'] is Map && json['stats']?['rank'] is num)
              ? json['stats']['rank'].toInt()
              : null,
      amountWon: json['amountWon'] is num ? json['amountWon'].toDouble() : null,
      winnings: json['winnings'] is num ? json['winnings'].toDouble() : null,
      points: json['points'] is num ? json['points'].toDouble() : null,
      prize: json['prize'] is num ? json['prize'].toDouble() : null,
      reward: json['reward'] is num ? json['reward'].toDouble() : null,
      createdAt: json['createdAt']?.toString(),
      joinedAt: json['joinedAt']?.toString(),
      match: matchData,
    );
  }

  // Get prize won from various possible fields
  double get prizeWon {
    return amountWon ?? winnings ?? points ?? prize ?? reward ?? 0.0;
  }

  // Determine status: 'win', 'loss', or 'pending'
  String get matchStatus {
    final matchStatusValue = status?.toLowerCase() ?? '';
    final prize = prizeWon;

    if (matchStatusValue == 'complete' || matchStatusValue == 'finished') {
      return prize > 0 ? 'win' : 'loss';
    } else if (matchStatusValue == 'cancel') {
      return 'loss';
    } else if (matchStatusValue == 'active' || 
               matchStatusValue == 'start' || 
               matchStatusValue == 'ongoing') {
      return 'pending';
    } else if (matchStatusValue == 'deactive' || 
               matchStatusValue == 'upcoming') {
      return 'pending';
    } else if (prize > 0) {
      return 'win';
    } else if (matchSchedule != null) {
      try {
        final scheduleTime = DateTime.parse(matchSchedule!).millisecondsSinceEpoch;
        final now = DateTime.now().millisecondsSinceEpoch;
        if (scheduleTime < now) {
          return prize > 0 ? 'win' : 'loss';
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return 'pending';
  }
}

