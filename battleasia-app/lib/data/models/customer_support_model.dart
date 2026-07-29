/// Customer Support Models
/// Based on the backend API structure

class ConversationModel {
  final String id;
  final String userId;
  final String status;
  final String? createdAt;
  final String? updatedAt;
  final String? closedAt;

  ConversationModel({
    required this.id,
    required this.userId,
    required this.status,
    this.createdAt,
    this.updatedAt,
    this.closedAt,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      status: json['status']?.toString() ?? 'open',
      createdAt:
          json['createdAt']?.toString() ?? json['created_at']?.toString(),
      updatedAt:
          json['updatedAt']?.toString() ?? json['updated_at']?.toString(),
      closedAt: json['closedAt']?.toString() ?? json['closed_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'status': status,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'closedAt': closedAt,
    };
  }
}

class MessageModel {
  final String id;
  final String body;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final bool isAdmin;
  final String? createdAt;
  final List<String> attachments;

  MessageModel({
    required this.id,
    required this.body,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.isAdmin,
    this.createdAt,
    this.attachments = const [],
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    // Helper to safely get string value
    String? getString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      return value.toString();
    }

    // Helper to safely get bool value
    bool getBool(dynamic value, {bool defaultValue = false}) {
      if (value == null) return defaultValue;
      if (value is bool) return value;
      if (value is String) {
        return value.toLowerCase() == 'true' || value == '1';
      }
      if (value is int) return value != 0;
      return defaultValue;
    }

    return MessageModel(
      id: getString(json['id']) ?? '',
      body: getString(json['body']) ?? '',
      senderId:
          getString(json['senderId']) ?? getString(json['sender_id']) ?? '',
      senderName:
          getString(json['senderName']) ??
          getString(json['sender_name']) ??
          'Unknown',
      senderAvatar:
          getString(json['senderAvatar']) ?? getString(json['sender_avatar']),
      isAdmin: getBool(json['isAdmin']) || getBool(json['is_admin']),
      createdAt: getString(json['createdAt']) ?? getString(json['created_at']),
      attachments: json['attachments'] != null && json['attachments'] is List
          ? (json['attachments'] as List)
                .map((e) => getString(e) ?? '')
                .where((e) => e.isNotEmpty)
                .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'body': body,
      'senderId': senderId,
      'senderName': senderName,
      'senderAvatar': senderAvatar,
      'isAdmin': isAdmin,
      'createdAt': createdAt,
      'attachments': attachments,
    };
  }
}
