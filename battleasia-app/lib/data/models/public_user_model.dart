class PublicUserModel {
  final String id;
  final String name;
  final String email;
  final String? avatar;
  final String? phoneNumber;
  final String? playerName;
  final String? pubgId;
  final String? gameServer;
  final String? role;
  final DateTime? createdAt;

  PublicUserModel({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
    this.phoneNumber,
    this.playerName,
    this.pubgId,
    this.gameServer,
    this.role,
    this.createdAt,
  });

  factory PublicUserModel.fromJson(Map<String, dynamic> json) {
    return PublicUserModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['username']?.toString() ?? 'Unknown',
      email: json['email']?.toString() ?? '',
      avatar: json['avatar']?.toString(),
      phoneNumber: json['phoneNumber']?.toString() ?? json['phone']?.toString(),
      playerName: json['playerName']?.toString() ?? json['pubgName']?.toString(),
      pubgId: json['pubgId']?.toString() ?? json['pubgUserId']?.toString(),
      gameServer: json['gameServer']?.toString() ?? json['server']?.toString(),
      role: json['role']?['name']?.toString() ?? json['roleName']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar': avatar,
      'phoneNumber': phoneNumber,
      'playerName': playerName,
      'pubgId': pubgId,
      'gameServer': gameServer,
      'role': role,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
