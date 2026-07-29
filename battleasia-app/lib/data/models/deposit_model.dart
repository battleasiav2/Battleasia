class DepositModel {
  final String id;
  final String userEmail;
  final String username;
  final String transactionId;
  final double coinAmount;
  final String paymentCurrency;
  final double paymentAmount;
  final String fromAddress;
  final Map<String, dynamic>? paymentChannel;
  final String toWalletAddress;
  final String status; // 'pending', 'completed', 'rejected'
  final DateTime? createdAt;
  final DateTime? processedAt;
  final String? processedBy;
  final String? rejectionReason;
  final String? notes;

  DepositModel({
    required this.id,
    required this.userEmail,
    required this.username,
    required this.transactionId,
    required this.coinAmount,
    required this.paymentCurrency,
    required this.paymentAmount,
    required this.fromAddress,
    this.paymentChannel,
    required this.toWalletAddress,
    required this.status,
    this.createdAt,
    this.processedAt,
    this.processedBy,
    this.rejectionReason,
    this.notes,
  });

  factory DepositModel.fromJson(Map<String, dynamic> json) {
    return DepositModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userEmail: json['user_email']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      transactionId: json['transaction_id']?.toString() ?? '',
      coinAmount: (json['coin_amount'] is num) ? json['coin_amount'].toDouble() : 0.0,
      paymentCurrency: json['payment_currency']?.toString() ?? '',
      paymentAmount: (json['payment_amount'] is num) ? json['payment_amount'].toDouble() : 0.0,
      fromAddress: json['from_address']?.toString() ?? '',
      paymentChannel: json['payment_channel'] is Map<String, dynamic>
          ? Map<String, dynamic>.from(json['payment_channel'])
          : null,
      toWalletAddress: json['to_wallet_address']?.toString() ?? '',
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
    );
  }

  String get channelName =>
      paymentChannel?['channel_name']?.toString() ?? 'Unknown Channel';

  String get channelIcon =>
      paymentChannel?['icon']?.toString() ?? '';
}
