import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/time_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as AppDateUtils;
import 'package:battleasia_app/data/models/feed_model.dart';
import 'package:battleasia_app/presentation/screens/account/account_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:url_launcher/url_launcher.dart';

class FeedDetailScreen extends StatefulWidget {
  final String feedId;

  const FeedDetailScreen({super.key, required this.feedId});

  @override
  State<FeedDetailScreen> createState() => _FeedDetailScreenState();
}

class _FeedDetailScreenState extends State<FeedDetailScreen> {
  final ScrollController _scrollController = ScrollController();
  final FeedService _feedService = FeedService();
  final TextEditingController _commentController = TextEditingController();

  FeedModel? _feed;
  List<FeedComment> _comments = [];
  bool _loading = true;
  bool _premiumRestricted = false;
  bool _commentLoading = false;
  bool _submittingComment = false;

  @override
  void initState() {
    super.initState();
    _fetchFeed();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _fetchFeed() async {
    setState(() {
      _loading = true;
      _premiumRestricted = false;
    });

    try {
      final result = await _feedService.getFeedById(widget.feedId);

      if (result['success'] == true && result['data'] != null) {
        final feedData = result['data'] as Map<String, dynamic>;
        final feed = FeedModel.fromJson(feedData);

        // Check premium access on client side as well
        if (feed.premiumOnly && mounted) {
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          final isPremiumUser = authProvider.user?.isPremiumActive ?? false;
          if (!isPremiumUser) {
            setState(() {
              _premiumRestricted = true;
              _loading = false;
            });
            return;
          }
        }

        setState(() {
          _feed = feed;
        });

        // Fetch comments
        _fetchComments();

        // Increment view count
        _feedService.incrementFeedViews(widget.feedId);
      } else {
        // 403 from server means premium restricted
        final statusCode = result['statusCode'] as int?;
        if (statusCode == 403 || (result['message'] as String? ?? '').contains('premium')) {
          if (mounted) {
            setState(() {
              _premiumRestricted = true;
            });
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  result['message'] as String? ?? 'Failed to load feed',
                ),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load feed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _fetchComments() async {
    setState(() {
      _commentLoading = true;
    });

    try {
      final result = await _feedService.getFeedComments(
        widget.feedId,
        limit: 50,
      );

      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final payload = data['results'] ?? data;
        final items = payload is List
            ? payload
            : (payload['results'] as List? ?? []);

        final commentsList = items
            .map((item) => FeedComment.fromJson(item as Map<String, dynamic>))
            .toList();

        if (mounted) {
          setState(() {
            _comments = commentsList;
          });
        }
      }
    } catch (e) {
      // Silently fail for comments
    } finally {
      if (mounted) {
        setState(() {
          _commentLoading = false;
        });
      }
    }
  }

  Future<void> _handleLike() async {
    if (_feed == null) return;

    // Optimistically update UI
    setState(() {
      _feed = FeedModel(
        id: _feed!.id,
        title: _feed!.title,
        description: _feed!.description,
        coverUrl: _feed!.coverUrl,
        status: _feed!.status,
        categoryId: _feed!.categoryId,
        category: _feed!.category,
        author: _feed!.author,
        totalViews: _feed!.totalViews,
        totalShares: _feed!.totalShares,
        totalComments: _feed!.totalComments,
        totalLikes: _feed!.isLiked
            ? _feed!.totalLikes - 1
            : _feed!.totalLikes + 1,
        isLiked: !_feed!.isLiked,
        createdAt: _feed!.createdAt,
        updatedAt: _feed!.updatedAt,
      );
    });

    try {
      final result = await _feedService.toggleFeedLike(widget.feedId);
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        setState(() {
          _feed = FeedModel(
            id: _feed!.id,
            title: _feed!.title,
            description: _feed!.description,
            coverUrl: _feed!.coverUrl,
            status: _feed!.status,
            categoryId: _feed!.categoryId,
            category: _feed!.category,
            author: _feed!.author,
            totalViews: _feed!.totalViews,
            totalShares: _feed!.totalShares,
            totalComments: _feed!.totalComments,
            totalLikes: data['totalLikes'] as int? ?? _feed!.totalLikes,
            isLiked: data['isLiked'] as bool? ?? _feed!.isLiked,
            createdAt: _feed!.createdAt,
            updatedAt: _feed!.updatedAt,
          );
        });
      }
    } catch (e) {
      // Revert on error
      _fetchFeed();
    }
  }

  Future<void> _handleAddComment() async {
    if (_feed == null || _commentController.text.trim().isEmpty) return;

    setState(() {
      _submittingComment = true;
    });

    try {
      final result = await _feedService.addFeedComment(
        widget.feedId,
        _commentController.text.trim(),
      );

      if (result['success'] == true && result['data'] != null) {
        final commentData = result['data'] as Map<String, dynamic>;
        final comment = FeedComment.fromJson(commentData);

        setState(() {
          _comments.insert(0, comment);
          _feed = FeedModel(
            id: _feed!.id,
            title: _feed!.title,
            description: _feed!.description,
            coverUrl: _feed!.coverUrl,
            status: _feed!.status,
            categoryId: _feed!.categoryId,
            category: _feed!.category,
            author: _feed!.author,
            totalViews: _feed!.totalViews,
            totalShares: _feed!.totalShares,
            totalComments:
                commentData['totalComments'] as int? ??
                _feed!.totalComments + 1,
            totalLikes: _feed!.totalLikes,
            isLiked: _feed!.isLiked,
            createdAt: _feed!.createdAt,
            updatedAt: _feed!.updatedAt,
          );
          _commentController.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add comment: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _submittingComment = false;
        });
      }
    }
  }

  void _handleShare(String platform) {
    if (_feed == null) return;

    // Share functionality can be implemented with share_plus package
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Share to $platform feature coming soon')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final bottomPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(60.0, 80.0);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          if (_loading)
            Center(child: const CircularProgressIndicator())
          else if (_feed == null)
            Center(
              child: _premiumRestricted
                  ? _buildPremiumGate(context)
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.article_outlined,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        SizedBox(height: spacing16),
                        Text(
                          'Feed not found',
                          style: AppTheme.heading3.copyWith(color: Colors.grey),
                        ),
                      ],
                    ),
            )
          else
            CustomScrollView(
              controller: _scrollController,
              slivers: [
                SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: horizontalPadding,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: spacing16),
                        _buildNavigationBar(context),
                        SizedBox(height: spacing24),
                        _buildTitle(context),
                        SizedBox(height: spacing16),
                        _buildAuthorInfo(context),
                        SizedBox(height: spacing16),
                        _buildInteractionBar(context),
                        SizedBox(height: spacing24),
                        if (_feed!.coverUrl.isNotEmpty) ...[
                          _buildCoverImage(context),
                          SizedBox(height: spacing24),
                        ],
                        _buildDescription(context),
                        SizedBox(height: spacing24),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
              ],
            ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  Widget _buildPremiumGate(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.workspace_premium,
            size: 72,
            color: Colors.amber.shade600,
          ),
          const SizedBox(height: 16),
          Text(
            'Premium Content',
            style: AppTheme.heading3.copyWith(
              color: Colors.black,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This content is available for premium members only.',
            textAlign: TextAlign.center,
            style: AppTheme.bodyMedium.copyWith(color: Colors.grey[600]),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AccountScreen()),
              );
            },
            icon: const Icon(Icons.workspace_premium, color: Colors.white),
            label: const Text('Get Premium'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade700,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationBar(BuildContext context) {
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    final fontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.arrow_back, size: iconSize, color: Colors.black),
          ),
          Expanded(
            child: Text(
              _feed?.title ?? '',
              style: AppTheme.bodyMedium.copyWith(
                fontSize: fontSize,
                color: Colors.black,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );

    return Text(
      _feed?.title ?? '',
      style: AppTheme.heading2.copyWith(
        color: Colors.black,
        fontWeight: FontWeight.w700,
        fontSize: titleFontSize,
      ),
    );
  }

  Widget _buildAuthorInfo(BuildContext context) {
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    final avatarSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(28.0, 40.0);

    final fontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final captionFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Row(
            children: [
              if (_feed?.author != null) ...[
                _buildAuthorAvatar(context, avatarSize),
                SizedBox(width: spacing12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            _feed!.author!.name,
                            style: AppTheme.bodyMedium.copyWith(
                              fontSize: fontSize,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                            ),
                          ),
                          if (_feed!.author!.role?.name == 'admin') ...[
                            SizedBox(width: spacing8 / 2),
                            Icon(
                              Icons.verified,
                              size: iconSize,
                              color: AppTheme.primaryColor,
                            ),
                          ],
                        ],
                      ),
                      SizedBox(height: spacing8 / 2),
                      Text(
                        '${_feed?.category?.name ?? 'Stake'} - ${_feed?.createdAt != null ? AppDateUtils.DateUtils.formatDate(_feed!.createdAt) : 'N/A'}',
                        style: AppTheme.bodySmall.copyWith(
                          fontSize: captionFontSize,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        // Share buttons
        Row(
          children: [
            IconButton(
              onPressed: () => _handleShare('facebook'),
              icon: Icon(Icons.facebook, size: iconSize, color: Colors.black),
            ),
            IconButton(
              onPressed: () => _handleShare('twitter'),
              icon: Icon(Icons.share, size: iconSize, color: Colors.black),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAuthorAvatar(BuildContext context, double size) {
    final avatarUrl = ImageUtils.getImageUrl(_feed?.author?.avatarUrl);
    final radius = size / 2;

    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: AppTheme.textSecondary.withOpacity(0.1),
        backgroundImage: NetworkImage(avatarUrl),
      );
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppTheme.primaryColor,
      child: Text(
        (_feed?.author?.name ?? 'U').substring(0, 1).toUpperCase(),
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildInteractionBar(BuildContext context) {
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    final fontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: _handleLike,
            icon: Icon(
              _feed?.isLiked == true ? Icons.favorite : Icons.favorite_border,
              size: iconSize,
              color: _feed?.isLiked == true
                  ? Colors.red
                  : AppTheme.textSecondary,
            ),
          ),
          Text(
            '${_feed?.totalLikes ?? 0}',
            style: AppTheme.bodyMedium.copyWith(
              fontSize: fontSize,
              color: Colors.black,
            ),
          ),
          SizedBox(width: spacing16),
          IconButton(
            onPressed: _showCommentsDialog,
            icon: Icon(
              Icons.comment_outlined,
              size: iconSize,
              color: AppTheme.textSecondary,
            ),
          ),
          InkWell(
            onTap: _showCommentsDialog,
            child: Text(
              '${_feed?.totalComments ?? 0}',
              style: AppTheme.bodyMedium.copyWith(
                fontSize: fontSize,
                color: Colors.black,
              ),
            ),
          ),
          const Spacer(),
          Row(
            children: [
              Icon(
                Icons.visibility_outlined,
                size: iconSize * 0.8,
                color: AppTheme.textSecondary,
              ),
              SizedBox(width: 4),
              Text(
                '${_feed?.totalViews ?? 0}',
                style: AppTheme.bodyMedium.copyWith(
                  fontSize: fontSize,
                  color: Colors.black,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCoverImage(BuildContext context) {
    final coverImageHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 300.0,
    ).clamp(200.0, 400.0);

    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.primaryColor, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: ImageUtils.networkImage(
            _feed!.coverUrl,
            height: coverImageHeight,
            width: double.infinity,
            fit: BoxFit.cover,
            memCacheWidth: 1080,
            errorWidget: Container(
              height: coverImageHeight,
              color: AppTheme.textSecondary.withOpacity(0.1),
              child: Icon(
                Icons.image_not_supported,
                size: 48,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDescription(BuildContext context) {
    final description = _feed?.description ?? '';
    if (description.isEmpty) return const SizedBox.shrink();
    return _HtmlContentWidget(htmlContent: description);
  }

  // Comments Dialog
  void _showCommentsDialog() {
    showDialog(
      context: context,
      builder: (context) => _CommentsDialog(
        feed: _feed!,
        comments: _comments,
        commentLoading: _commentLoading,
        commentController: _commentController,
        submittingComment: _submittingComment,
        onAddComment: () async {
          await _handleAddComment();
          Navigator.pop(context);
          if (mounted) {
            _showCommentsDialog();
          }
        },
        onClose: () {
          Navigator.pop(context);
        },
      ),
    );
  }
}

class _CommentsDialog extends StatelessWidget {
  final FeedModel feed;
  final List<FeedComment> comments;
  final bool commentLoading;
  final TextEditingController commentController;
  final bool submittingComment;
  final VoidCallback onAddComment;
  final VoidCallback onClose;

  const _CommentsDialog({
    required this.feed,
    required this.comments,
    required this.commentLoading,
    required this.commentController,
    required this.submittingComment,
    required this.onAddComment,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(12.0, 20.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    final avatarSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 40.0,
    ).clamp(36.0, 48.0);

    final fontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final captionFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 18.0,
      max: 24.0,
    );

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.9,
        child: Column(
          children: [
            // Header
            Container(
              padding: EdgeInsets.all(spacing16),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppTheme.textSecondary.withOpacity(0.2),
                  ),
                ),
              ),
              child: Row(
                children: [
                  Text(
                    'Comments',
                    style: AppTheme.heading3.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.w600,
                      fontSize: titleFontSize,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: onClose,
                    icon: Icon(
                      Icons.close,
                      size: iconSize,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
            ),
            // Comments List
            Expanded(
              child: commentLoading
                  ? Center(child: const CircularProgressIndicator())
                  : comments.isEmpty
                  ? Center(
                      child: Text(
                        'No comments yet. Be the first to comment!',
                        style: AppTheme.bodySmall.copyWith(
                          fontSize: captionFontSize,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.all(spacing16),
                      itemCount: comments.length,
                      itemBuilder: (context, index) {
                        final comment = comments[index];
                        return Padding(
                          padding: EdgeInsets.only(bottom: spacing16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                radius: avatarSize / 2,
                                backgroundColor: AppTheme.textSecondary
                                    .withOpacity(0.1),
                                backgroundImage:
                                    ImageUtils.getImageUrl(
                                          comment.user.avatar,
                                        ) !=
                                        null
                                    ? NetworkImage(
                                        ImageUtils.getImageUrl(
                                          comment.user.avatar,
                                        )!,
                                      )
                                    : null,
                                child:
                                    ImageUtils.getImageUrl(
                                          comment.user.avatar,
                                        ) ==
                                        null
                                    ? Text(
                                        comment.user.username
                                            .substring(0, 1)
                                            .toUpperCase(),
                                        style: const TextStyle(
                                          color: Colors.black,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      )
                                    : null,
                              ),
                              SizedBox(width: spacing12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          comment.user.username,
                                          style: AppTheme.bodyMedium.copyWith(
                                            fontSize: fontSize,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.black,
                                          ),
                                        ),
                                        SizedBox(width: spacing8),
                                        Text(
                                          TimeUtils.timeAgo(comment.createdAt),
                                          style: AppTheme.bodySmall.copyWith(
                                            fontSize: captionFontSize,
                                            color: AppTheme.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: spacing8 / 2),
                                    Text(
                                      comment.content,
                                      style: AppTheme.bodyMedium.copyWith(
                                        fontSize: fontSize,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
            // Comment Input
            Container(
              padding: EdgeInsets.all(spacing16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: AppTheme.textSecondary.withOpacity(0.2),
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: commentController,
                      decoration: InputDecoration(
                        hintText:
                            'Add a comment for ${feed.author?.name ?? 'this post'}...',
                        hintStyle: AppTheme.bodySmall.copyWith(
                          fontSize: fontSize,
                          color: AppTheme.textSecondary,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(
                            color: AppTheme.textSecondary.withOpacity(0.2),
                          ),
                        ),
                        filled: true,
                        fillColor: AppTheme.surfaceColor,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: spacing16,
                          vertical: spacing12,
                        ),
                      ),
                      style: AppTheme.bodyMedium.copyWith(
                        fontSize: fontSize,
                        color: Colors.black,
                      ),
                      maxLines: null,
                      onSubmitted: (_) {
                        if (commentController.text.trim().isNotEmpty &&
                            !submittingComment) {
                          onAddComment();
                        }
                      },
                    ),
                  ),
                  SizedBox(width: spacing8),
                  IconButton(
                    onPressed:
                        commentController.text.trim().isNotEmpty &&
                            !submittingComment
                        ? onAddComment
                        : null,
                    icon: submittingComment
                        ? SizedBox(
                            width: iconSize,
                            height: iconSize,
                            child: const CircularProgressIndicator(
                              strokeWidth: 2,
                            ),
                          )
                        : Icon(
                            Icons.send,
                            size: iconSize,
                            color: commentController.text.trim().isNotEmpty
                                ? AppTheme.primaryColor
                                : AppTheme.textSecondary,
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Content Widget — native flutter_html (no WebView / Chromium)
// ─────────────────────────────────────────────────────────────────────────────

class _HtmlContentWidget extends StatelessWidget {
  final String htmlContent;

  const _HtmlContentWidget({required this.htmlContent});

  @override
  Widget build(BuildContext context) {
    return Html(
      data: htmlContent,
      style: {
        'body': Style(
          margin: Margins.zero,
          padding: HtmlPaddings.zero,
          color: const Color(0xFF1A1A1A),
          fontSize: FontSize(16),
          lineHeight: const LineHeight(1.8),
        ),
        'p': Style(margin: Margins.only(bottom: 10)),
        'h1': Style(fontSize: FontSize(1.6, Unit.em), fontWeight: FontWeight.w700),
        'h2': Style(fontSize: FontSize(1.4, Unit.em), fontWeight: FontWeight.w700),
        'h3': Style(fontSize: FontSize(1.2, Unit.em), fontWeight: FontWeight.w700),
        'a': Style(color: AppColors.gold, textDecoration: TextDecoration.underline),
        'img': Style(
          width: Width(100, Unit.percent),
          margin: Margins.symmetric(vertical: 8),
        ),
        'blockquote': Style(
          border: Border(left: BorderSide(color: AppColors.gold, width: 3)),
          padding: HtmlPaddings.only(left: 12),
          fontStyle: FontStyle.italic,
          color: const Color(0xFF555555),
        ),
      },
      onLinkTap: (url, _, __) async {
        if (url == null || url.isEmpty) return;
        final uri = Uri.tryParse(url);
        if (uri != null) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      },
      extensions: [
        TagExtension(
          tagsToExtend: {'img'},
          builder: (extensionContext) {
            final src = extensionContext.attributes['src'];
            if (src == null || src.isEmpty) {
              return const SizedBox.shrink();
            }
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: ImageUtils.networkImage(
                  src,
                  fit: BoxFit.contain,
                  width: double.infinity,
                  memCacheWidth: 1080,
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
