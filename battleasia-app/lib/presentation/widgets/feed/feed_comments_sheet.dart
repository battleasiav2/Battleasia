import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/time_utils.dart';
import 'package:battleasia_app/data/models/feed_model.dart';

class FeedCommentsSheet extends StatefulWidget {
  const FeedCommentsSheet({
    super.key,
    required this.feedId,
    this.onCommentAdded,
    this.scrollController,
  });

  final String feedId;
  final VoidCallback? onCommentAdded;
  final ScrollController? scrollController;

  static Future<void> show(
    BuildContext context, {
    required String feedId,
    VoidCallback? onCommentAdded,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final viewInsets = MediaQuery.viewInsetsOf(ctx);
        return Padding(
          padding: EdgeInsets.only(bottom: viewInsets.bottom),
          child: DraggableScrollableSheet(
            initialChildSize: 0.72,
            minChildSize: 0.45,
            maxChildSize: 0.94,
            expand: false,
            builder: (_, scrollController) => FeedCommentsSheet(
              feedId: feedId,
              onCommentAdded: onCommentAdded,
              scrollController: scrollController,
            ),
          ),
        );
      },
    );
  }

  @override
  State<FeedCommentsSheet> createState() => _FeedCommentsSheetState();
}

class _FeedCommentsSheetState extends State<FeedCommentsSheet> {
  final _feedService = FeedService();
  final _controller = TextEditingController();
  List<FeedComment> _comments = [];
  bool _loading = true;
  bool _submitting = false;
  String? _replyParentId;
  String? _replyLabel;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final result = await _feedService.getFeedComments(widget.feedId, limit: 50);
    if (!mounted) return;
    if (result['success'] == true && result['data'] != null) {
      final data = result['data'] as Map<String, dynamic>;
      final payload = data['results'] ?? data;
      final items = payload is List
          ? payload
          : (payload['results'] as List? ?? []);
      setState(() {
        _comments = items
            .map((e) => FeedComment.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _submitting) return;
    setState(() => _submitting = true);
    final result = await _feedService.addFeedComment(
      widget.feedId,
      text,
      parentId: _replyParentId,
    );
    if (!mounted) return;
    setState(() => _submitting = false);
    if (result['success'] == true) {
      _controller.clear();
      setState(() {
        _replyParentId = null;
        _replyLabel = null;
      });
      widget.onCommentAdded?.call();
      await _load();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']?.toString() ?? 'feed.commentFail'.tr()),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _startReply(FeedComment parent, {FeedComment? replyToUser}) {
    final name = replyToUser?.user.username ?? parent.user.username;
    setState(() {
      _replyParentId = parent.id;
      _replyLabel = name;
      _controller.text = '@$name ';
    });
  }

  @override
  Widget build(BuildContext context) {
    final listController = widget.scrollController;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        border: Border.all(color: AppColors.border(0.12)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textMuted.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'feed.comments'.tr(),
                    textAlign: TextAlign.center,
                    style: AppTheme.heading3.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: AppColors.border(0.08)),
          Expanded(
            child: _loading
                ? Center(
                    child: CircularProgressIndicator(color: AppColors.gold),
                  )
                : _comments.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            'feed.noComments'.tr(),
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textMuted,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    : ListView.builder(
                        controller: listController,
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                        itemCount: _comments.length,
                        itemBuilder: (context, index) {
                          final c = _comments[index];
                          return _CommentTile(
                            comment: c,
                            onReply: () => _startReply(c),
                            onReplyToReply: (r) => _startReply(c, replyToUser: r),
                          );
                        },
                      ),
          ),
          if (_replyLabel != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      '${'feed.replyingTo'.tr()} @$_replyLabel',
                      style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
                    ),
                  ),
                  TextButton(
                    onPressed: () => setState(() {
                      _replyParentId = null;
                      _replyLabel = null;
                      _controller.clear();
                    }),
                    child: Text('feed.cancelReply'.tr()),
                  ),
                ],
              ),
            ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      maxLength: 280,
                      decoration: InputDecoration(
                        counterText: '',
                        hintText: _replyParentId != null
                            ? 'feed.replyPh'.tr()
                            : 'feed.commentPh'.tr(),
                        filled: true,
                        fillColor: AppColors.surface,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(999),
                          borderSide: BorderSide(color: AppColors.border(0.15)),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                      ),
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: _submitting ? null : _submit,
                    child: _submitting
                        ? SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.gold,
                            ),
                          )
                        : Text(
                            'feed.send'.tr(),
                            style: TextStyle(
                              color: AppColors.gold,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({
    required this.comment,
    required this.onReply,
    required this.onReplyToReply,
  });

  final FeedComment comment;
  final VoidCallback onReply;
  final void Function(FeedComment reply) onReplyToReply;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.surface,
                backgroundImage: ImageUtils.networkProvider(comment.user.avatar),
                child: comment.user.avatar.isEmpty
                    ? Text(
                        comment.user.username.isNotEmpty
                            ? comment.user.username[0].toUpperCase()
                            : '?',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      )
                    : null,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: TextSpan(
                        style: AppTheme.bodyMedium.copyWith(
                          color: AppColors.textPrimary,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(
                            text: comment.user.username,
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                          const TextSpan(text: ' '),
                          TextSpan(text: comment.content),
                          TextSpan(
                            text: '  ${TimeUtils.timeAgo(comment.createdAt)}',
                            style: AppTheme.bodySmall.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    TextButton(
                      onPressed: onReply,
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'feed.reply'.tr(),
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (comment.replies.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 46, top: 4),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border(
                    left: BorderSide(color: AppColors.border(0.12), width: 2),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.only(left: 10),
                  child: Column(
                    children: comment.replies.map((r) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  style: AppTheme.bodySmall.copyWith(
                                    color: AppColors.textPrimary,
                                    height: 1.35,
                                  ),
                                  children: [
                                    TextSpan(
                                      text: r.user.username,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const TextSpan(text: ' '),
                                    TextSpan(text: r.content),
                                  ],
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: () => onReplyToReply(r),
                              child: Text(
                                'feed.reply'.tr(),
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
