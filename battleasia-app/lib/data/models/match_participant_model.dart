class MatchParticipantModel {
  final String id;
  final String? userId;
  final String username;
  final String? pubgId;
  final String? avatar;
  final String? joinedAt;
  final String? team;
  final bool ready;

  MatchParticipantModel({
    required this.id,
    this.userId,
    required this.username,
    this.pubgId,
    this.avatar,
    this.joinedAt,
    this.team,
    this.ready = false,
  });

  factory MatchParticipantModel.fromJson(Map<String, dynamic> json) {
    return MatchParticipantModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId']?.toString(),
      username: json['username'] ?? '',
      pubgId: json['pubgId'],
      avatar: json['avatar'],
      joinedAt: json['joinedAt'],
      team: json['team'],
      ready: json['ready'] == true,
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

