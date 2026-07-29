class MatchResultParticipantModel {
  final String id;
  final String username;
  final String? pubgId;
  final String? avatar;
  final String? email;
  final String status; // "winner" | "lose"
  final int placement;
  final int kills;
  final double points;
  final double winPrize;
  final double bonus;
  final double refund;
  final double entryFee;

  MatchResultParticipantModel({
    required this.id,
    required this.username,
    this.pubgId,
    this.avatar,
    this.email,
    required this.status,
    required this.placement,
    required this.kills,
    required this.points,
    required this.winPrize,
    required this.bonus,
    required this.refund,
    required this.entryFee,
  });

  factory MatchResultParticipantModel.fromJson(Map<String, dynamic> json) {
    // userId may be a nested object or a string
    final userObj = json['userId'];
    String username = '';
    String? pubgId;
    String? avatar;
    String? email;
    String id = '';

    if (userObj is Map<String, dynamic>) {
      id = userObj['_id'] ?? userObj['id'] ?? json['_id'] ?? json['id'] ?? '';
      username = userObj['username'] ?? '';
      pubgId = userObj['pubgId'] as String?;
      avatar = userObj['avatar'] as String?;
      email = userObj['email'] as String?;
    } else {
      id = json['_id'] ?? json['id'] ?? '';
      username = json['username'] ?? '';
      pubgId = json['pubgId'] as String?;
      avatar = json['avatar'] as String?;
      email = json['email'] as String?;
    }

    return MatchResultParticipantModel(
      id: id,
      username: username,
      pubgId: pubgId,
      avatar: avatar,
      email: email,
      status: json['status'] ?? 'lose',
      placement: json['placement'] != null ? (json['placement'] as num).toInt() : 0,
      kills: json['kills'] != null ? (json['kills'] as num).toInt() : 0,
      points: json['points'] != null ? (json['points'] as num).toDouble() : 0.0,
      winPrize: json['winPrize'] != null ? (json['winPrize'] as num).toDouble() : 0.0,
      bonus: json['bonus'] != null ? (json['bonus'] as num).toDouble() : 0.0,
      refund: json['refund'] != null ? (json['refund'] as num).toDouble() : 0.0,
      entryFee: json['entryFee'] != null ? (json['entryFee'] as num).toDouble() : 0.0,
    );
  }

  bool get isWinner => status == 'winner';

  double get totalPrize => winPrize + bonus + refund;
}
