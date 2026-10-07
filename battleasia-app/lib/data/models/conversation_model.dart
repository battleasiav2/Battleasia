class ConversationModel {
  final String id;
  final String otherUserId;
  final String otherUsername;
  final String otherAvatar;
  final String lastMessagePreview;
  final String? lastMessageAt;

  ConversationModel({
    required this.id,
    required this.otherUserId,
    required this.otherUsername,
    required this.otherAvatar,
    required this.lastMessagePreview,
    this.lastMessageAt,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    final participant = json['participant'] as Map<String, dynamic>?;
    return ConversationModel(
      id: json['id']?.toString() ?? '',
      otherUserId: participant?['id']?.toString() ??
          json['otherUserId']?.toString() ??
          '',
      otherUsername: participant?['username']?.toString() ??
          json['otherUsername']?.toString() ??
          'User',
      otherAvatar: participant?['avatar']?.toString() ??
          json['otherAvatar']?.toString() ??
          '',
      lastMessagePreview: json['lastMessagePreview']?.toString() ?? '',
      lastMessageAt: json['lastMessageAt']?.toString(),
    );
  }
}

class DirectMessageModel {
  final String id;
  final String body;
  final String senderId;
  final String? createdAt;
  final List<String> attachments;
  final List<String> reactions;
  final String? replyTo;
  final String senderName;

  DirectMessageModel({
    required this.id,
    required this.body,
    required this.senderId,
    this.createdAt,
    this.attachments = const [],
    this.reactions = const [],
    this.replyTo,
    this.senderName = '',
  });

  DirectMessageModel copyWith({List<String>? reactions}) {
    return DirectMessageModel(
      id: id,
      body: body,
      senderId: senderId,
      createdAt: createdAt,
      attachments: attachments,
      reactions: reactions ?? this.reactions,
      replyTo: replyTo,
      senderName: senderName,
    );
  }

  factory DirectMessageModel.fromJson(Map<String, dynamic> json) {
    final raw = json['attachments'];
    final urls = raw is List
        ? raw.map((e) => e.toString()).where((e) => e.isNotEmpty).toList()
        : <String>[];
    final reactions = json['reactions'];
    return DirectMessageModel(
      id: json['id']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      createdAt: json['createdAt']?.toString(),
      attachments: urls,
      reactions: reactions is List
          ? reactions.map((row) => row is Map ? row['emoji']?.toString() ?? '' : row.toString()).where((e) => e.isNotEmpty).toList()
          : const [],
      replyTo: json['replyTo']?.toString(),
      senderName: json['senderName']?.toString() ?? '',
    );
  }
}
