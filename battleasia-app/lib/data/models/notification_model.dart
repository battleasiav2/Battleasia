class NotificationModel {
  final String id;
  final String type;
  final String title;
  final String? subject;
  final String category;
  final bool isUnRead;
  final String? avatarUrl;
  final String? createdAt;

  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    this.subject,
    required this.category,
    required this.isUnRead,
    this.avatarUrl,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'general',
      title: json['title']?.toString() ?? json['subject']?.toString() ?? '',
      subject: json['subject']?.toString(),
      category: json['category']?.toString() ?? 'General',
      isUnRead: json['isUnRead'] == true || json['is_unread'] == true,
      avatarUrl: json['avatarUrl']?.toString() ?? json['avatar_url']?.toString(),
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'subject': subject,
      'category': category,
      'isUnRead': isUnRead,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt,
    };
  }
}

