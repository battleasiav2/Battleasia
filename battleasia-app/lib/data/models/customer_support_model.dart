/// Customer Support Models
/// Based on the backend API structure

const kTicketCategories = ['payment', 'match', 'account', 'other'];

class ConversationModel {
  final String id;
  final String userId;
  final String status;
  final String subject;
  final String category;
  final String? createdAt;
  final String? updatedAt;
  final String? closedAt;
  final String? lastMessageAt;
  final String? previewBody;
  final List<String> previewAttachments;
  final int attachmentCount;

  ConversationModel({
    required this.id,
    required this.userId,
    required this.status,
    this.subject = 'Support Ticket',
    this.category = 'other',
    this.createdAt,
    this.updatedAt,
    this.closedAt,
    this.lastMessageAt,
    this.previewBody,
    this.previewAttachments = const [],
    this.attachmentCount = 0,
  });

  bool get isClosed => status.toLowerCase() == 'closed';

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    String? getString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      return value.toString();
    }

    final userIdRaw = json['userId'];
    String userId = '';
    if (userIdRaw is Map) {
      userId = getString(userIdRaw['_id']) ?? getString(userIdRaw['id']) ?? '';
    } else {
      userId = getString(userIdRaw) ?? getString(json['user_id']) ?? '';
    }

    final previews = <String>[];
    final rawPreviews = json['previewAttachments'];
    if (rawPreviews is List) {
      for (final e in rawPreviews) {
        final s = getString(e);
        if (s != null && s.isNotEmpty) previews.add(s);
      }
    }

    return ConversationModel(
      id: getString(json['id']) ?? getString(json['_id']) ?? '',
      userId: userId,
      status: getString(json['status']) ?? 'open',
      subject: getString(json['subject']) ?? 'Support Ticket',
      category: getString(json['category']) ?? 'other',
      createdAt: getString(json['createdAt']) ?? getString(json['created_at']),
      updatedAt: getString(json['updatedAt']) ?? getString(json['updated_at']),
      closedAt: getString(json['closedAt']) ?? getString(json['closed_at']),
      lastMessageAt:
          getString(json['lastMessageAt']) ?? getString(json['last_message_at']),
      previewBody:
          getString(json['previewBody']) ?? getString(json['preview_body']),
      previewAttachments: previews,
      attachmentCount: (json['attachmentCount'] as num?)?.toInt() ??
          (json['attachment_count'] as num?)?.toInt() ??
          previews.length,
    );
  }

  ConversationModel copyWith({String? status}) {
    return ConversationModel(
      id: id,
      userId: userId,
      status: status ?? this.status,
      subject: subject,
      category: category,
      createdAt: createdAt,
      updatedAt: updatedAt,
      closedAt: closedAt,
      lastMessageAt: lastMessageAt,
      previewBody: previewBody,
      previewAttachments: previewAttachments,
      attachmentCount: attachmentCount,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'status': status,
      'subject': subject,
      'category': category,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'closedAt': closedAt,
      'lastMessageAt': lastMessageAt,
      'previewBody': previewBody,
      'previewAttachments': previewAttachments,
      'attachmentCount': attachmentCount,
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
    String? getString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      return value.toString();
    }

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
      senderName: getString(json['senderName']) ??
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
