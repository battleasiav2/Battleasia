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
import 'package:battleasia_app/presentation/widgets/social/external_messaging_panel.dart';
import 'package:battleasia_app/presentation/widgets/social/new_chat_sheet.dart';
import 'package:battleasia_app/presentation/widgets/social/reel_create_sheet.dart';
import 'package:image_picker/image_picker.dart';
import 'package:battleasia_app/core/config/app_config.dart';

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
                labelStyle: TextStyle(color: AppColors.gold),
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
                      backgroundImage: ImageUtils.networkProvider(avatar),
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
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _posts.length,
            itemBuilder: (context, index) {
              final feed = _posts[index];
              return FeedItem(
                feed: feed,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => FeedDetailScreen(feedId: feed.id),
                    ),
                  );
                },
              );
            },
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: () async {
              final ok = await ReelCreateSheet.show(context);
              if (ok) _load();
            },
            icon: Icon(Icons.add_circle_outline, color: AppColors.gold),
            label: Text(
              'reels.createReel'.tr(),
              style: AppTheme.bodyMedium.copyWith(
                color: AppColors.gold,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
        if (_loading)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
          )
        else if (_error != null)
          Padding(
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
          )
        else if (_reels.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32),
            child: Center(
              child: Text(
                'feedHub.noReels'.tr(),
                style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
              ),
            ),
          )
        else
          GridView.builder(
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
              return GestureDetector(
                onTap: () => _openReel(reel),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      ImageUtils.networkImage(
                        reel.videoUrl,
                        fit: BoxFit.cover,
                        memCacheWidth: 600,
                      ),
                      const Center(
                        child: Icon(Icons.play_circle_fill, color: Colors.white, size: 40),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
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
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _feeds.length,
      itemBuilder: (context, index) {
        final feed = _feeds[index];
        return FeedItem(
          feed: feed,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => FeedDetailScreen(feedId: feed.id),
              ),
            );
          },
        );
      },
    );
  }
}

class FeedMessagesPanel extends StatefulWidget {
  const FeedMessagesPanel({super.key, this.initialUserId});

  final String? initialUserId;

  @override
  State<FeedMessagesPanel> createState() => _FeedMessagesPanelState();
}

class _FeedMessagesPanelState extends State<FeedMessagesPanel> {
  final SocialService _socialService = SocialService();
  final FeedService _feedService = FeedService();
  final ImagePicker _picker = ImagePicker();

  bool _loading = true;
  bool _settingsLoading = true;
  MessagingSettingsModel? _messagingSettings;
  List<ConversationModel> _conversations = [];
  ConversationModel? _active;
  List<DirectMessageModel> _messages = [];
  final TextEditingController _composer = TextEditingController();
  List<String> _pendingAttachments = [];
  bool _uploading = false;
  bool _initialUserHandled = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _composer.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await _loadMessagingSettings();
    if (!mounted) return;

    final builtinEnabled = _messagingSettings?.builtinEnabled ?? true;
    if (!builtinEnabled) {
      setState(() => _loading = false);
      return;
    }

    await _loadConversations();
    final initialUserId = widget.initialUserId;
    if (initialUserId != null && initialUserId.isNotEmpty && !_initialUserHandled) {
      _initialUserHandled = true;
      await _startConversationWithUser(initialUserId);
    }
  }

  Future<void> _loadMessagingSettings() async {
    setState(() => _settingsLoading = true);
    final result = await _socialService.getMessagingSettings();
    if (!mounted) return;
    setState(() {
      if (result['success'] == true) {
        _messagingSettings = MessagingSettingsModel.fromJson(
          result['data'] as Map<String, dynamic>?,
        );
      } else {
        _messagingSettings = MessagingSettingsModel(
          builtinEnabled: true,
          providers: const [],
        );
      }
      _settingsLoading = false;
    });
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

  Future<void> _startConversationWithUser(String participantId) async {
    final existing = _conversations.where((c) => c.otherUserId == participantId);
    if (existing.isNotEmpty) {
      await _openConversation(existing.first);
      return;
    }

    final result = await _socialService.createConversation(participantId);
    if (!mounted || result['success'] != true) return;

    final data = result['data'] as Map<String, dynamic>? ?? {};
    final conversationId = data['id']?.toString() ?? '';
    if (conversationId.isEmpty) return;

    final participant = data['participant'] as Map<String, dynamic>?;
    final conversation = ConversationModel(
      id: conversationId,
      otherUserId: participant?['id']?.toString() ?? participantId,
      otherUsername: participant?['username']?.toString() ?? 'User',
      otherAvatar: participant?['avatar']?.toString() ?? '',
      lastMessagePreview: '',
    );

    setState(() {
      _conversations = [
        conversation,
        ..._conversations.where((c) => c.id != conversationId),
      ];
    });
    await _openConversation(conversation);
  }

  Future<void> _openConversation(ConversationModel conversation) async {
    setState(() {
      _active = conversation;
      _messages = [];
      _pendingAttachments = [];
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

  Future<void> _openNewChat() async {
    final userId = await NewChatSheet.show(context);
    if (userId != null && userId.isNotEmpty) {
      await _startConversationWithUser(userId);
    }
  }

  Future<void> _attachImage() async {
    if (_uploading || _active == null) return;
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked == null) return;

    setState(() => _uploading = true);
    final upload = await _feedService.uploadMedia(picked.path, folder: 'messages');
    if (!mounted) return;
    setState(() => _uploading = false);

    if (upload['success'] == true) {
      var url = upload['data']?['url']?.toString() ?? '';
      if (url.isNotEmpty && !url.startsWith('http')) {
        url = '${AppConfig.serverUrl}$url';
      }
      if (url.isNotEmpty) {
        setState(() => _pendingAttachments = [..._pendingAttachments, url]);
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(upload['message']?.toString() ?? 'Upload failed')),
      );
    }
  }

  Future<void> _sendMessage() async {
    final text = _composer.text.trim();
    final active = _active;
    if (active == null) return;
    if (text.isEmpty && _pendingAttachments.isEmpty) return;

    final attachments = List<String>.from(_pendingAttachments);
    _composer.clear();
    setState(() => _pendingAttachments = []);

    await _socialService.sendDirectMessage(
      active.id,
      text,
      attachments: attachments.isEmpty ? null : attachments,
    );
    await _openConversation(active);
    await _loadConversations();
  }

  @override
  Widget build(BuildContext context) {
    if (_settingsLoading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }

    if (_messagingSettings?.builtinEnabled == false) {
      return ExternalMessagingPanel(settings: _messagingSettings!);
    }

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
                onPressed: () => setState(() {
                  _active = null;
                  _pendingAttachments = [];
                }),
                icon: Icon(Icons.arrow_back, color: AppColors.gold),
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
          ..._messages.map(_buildMessageBubble),
          if (_pendingAttachments.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 72,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _pendingAttachments.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final url = _pendingAttachments[index];
                  return Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: ImageUtils.networkImage(
                          url,
                          width: 72,
                          height: 72,
                          fit: BoxFit.cover,
                          memCacheWidth: 216,
                        ),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.close, size: 18, color: Colors.white),
                          onPressed: () {
                            setState(() {
                              _pendingAttachments = List<String>.from(_pendingAttachments)
                                ..removeAt(index);
                            });
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              IconButton(
                onPressed: _uploading ? null : _attachImage,
                icon: _uploading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Icon(Icons.image_outlined, color: AppColors.gold),
                tooltip: 'messages.attachImage'.tr(),
              ),
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
                icon: Icon(Icons.send, color: AppColors.gold),
              ),
            ],
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: _openNewChat,
            icon: Icon(Icons.add_comment_outlined, color: AppColors.gold),
            label: Text(
              'messages.newChat'.tr(),
              style: AppTheme.bodyMedium.copyWith(
                color: AppColors.gold,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
        if (_conversations.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32),
            child: Center(
              child: Text(
                'feedHub.noConversations'.tr(),
                style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
              ),
            ),
          )
        else
          ..._conversations.map(
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
          ),
      ],
    );
  }

  Widget _buildMessageBubble(DirectMessageModel message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 320),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(2),
            border: Border.all(color: AppColors.border(0.12)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (message.body.isNotEmpty)
                Text(
                  message.body,
                  style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
                ),
              if (message.attachments.isNotEmpty) ...[
                if (message.body.isNotEmpty) const SizedBox(height: 8),
                ...message.attachments.map(
                  (url) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: ImageUtils.networkImage(
                        url,
                        width: 200,
                        fit: BoxFit.cover,
                        memCacheWidth: 600,
                        errorWidget: const Icon(Icons.broken_image),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
