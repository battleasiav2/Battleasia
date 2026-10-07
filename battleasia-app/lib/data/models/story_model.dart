class StorySticker {
  final String emoji;
  final double x;
  final double y;

  const StorySticker({required this.emoji, required this.x, required this.y});

  factory StorySticker.fromJson(Map<String, dynamic> json) {
    return StorySticker(
      emoji: json['emoji']?.toString() ?? '',
      x: (json['x'] as num?)?.toDouble() ?? 50,
      y: (json['y'] as num?)?.toDouble() ?? 50,
    );
  }
}

class StoryItem {
  final String id;
  final String mediaType;
  final String mediaUrl;
  final String caption;
  final String overlayText;
  final List<StorySticker> stickers;
  final int totalViews;
  final String? expiresAt;
  final String? createdAt;
  final bool viewed;
  final Map<String, dynamic>? poll;

  StoryItem({
    required this.id,
    required this.mediaType,
    required this.mediaUrl,
    required this.caption,
    this.overlayText = '',
    this.stickers = const [],
    required this.totalViews,
    this.expiresAt,
    this.createdAt,
    this.viewed = false,
    this.poll,
  });

  factory StoryItem.fromJson(Map<String, dynamic> json) {
    final rawStickers = json['stickers'];
    return StoryItem(
      id: json['id']?.toString() ?? '',
      mediaType: json['mediaType']?.toString() == 'video' ? 'video' : 'image',
      mediaUrl: json['mediaUrl']?.toString() ?? '',
      caption: json['caption']?.toString() ?? '',
      overlayText: json['overlayText']?.toString() ?? '',
      stickers: rawStickers is List
          ? rawStickers
              .whereType<Map>()
              .map((row) => StorySticker.fromJson(Map<String, dynamic>.from(row)))
              .where((s) => s.emoji.isNotEmpty)
              .toList()
          : const [],
      totalViews: (json['totalViews'] as num?)?.toInt() ?? 0,
      expiresAt: json['expiresAt']?.toString(),
      createdAt: json['createdAt']?.toString(),
      viewed: json['viewed'] == true,
      poll: json['poll'] is Map ? Map<String, dynamic>.from(json['poll'] as Map) : null,
    );
  }

  StoryItem copyWith({bool? viewed}) {
    return StoryItem(
      id: id,
      mediaType: mediaType,
      mediaUrl: mediaUrl,
      caption: caption,
      overlayText: overlayText,
      stickers: stickers,
      totalViews: totalViews,
      expiresAt: expiresAt,
      createdAt: createdAt,
      viewed: viewed ?? this.viewed,
      poll: poll,
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
