class ReferralItemModel {
  final String id;
  final String date;
  final String playerName;
  final String status; // 'active' or 'inactive'
  final double? earnings;
  final double totalDeposits;
  final int depositCount;

  ReferralItemModel({
    required this.id,
    required this.date,
    required this.playerName,
    required this.status,
    this.earnings,
    this.totalDeposits = 0,
    this.depositCount = 0,
  });

  factory ReferralItemModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final referralId = json['id']?.toString() ??
        json['_id']?.toString() ??
        json['userId']?.toString() ??
        user?['id']?.toString() ??
        user?['_id']?.toString() ??
        '';

    final playerName = user?['username']?.toString() ??
        json['username']?.toString() ??
        user?['email']?.toString() ??
        json['email']?.toString() ??
        'Unknown Player';

    final createdAt =
        json['createdAt']?.toString() ?? json['joinedAt']?.toString() ?? '';

    final isActive = user?['isActive'] ?? json['isActive'] ?? true;
    final statusValue =
        json['status']?.toString() ?? user?['status']?.toString();

    String referralStatus = 'active';
    if (statusValue == 'inactive' ||
        statusValue == 'deactive' ||
        statusValue == 'banned') {
      referralStatus = 'inactive';
    } else if (isActive == false) {
      referralStatus = 'inactive';
    }

    return ReferralItemModel(
      id: referralId,
      date: createdAt,
      playerName: playerName,
      status: referralStatus,
      earnings: json['earnings'] is num
          ? (json['earnings'] as num).toDouble()
          : json['totalEarnings'] is num
              ? (json['totalEarnings'] as num).toDouble()
              : null,
      totalDeposits: json['totalDeposits'] is num
          ? (json['totalDeposits'] as num).toDouble()
          : 0,
      depositCount: json['depositCount'] is num
          ? (json['depositCount'] as num).toInt()
          : 0,
    );
  }
}
