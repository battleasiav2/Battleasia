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

  DirectMessageModel({
    required this.id,
    required this.body,
    required this.senderId,
    this.createdAt,
    this.attachments = const [],
  });

  factory DirectMessageModel.fromJson(Map<String, dynamic> json) {
    final raw = json['attachments'];
    final urls = raw is List
        ? raw.map((e) => e.toString()).where((e) => e.isNotEmpty).toList()
        : <String>[];
    return DirectMessageModel(
      id: json['id']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      createdAt: json['createdAt']?.toString(),
      attachments: urls,
    );
  }
}
