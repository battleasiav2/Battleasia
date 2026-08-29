class DashboardTopPlayer {
  final String userId;
  final String username;
  final String? avatar;
  final double totalWinnings;
  final int totalMatches;
  final int totalKills;
  final double winRate;
  final double averageScore;

  const DashboardTopPlayer({
    required this.userId,
    required this.username,
    this.avatar,
    required this.totalWinnings,
    required this.totalMatches,
    required this.totalKills,
    required this.winRate,
    required this.averageScore,
  });

  factory DashboardTopPlayer.fromJson(Map<String, dynamic> json) {
    return DashboardTopPlayer(
      userId: json['userId']?.toString() ?? '',
      username: json['username']?.toString() ?? 'Player',
      avatar: json['avatar']?.toString(),
      totalWinnings: (json['totalWinnings'] as num?)?.toDouble() ?? 0,
      totalMatches: (json['totalMatches'] as num?)?.toInt() ?? 0,
      totalKills: (json['totalKills'] as num?)?.toInt() ?? 0,
      winRate: (json['winRate'] as num?)?.toDouble() ?? 0,
      averageScore: (json['averageScore'] as num?)?.toDouble() ?? 0,
    );
  }
}

class DashboardMatchSummary {
  final String id;
  final String matchName;
  final String? matchSchedule;
  final String status;
  final double entryFee;
  final double perKill;
  final int totalPlayer;
  final double prizeEstimate;
  final String banner;
  final String gameName;
  final int participantsCount;

  const DashboardMatchSummary({
    required this.id,
    required this.matchName,
    this.matchSchedule,
    required this.status,
    required this.entryFee,
    required this.perKill,
    required this.totalPlayer,
    required this.prizeEstimate,
    required this.banner,
    required this.gameName,
    required this.participantsCount,
  });

  factory DashboardMatchSummary.fromJson(Map<String, dynamic> json) {
    return DashboardMatchSummary(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      matchName: json['matchName']?.toString() ?? '',
      matchSchedule: json['matchSchedule']?.toString(),
      status: json['status']?.toString() ?? '',
      entryFee: (json['entryFee'] as num?)?.toDouble() ?? 0,
      perKill: (json['perKill'] as num?)?.toDouble() ?? 0,
      totalPlayer: (json['totalPlayer'] as num?)?.toInt() ?? 0,
      prizeEstimate: (json['prizeEstimate'] as num?)?.toDouble() ?? 0,
      banner: json['banner']?.toString() ?? '',
      gameName: json['gameName']?.toString() ?? '',
      participantsCount: (json['participantsCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class PublicDashboardStats {
  final double totalWinnings;
  final int processedMatches;
  final int ongoingMatches;
  final Map<String, int> liveCountByGame;
  final Map<String, int> participantsByGame;
  final List<DashboardTopPlayer> topProfitPlayers;
  final List<DashboardTopPlayer> topPlayers;
  final List<DashboardMatchSummary> ongoingMatchList;
  final List<DashboardMatchSummary> highPrizeMatches;

  const PublicDashboardStats({
    required this.totalWinnings,
    required this.processedMatches,
    required this.ongoingMatches,
    this.liveCountByGame = const {},
    this.participantsByGame = const {},
    required this.topProfitPlayers,
    required this.topPlayers,
    required this.ongoingMatchList,
    required this.highPrizeMatches,
  });

  static Map<String, int> _parseCountMap(dynamic raw) {
    if (raw is! Map) return {};
    return raw.map(
      (key, value) => MapEntry(key.toString(), (value as num?)?.toInt() ?? 0),
    );
  }

  factory PublicDashboardStats.fromJson(Map<String, dynamic> json) {
    final platform = json['platform'] is Map
        ? Map<String, dynamic>.from(json['platform'] as Map)
        : <String, dynamic>{};

    List<T> parseList<T>(
      dynamic raw,
      T Function(Map<String, dynamic>) map,
    ) {
      if (raw is! List) return [];
      return raw
          .whereType<Map>()
          .map((e) => map(Map<String, dynamic>.from(e)))
          .toList();
    }

    return PublicDashboardStats(
      totalWinnings: (platform['totalWinnings'] as num?)?.toDouble() ?? 0,
      processedMatches: (platform['processedMatches'] as num?)?.toInt() ?? 0,
      ongoingMatches: (platform['ongoingMatches'] as num?)?.toInt() ?? 0,
      liveCountByGame: _parseCountMap(json['liveCountByGame']),
      participantsByGame: _parseCountMap(json['participantsByGame']),
      topProfitPlayers: parseList(
        json['topProfitPlayers'],
        DashboardTopPlayer.fromJson,
      ),
      topPlayers: parseList(json['topPlayers'], DashboardTopPlayer.fromJson),
      ongoingMatchList: parseList(
        json['ongoingMatches'],
        DashboardMatchSummary.fromJson,
      ),
      highPrizeMatches: parseList(
        json['highPrizeMatches'],
        DashboardMatchSummary.fromJson,
      ),
    );
  }
}
