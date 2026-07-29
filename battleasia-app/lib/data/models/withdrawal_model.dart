class WithdrawalModel {
  final String id;
  final String userEmail;
  final String username;
  final double coinAmount;
  final String walletType;
  final String walletAddress;
  final String currencyType;
  final double currencyAmount;
  final String? description;
  final String status; // 'pending', 'processing', 'completed', 'rejected'
  final DateTime? createdAt;
  final DateTime? processedAt;
  final String? processedBy;
  final String? rejectionReason;
  final String? notes;
  final String? transactionHash;

  WithdrawalModel({
    required this.id,
    required this.userEmail,
    required this.username,
    required this.coinAmount,
    required this.walletType,
    required this.walletAddress,
    required this.currencyType,
    required this.currencyAmount,
    this.description,
    required this.status,
    this.createdAt,
    this.processedAt,
    this.processedBy,
    this.rejectionReason,
    this.notes,
    this.transactionHash,
  });

  factory WithdrawalModel.fromJson(Map<String, dynamic> json) {
    return WithdrawalModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userEmail: json['user_email']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      coinAmount: (json['coin_amount'] is num) ? json['coin_amount'].toDouble() : 0.0,
      walletType: json['wallet_type']?.toString() ?? '',
      walletAddress: json['wallet_address']?.toString() ?? '',
      currencyType: json['currency_type']?.toString() ?? '',
      currencyAmount: (json['currency_amount'] is num) ? json['currency_amount'].toDouble() : 0.0,
      description: json['description']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      processedAt: json['processed_at'] != null
          ? DateTime.tryParse(json['processed_at'].toString())
          : null,
      processedBy: json['processed_by']?.toString(),
      rejectionReason: json['rejection_reason']?.toString(),
      notes: json['notes']?.toString(),
      transactionHash: json['transaction_hash']?.toString(),
    );
  }
}
