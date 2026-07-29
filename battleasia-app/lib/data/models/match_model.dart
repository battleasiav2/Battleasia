class MatchModel {
  final String id;
  final String gameId;
  final String gameName;
  final String matchName;
  final String? matchUrl;
  final String? matchSchedule;
  final String? killRateType;
  final double entryFee;
  final int totalPlayer;
  final String? teamType;
  final double perKill;
  final String? matchType;
  final String? map;
  final String? banner;
  final String? prizeDescription;
  final String? matchSponsor;
  final String? matchDescription;
  final String? matchPrivateDescription;
  final String status; // "active" | "deactive" | "start" | "complete" | "cancel"
  final String? createdAt;
  final int? participantsCount;
  final bool isJoined;
  final String? roomId;
  final String? password;
  final bool premiumOnly;

  MatchModel({
    required this.id,
    required this.gameId,
    required this.gameName,
    required this.matchName,
    this.matchUrl,
    this.matchSchedule,
    this.killRateType,
    required this.entryFee,
    required this.totalPlayer,
    this.teamType,
    required this.perKill,
    this.matchType,
    this.map,
    this.banner,
    this.prizeDescription,
    this.matchSponsor,
    this.matchDescription,
    this.matchPrivateDescription,
    required this.status,
    this.createdAt,
    this.participantsCount,
    this.isJoined = false,
    this.roomId,
    this.password,
    this.premiumOnly = false,
  });

  factory MatchModel.fromJson(Map<String, dynamic> json) {
    return MatchModel(
      id: json['_id'] ?? json['id'] ?? '',
      gameId: json['gameId'] ?? '',
      gameName: json['gameName'] ?? '',
      matchName: json['matchName'] ?? '',
      matchUrl: json['matchUrl'],
      matchSchedule: json['matchSchedule'],
      killRateType: json['killRateType'],
      entryFee: json['entryFee'] != null
          ? (json['entryFee'] is int
              ? json['entryFee'].toDouble()
              : json['entryFee'] as double)
          : 0.0,
      totalPlayer: json['totalPlayer'] ?? 0,
      teamType: json['teamType'],
      perKill: json['perKill'] != null
          ? (json['perKill'] is int
              ? json['perKill'].toDouble()
              : json['perKill'] as double)
          : 0.0,
      matchType: json['matchType'],
      map: json['map'],
      banner: json['banner'],
      prizeDescription: json['prizeDescription'],
      matchSponsor: json['matchSponsor'],
      matchDescription: json['matchDescription'],
      matchPrivateDescription: json['matchPrivateDescription'],
      status: json['status'] ?? 'active',
      createdAt: json['createdAt'],
      participantsCount: json['participantsCount'],
      isJoined: json['isJoined'] ?? false,
      roomId: json['roomId'],
      password: json['password'],
      premiumOnly: json['premiumOnly'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'id': id,
      'gameId': gameId,
      'gameName': gameName,
      'matchName': matchName,
      'matchUrl': matchUrl,
      'matchSchedule': matchSchedule,
      'killRateType': killRateType,
      'entryFee': entryFee,
      'totalPlayer': totalPlayer,
      'teamType': teamType,
      'perKill': perKill,
      'matchType': matchType,
      'map': map,
      'banner': banner,
      'prizeDescription': prizeDescription,
      'matchSponsor': matchSponsor,
      'matchDescription': matchDescription,
      'matchPrivateDescription': matchPrivateDescription,
      'status': status,
      'createdAt': createdAt,
      'participantsCount': participantsCount,
      'isJoined': isJoined,
      'roomId': roomId,
      'password': password,
      'premiumOnly': premiumOnly,
    };
  }
}

