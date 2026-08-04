class StoryItem {
  final String id;
  final String mediaType;
  final String mediaUrl;
  final String caption;
  final int totalViews;
  final String? expiresAt;
  final String? createdAt;
  final bool viewed;

  StoryItem({
    required this.id,
    required this.mediaType,
    required this.mediaUrl,
    required this.caption,
    required this.totalViews,
    this.expiresAt,
    this.createdAt,
    this.viewed = false,
  });

  factory StoryItem.fromJson(Map<String, dynamic> json) {
    return StoryItem(
      id: json['id']?.toString() ?? '',
      mediaType: json['mediaType']?.toString() == 'video' ? 'video' : 'image',
      mediaUrl: json['mediaUrl']?.toString() ?? '',
      caption: json['caption']?.toString() ?? '',
      totalViews: (json['totalViews'] as num?)?.toInt() ?? 0,
      expiresAt: json['expiresAt']?.toString(),
      createdAt: json['createdAt']?.toString(),
      viewed: json['viewed'] == true,
    );
  }

  StoryItem copyWith({bool? viewed}) {
    return StoryItem(
      id: id,
      mediaType: mediaType,
      mediaUrl: mediaUrl,
      caption: caption,
      totalViews: totalViews,
      expiresAt: expiresAt,
      createdAt: createdAt,
      viewed: viewed ?? this.viewed,
    );
  }
}

class StoryGroup {
  final String userId;
  final String username;
  final String avatar;
  final List<StoryItem> stories;

  StoryGroup({
    required this.userId,
    required this.username,
    required this.avatar,
    required this.stories,
  });

  factory StoryGroup.fromJson(Map<String, dynamic> json) {
    final list = json['stories'] as List? ?? [];
    return StoryGroup(
      userId: json['userId']?.toString() ?? '',
      username: json['username']?.toString() ?? 'User',
      avatar: json['avatar']?.toString() ?? '',
      stories: list
          .map((e) => StoryItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  bool get hasUnseen => stories.any((s) => !s.viewed);

  StoryItem? get previewStory {
    for (final s in stories) {
      if (!s.viewed) return s;
    }
    return stories.isNotEmpty ? stories.first : null;
  }
}
