class MatchParticipantModel {
  final String id;
  final String username;
  final String? pubgId;
  final String? avatar;
  final String? joinedAt;
  final String? team;

  MatchParticipantModel({
    required this.id,
    required this.username,
    this.pubgId,
    this.avatar,
    this.joinedAt,
    this.team,
  });

  factory MatchParticipantModel.fromJson(Map<String, dynamic> json) {
    return MatchParticipantModel(
      id: json['_id'] ?? json['id'] ?? '',
      username: json['username'] ?? '',
      pubgId: json['pubgId'],
      avatar: json['avatar'],
      joinedAt: json['joinedAt'],
      team: json['team'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'id': id,
      'username': username,
      'pubgId': pubgId,
      'avatar': avatar,
      'joinedAt': joinedAt,
      'team': team,
    };
  }
}

