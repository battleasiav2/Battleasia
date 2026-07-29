class BalanceHistoryModel {
  final String id;
  final double amount;
  final String type; // 'deposit' or 'withdraw'
  final double balanceBefore;
  final double balanceAfter;
  final String performedBy;
  final Map<String, dynamic> detail;
  final DateTime? createdAt;
  final String status; // 'completed', 'pending', 'processing', 'rejected', 'failed'

  BalanceHistoryModel({
    required this.id,
    required this.amount,
    required this.type,
    required this.balanceBefore,
    required this.balanceAfter,
    required this.performedBy,
    required this.detail,
    this.createdAt,
    this.status = 'completed',
  });

  factory BalanceHistoryModel.fromJson(Map<String, dynamic> json) {
    return BalanceHistoryModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      amount: (json['amount'] is num) ? json['amount'].toDouble() : 0.0,
      type: json['type']?.toString() ?? 'deposit',
      balanceBefore: (json['balanceBefore'] is num)
          ? json['balanceBefore'].toDouble()
          : 0.0,
      balanceAfter: (json['balanceAfter'] is num)
          ? json['balanceAfter'].toDouble()
          : 0.0,
      performedBy: json['performedBy']?.toString() ?? '',
      detail: json['detail'] is Map<String, dynamic>
          ? Map<String, dynamic>.from(json['detail'])
          : <String, dynamic>{},
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      status: json['status']?.toString() ?? 'completed',
    );
  }
}

