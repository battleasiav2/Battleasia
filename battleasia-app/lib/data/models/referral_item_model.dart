class ReferralItemModel {
  final String id;
  final String date;
  final String playerName;
  final String status; // 'active' or 'inactive'
  final double? earnings;

  ReferralItemModel({
    required this.id,
    required this.date,
    required this.playerName,
    required this.status,
    this.earnings,
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
    
    final createdAt = json['createdAt']?.toString() ??
        json['joinedAt']?.toString() ??
        '';
    
    final isActive = user?['isActive'] ?? json['isActive'] ?? true;
    final statusValue = json['status']?.toString() ?? user?['status']?.toString();
    
    // Determine status
    String referralStatus = 'active';
    if (statusValue == 'inactive' ||
        statusValue == 'deactive' ||
        statusValue == 'banned') {
      referralStatus = 'inactive';
    } else if (!isActive) {
      referralStatus = 'inactive';
    }

    return ReferralItemModel(
      id: referralId,
      date: createdAt,
      playerName: playerName,
      status: referralStatus,
      earnings: json['earnings'] is num
          ? json['earnings'].toDouble()
          : json['totalEarnings'] is num
              ? json['totalEarnings'].toDouble()
              : null,
    );
  }
}

