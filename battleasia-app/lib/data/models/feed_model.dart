class FeedModel {
  final String id;
  final String title;
  final String description;
  final String coverUrl;
  final String status;
  final bool premiumOnly;
  final String categoryId;
  final FeedCategory? category;
  final FeedAuthor? author;
  final int totalViews;
  final int totalShares;
  final int totalComments;
  final int totalLikes;
  final bool isLiked;
  final String? createdAt;
  final String? updatedAt;

  FeedModel({
    required this.id,
    required this.title,
    required this.description,
    required this.coverUrl,
    required this.status,
    this.premiumOnly = false,
    required this.categoryId,
    this.category,
    this.author,
    required this.totalViews,
    required this.totalShares,
    required this.totalComments,
    required this.totalLikes,
    required this.isLiked,
    this.createdAt,
    this.updatedAt,
  });

  factory FeedModel.fromJson(Map<String, dynamic> json) {
    return FeedModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      coverUrl: json['coverUrl']?.toString() ?? json['cover_url']?.toString() ?? '',
      status: json['status']?.toString() ?? 'published',
      premiumOnly: json['premiumOnly'] == true,
      categoryId: json['categoryId']?.toString() ?? json['category_id']?.toString() ?? '',
      category: json['category'] != null
          ? FeedCategory.fromJson(
              json['category'] is Map<String, dynamic>
                  ? json['category'] as Map<String, dynamic>
                  : {},
            )
          : null,
      author: json['author'] != null
          ? FeedAuthor.fromJson(
              json['author'] is Map<String, dynamic>
                  ? json['author'] as Map<String, dynamic>
                  : {},
            )
          : null,
      totalViews: (json['totalViews'] ?? json['total_views'] ?? 0) as int,
      totalShares: (json['totalShares'] ?? json['total_shares'] ?? 0) as int,
      totalComments: (json['totalComments'] ?? json['total_comments'] ?? 0) as int,
      totalLikes: (json['totalLikes'] ?? json['total_likes'] ?? 0) as int,
      isLiked: json['isLiked'] == true || json['is_liked'] == true,
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString(),
      updatedAt: json['updatedAt']?.toString() ?? json['updated_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'coverUrl': coverUrl,
      'status': status,
      'premiumOnly': premiumOnly,
      'categoryId': categoryId,
      'category': category?.toJson(),
      'author': author?.toJson(),
      'totalViews': totalViews,
      'totalShares': totalShares,
      'totalComments': totalComments,
      'totalLikes': totalLikes,
      'isLiked': isLiked,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class FeedCategory {
  final String id;
  final String name;
  final String slug;

  FeedCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory FeedCategory.fromJson(Map<String, dynamic> json) {
    return FeedCategory(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
    };
  }
}

class FeedAuthor {
  final String id;
  final String name;
  final String avatarUrl;
  final FeedAuthorRole? role;

  FeedAuthor({
    required this.id,
    required this.name,
    required this.avatarUrl,
    this.role,
  });

  factory FeedAuthor.fromJson(Map<String, dynamic> json) {
    return FeedAuthor(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unknown',
      avatarUrl: json['avatarUrl']?.toString() ?? json['avatar_url']?.toString() ?? '',
      role: json['role'] != null
          ? FeedAuthorRole.fromJson(
              json['role'] is Map<String, dynamic>
                  ? json['role'] as Map<String, dynamic>
                  : {},
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'avatarUrl': avatarUrl,
      'role': role?.toJson(),
    };
  }
}

class FeedAuthorRole {
  final String id;
  final String name;

  FeedAuthorRole({
    required this.id,
    required this.name,
  });

  factory FeedAuthorRole.fromJson(Map<String, dynamic> json) {
    return FeedAuthorRole(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}

class FeedComment {
  final String id;
  final String content;
  final String feedId;
  final String createdAt;
  final FeedCommentUser user;

  FeedComment({
    required this.id,
    required this.content,
    required this.feedId,
    required this.createdAt,
    required this.user,
  });

  factory FeedComment.fromJson(Map<String, dynamic> json) {
    return FeedComment(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      feedId: json['feedId']?.toString() ?? json['feed_id']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString() ?? '',
      user: json['user'] != null
          ? FeedCommentUser.fromJson(
              json['user'] is Map<String, dynamic>
                  ? json['user'] as Map<String, dynamic>
                  : {},
            )
          : FeedCommentUser(id: '', username: 'Unknown', avatar: ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'feedId': feedId,
      'createdAt': createdAt,
      'user': user.toJson(),
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

