class LeaderboardEntryModel {
  final String id;
  final int rank;
  final String username;
  final String? avatar;
  final int totalScore;
  final int gamesPlayed;
  final double averageScore;
  final String badge;
  final int level;
  final String? lastPlayed;
  final int? totalKills;

  LeaderboardEntryModel({
    required this.id,
    required this.rank,
    required this.username,
    this.avatar,
    required this.totalScore,
    required this.gamesPlayed,
    required this.averageScore,
    required this.badge,
    required this.level,
    this.lastPlayed,
    this.totalKills,
  });

  factory LeaderboardEntryModel.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntryModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      rank: json['rank'] as int? ?? 0,
      username: json['username']?.toString() ?? '',
      avatar: json['avatar']?.toString(),
      totalScore: (json['totalScore'] as num?)?.toInt() ?? 
                  (json['total_score'] as num?)?.toInt() ?? 0,
      gamesPlayed: (json['gamesPlayed'] as num?)?.toInt() ?? 
                   (json['games_played'] as num?)?.toInt() ?? 0,
      averageScore: (json['averageScore'] as num?)?.toDouble() ?? 
                    (json['average_score'] as num?)?.toDouble() ?? 0.0,
      badge: json['badge']?.toString() ?? 'Advanced',
      level: (json['level'] as num?)?.toInt() ?? 0,
      lastPlayed: json['lastPlayed']?.toString() ?? 
                  json['last_played']?.toString(),
      totalKills: (json['totalKills'] as num?)?.toInt() ?? 
                  (json['total_kills'] as num?)?.toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'rank': rank,
      'username': username,
      'avatar': avatar,
      'totalScore': totalScore,
      'gamesPlayed': gamesPlayed,
      'averageScore': averageScore,
      'badge': badge,
      'level': level,
      'lastPlayed': lastPlayed,
      'totalKills': totalKills,
    };
  }
}

