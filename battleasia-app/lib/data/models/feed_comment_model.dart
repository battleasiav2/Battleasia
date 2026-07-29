class FeedCommentModel {
  final String id;
  final String feedId;
  final String content;
  final String? createdAt;
  final FeedCommentUser? user;

  FeedCommentModel({
    required this.id,
    required this.feedId,
    required this.content,
    this.createdAt,
    this.user,
  });

  factory FeedCommentModel.fromJson(Map<String, dynamic> json) {
    return FeedCommentModel(
      id: json['id']?.toString() ?? '',
      feedId: json['feedId']?.toString() ?? json['feed_id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString(),
      user: json['user'] != null
          ? FeedCommentUser.fromJson(
              json['user'] is Map<String, dynamic>
                  ? json['user'] as Map<String, dynamic>
                  : {},
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'feedId': feedId,
      'content': content,
      'createdAt': createdAt,
      'user': user?.toJson(),
    };
  }
}

class FeedCommentUser {
  final String id;
  final String username;
  final String avatar;

  FeedCommentUser({
    required this.id,
    required this.username,
    required this.avatar,
  });

  factory FeedCommentUser.fromJson(Map<String, dynamic> json) {
    return FeedCommentUser(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? 'Unknown',
      avatar: json['avatar']?.toString() ?? json['avatarUrl']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'avatar': avatar,
    };
  }
}

