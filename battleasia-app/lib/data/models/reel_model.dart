class ReelModel {
  final String id;
  final String userId;
  final String username;
  final String avatar;
  final String videoUrl;
  final String caption;
  final String musicTitle;
  final int totalViews;
  final int totalLikes;
  final int totalComments;
  final String? createdAt;

  ReelModel({
    required this.id,
    required this.userId,
    required this.username,
    required this.avatar,
    required this.videoUrl,
    required this.caption,
    required this.musicTitle,
    required this.totalViews,
    required this.totalLikes,
    required this.totalComments,
    this.createdAt,
  });

  factory ReelModel.fromJson(Map<String, dynamic> json) {
    return ReelModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      avatar: json['avatar']?.toString() ?? '',
      videoUrl: json['videoUrl']?.toString() ?? '',
      caption: json['caption']?.toString() ?? '',
      musicTitle: json['musicTitle']?.toString() ?? '',
      totalViews: (json['totalViews'] as num?)?.toInt() ?? 0,
      totalLikes: (json['totalLikes'] as num?)?.toInt() ?? 0,
      totalComments: (json['totalComments'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt']?.toString(),
    );
  }
}
