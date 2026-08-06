import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/conversation_model.dart';
import 'package:battleasia_app/data/models/feed_model.dart';
import 'package:battleasia_app/data/models/reel_model.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/reel_player_screen.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_item.dart';

class FeedExplorePanel extends StatefulWidget {
  const FeedExplorePanel({super.key});

  @override
  State<FeedExplorePanel> createState() => _FeedExplorePanelState();
}

class _FeedExplorePanelState extends State<FeedExplorePanel> {
  final FeedService _feedService = FeedService();
  bool _loading = true;
  List<FeedModel> _posts = [];
  List<Map<String, dynamic>> _hashtags = [];
  List<Map<String, dynamic>> _creators = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final result = await _feedService.getExplore(limit: 30);
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>;
      final posts = (data['trendingPosts'] as List? ?? [])
          .map((e) => FeedModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _posts = posts;
        _hashtags = List<Map<String, dynamic>>.from(
          data['trendingHashtags'] as List? ?? [],
        );
        _creators = List<Map<String, dynamic>>.from(
          data['recommendedCreators'] as List? ?? [],
        );
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_hashtags.isNotEmpty) ...[
          Text(
            'feedHub.trendingHashtags'.tr(),
            style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _hashtags.map((h) {
              return Chip(
                label: Text('#${h['tag']} (${h['count']})'),
                backgroundColor: AppColors.surfaceElevated,
                labelStyle: const TextStyle(color: AppColors.gold),
                side: BorderSide(color: AppColors.border(0.2)),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
        ],
        if (_creators.isNotEmpty) ...[
          Text(
            'feedHub.recommendedCreators'.tr(),
            style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 88,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _creators.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, i) {
                final c = _creators[i];
                final avatar = ImageUtils.getImageUrl(c['avatar']?.toString());
                return Column(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.gold,
                      backgroundImage: avatar != null && avatar.isNotEmpty
                          ? NetworkImage(avatar)
                          : null,
                      child: avatar == null || avatar.isEmpty
                          ? Text(
                              (c['username']?.toString() ?? 'U')[0]
                                  .toUpperCase(),
                              style: const TextStyle(color: Colors.black),
                            )
                          : null,
                    ),
                    const SizedBox(height: 4),
                    SizedBox(
                      width: 72,
                      child: Text(
                        c['username']?.toString() ?? '',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textMuted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 20),
        ],
        Text(
          'feedHub.trendingPosts'.tr(),
          style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 12),
        if (_posts.isEmpty)
          Text(
            'feedHub.noFeeds'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          )
        else
          ..._posts.map(
            (feed) => FeedItem(
              feed: feed,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => FeedDetailScreen(feedId: feed.id),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

class FeedReelsPanel extends StatefulWidget {
  const FeedReelsPanel({super.key});

  @override
  State<FeedReelsPanel> createState() => _FeedReelsPanelState();
}

class _FeedReelsPanelState extends State<FeedReelsPanel> {
  final SocialService _socialService = SocialService();
  bool _loading = true;
  String? _error;
  List<ReelModel> _reels = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await _socialService.getReels(limit: 30);
      if (!mounted) return;
      if (result['success'] == true) {
        final data = result['data'] as Map<String, dynamic>;
        final items = data['results'] as List? ?? [];
        setState(() {
          _reels = items
              .map((e) => ReelModel.fromJson(e as Map<String, dynamic>))
              .toList();
          _loading = false;
        });
      } else {
        setState(() {
          _loading = false;
          _error = result['message']?.toString() ?? 'feedHub.loadFailed'.tr();
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e.toString();
      });
    }
  }

  Future<void> _openReel(ReelModel reel) async {
    if (!mounted) return;
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ReelPlayerScreen(reel: reel),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }
    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _load,
                child: Text('common.retry'.tr()),
              ),
            ],
          ),
        ),
      );
    }
    if (_reels.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Text(
            'feedHub.noReels'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          ),
        ),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemCount: _reels.length,
      itemBuilder: (context, index) {
        final reel = _reels[index];
        return Material(
          color: AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(2),
          child: InkWell(
            onTap: () => _openReel(reel),
            borderRadius: BorderRadius.circular(2),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.play_circle_fill, color: AppColors.gold),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          reel.username,
                          style: AppTheme.bodyMedium.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Text(
                      reel.caption.isNotEmpty ? reel.caption : reel.musicTitle,
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textMuted,
                      ),
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    '${reel.totalViews} views',
                    style: AppTheme.bodySmall.copyWith(color: AppColors.gold),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class FeedSavedPanel extends StatefulWidget {
  const FeedSavedPanel({super.key});

  @override
  State<FeedSavedPanel> createState() => _FeedSavedPanelState();
}

class _FeedSavedPanelState extends State<FeedSavedPanel> {
  final FeedService _feedService = FeedService();
  bool _loading = true;
  List<FeedModel> _feeds = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final result = await _feedService.getSavedFeeds(limit: 30);
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>;
      final items = data['results'] as List? ?? [];
      setState(() {
        _feeds = items
            .map((e) => FeedModel.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }
    if (_feeds.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Text(
            'feedHub.noSaved'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          ),
        ),
      );
    }
    return Column(
      children: _feeds
          .map(
            (feed) => FeedItem(
              feed: feed,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => FeedDetailScreen(feedId: feed.id),
                  ),
                );
              },
            ),
          )
          .toList(),
    );
  }
}

class FeedMessagesPanel extends StatefulWidget {
  const FeedMessagesPanel({super.key});

  @override
  State<FeedMessagesPanel> createState() => _FeedMessagesPanelState();
}

class _FeedMessagesPanelState extends State<FeedMessagesPanel> {
  final SocialService _socialService = SocialService();
  bool _loading = true;
  List<ConversationModel> _conversations = [];
  ConversationModel? _active;
  List<DirectMessageModel> _messages = [];
  final TextEditingController _composer = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  @override
  void dispose() {
    _composer.dispose();
    super.dispose();
  }

  Future<void> _loadConversations() async {
    setState(() => _loading = true);
    final result = await _socialService.getConversations();
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>;
      final items = data['results'] as List? ?? [];
      setState(() {
        _conversations = items
            .map((e) => ConversationModel.fromJson(e as Map<String, dynamic>))
            .toList();
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  Future<void> _openConversation(ConversationModel conversation) async {
    setState(() {
      _active = conversation;
      _messages = [];
    });
    final result = await _socialService.getDirectMessages(conversation.id);
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>;
      final items = data['results'] as List? ?? [];
      setState(() {
        _messages = items
            .map((e) => DirectMessageModel.fromJson(e as Map<String, dynamic>))
            .toList();
      });
    }
  }

  Future<void> _sendMessage() async {
    final text = _composer.text.trim();
    final active = _active;
    if (text.isEmpty || active == null) return;
    _composer.clear();
    await _socialService.sendDirectMessage(active.id, text);
    await _openConversation(active);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }

    if (_active != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => setState(() => _active = null),
                icon: const Icon(Icons.arrow_back, color: AppColors.gold),
              ),
              Expanded(
                child: Text(
                  _active!.otherUsername,
                  style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ..._messages.map(
            (m) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(2),
                    border: Border.all(color: AppColors.border(0.12)),
                  ),
                  child: Text(
                    m.body,
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _composer,
                  style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              IconButton(
                onPressed: _sendMessage,
                icon: const Icon(Icons.send, color: AppColors.gold),
              ),
            ],
          ),
        ],
      );
    }

    if (_conversations.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Text(
            'feedHub.noConversations'.tr(),
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          ),
        ),
      );
    }

    return Column(
      children: _conversations
          .map(
            (c) => ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.gold,
                child: Text(
                  c.otherUsername.isNotEmpty
                      ? c.otherUsername[0].toUpperCase()
                      : 'U',
                  style: const TextStyle(color: Colors.black),
                ),
              ),
              title: Text(
                c.otherUsername,
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                c.lastMessagePreview,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
              ),
              trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
              onTap: () => _openConversation(c),
            ),
          )
          .toList(),
    );
  }
}
