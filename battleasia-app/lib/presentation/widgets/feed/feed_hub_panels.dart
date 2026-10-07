import 'dart:async';
import 'dart:io';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/conversation_model.dart';
import 'package:battleasia_app/data/models/feed_model.dart';
import 'package:battleasia_app/data/models/reel_model.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/hashtag_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/reel_player_screen.dart';
import 'package:battleasia_app/presentation/screens/profile/public_profile_screen.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_comments_sheet.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_item.dart';
import 'package:battleasia_app/presentation/widgets/social/external_messaging_panel.dart';
import 'package:battleasia_app/presentation/widgets/social/new_chat_sheet.dart';
import 'package:battleasia_app/presentation/widgets/social/reel_create_sheet.dart';
import 'package:image_picker/image_picker.dart';
import 'package:record/record.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

class FeedExplorePanel extends StatefulWidget {
  const FeedExplorePanel({super.key});

  @override
  State<FeedExplorePanel> createState() => _FeedExplorePanelState();
}

class _FeedExplorePanelState extends State<FeedExplorePanel> {
  final FeedService _feedService = FeedService();
  final SocialService _social = SocialService();
  final TextEditingController _search = TextEditingController();
  Timer? _searchTimer;
  bool _loading = true;
  bool _searching = false;
  List<FeedModel> _posts = [];
  List<Map<String, dynamic>> _hashtags = [];
  List<Map<String, dynamic>> _creators = [];
  List<Map<String, dynamic>> _hitUsers = [];
  List<Map<String, dynamic>> _hitPosts = [];
  List<String> _hitTags = [];
  String _query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchTimer?.cancel();
    _search.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _searchTimer?.cancel();
    _searchTimer = Timer(const Duration(milliseconds: 300), () => _searchNow(value));
  }

  Future<void> _searchNow(String raw) async {
    final query = raw.trim();
    if (!mounted) return;
    setState(() => _query = query);
    if (query.isEmpty) {
      setState(() {
        _searching = false;
        _hitUsers = [];
        _hitPosts = [];
        _hitTags = [];
      });
      return;
    }
    setState(() => _searching = true);
    final result = await _social.globalSearch(query);
    if (!mounted || _query != query) return;
    final data = result['data'];
    final map = data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
    setState(() {
      _searching = false;
      _hitUsers = (map['users'] as List? ?? []).whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
      _hitPosts = (map['posts'] as List? ?? []).whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
      _hitTags = (map['hashtags'] as List? ?? []).map((tag) => tag.toString()).where((tag) => tag.isNotEmpty).toList();
    });
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
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _search,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(hintText: 'Search players, posts, or #tags'),
          onChanged: _onSearchChanged,
        ),
        if (_query.isNotEmpty) ...[
          const SizedBox(height: 12),
          if (_searching)
            Padding(padding: const EdgeInsets.all(12), child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2))
          else if (_hitUsers.isEmpty && _hitPosts.isEmpty && _hitTags.isEmpty)
            Text('No results for “$_query”.', style: TextStyle(color: Colors.white.withValues(alpha: 0.6)))
          else ...[
            ..._hitUsers.map((user) {
              final id = (user['id'] ?? '').toString();
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('@${user['username'] ?? 'Player'}', style: const TextStyle(color: Colors.white)),
                onTap: id.isEmpty
                    ? null
                    : () => Navigator.push(context, MaterialPageRoute(builder: (_) => PublicProfileScreen(userId: id))),
              );
            }),
            Wrap(
              spacing: 8,
              children: _hitTags.map((tag) {
                return ActionChip(
                  label: Text('#$tag'),
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => HashtagScreen(tag: tag))),
                );
              }).toList(),
            ),
            ..._hitPosts.map((post) {
              final id = (post['id'] ?? '').toString();
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text((post['title'] ?? 'Post').toString(), style: const TextStyle(color: Colors.white)),
                onTap: id.isEmpty
                    ? null
                    : () => Navigator.push(context, MaterialPageRoute(builder: (_) => FeedDetailScreen(feedId: id))),
              );
            }),
          ],
          const SizedBox(height: 16),
        ],
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
              return GestureDetector(
                onTap: () {
                  final tag = (h['tag'] ?? h['name'] ?? h['hashtag'] ?? '').toString();
                  if (tag.isEmpty) return;
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => HashtagScreen(tag: tag)),
                  );
                },
                child: Chip(
                  label: Text('#${h['tag'] ?? h['name'] ?? h['hashtag']} (${h['count'] ?? 0})'),
                  backgroundColor: AppColors.surfaceElevated,
                  labelStyle: TextStyle(color: AppColors.gold),
                  side: BorderSide(color: AppColors.border(0.2)),
                ),
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
                onComment: () {
                  FeedCommentsSheet.show(context, feedId: feed.id);
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
          Padding(
            padding: const EdgeInsets.all(32),
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
  String _folder = '';
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
      return Padding(
        padding: const EdgeInsets.all(32),
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
    final folders = _feeds.map((f) => (f.collectionName == null || f.collectionName!.isEmpty) ? 'Saved' : f.collectionName!).toSet().toList();
    final visible = _folder.isEmpty
        ? _feeds
        : _feeds.where((f) => ((f.collectionName == null || f.collectionName!.isEmpty) ? 'Saved' : f.collectionName) == _folder).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (folders.isNotEmpty)
          Wrap(
            spacing: 8,
            children: [
              ActionChip(
                label: const Text('All'),
                onPressed: () => setState(() => _folder = ''),
              ),
              ...folders.map(
                (name) => ActionChip(
                  label: Text(name),
                  onPressed: () => setState(() => _folder = name),
                ),
              ),
            ],
          ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: visible.length,
          itemBuilder: (context, index) {
            final feed = visible[index];
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
              onComment: () {
                FeedCommentsSheet.show(context, feedId: feed.id);
              },
            );
          },
        ),
      ],
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
  List<ConversationModel> _requests = [];
  String _msgTab = 'inbox';
  bool _requestsOn = false;
  ConversationModel? _active;
  List<DirectMessageModel> _messages = [];
  DirectMessageModel? _replyTo;
  String _typing = '';
  final TextEditingController _composer = TextEditingController();
  List<String> _pendingAttachments = [];
  bool _uploading = false;
  bool _initialUserHandled = false;
  bool _dmListening = false;
  bool _voiceOn = false;
  bool _recording = false;
  final AudioRecorder _recorder = AudioRecorder();
  Timer? _voiceLimit;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _voiceLimit?.cancel();
    if (_recording) {
      _recorder.stop().whenComplete(_recorder.dispose);
    } else {
      _recorder.dispose();
    }
    _stopDmWatch();
    _composer.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await _loadMessagingSettings();
    if (!mounted) return;
    final flags = await UserService().getP1Flags();
    final flagData = flags['data'];
    final p2 = await UserService().getP2Flags();
    final p2Data = p2['data'];
    if (mounted) {
      setState(() {
        _requestsOn = flagData is Map && flagData['igMessageRequests'] == true;
        _voiceOn = p2Data is Map && p2Data['voiceNotes'] == true;
      });
    }

    final builtinEnabled = _messagingSettings?.builtinEnabled ?? true;
    if (!builtinEnabled) {
      setState(() => _loading = false);
      return;
    }

    await _loadConversations();
    if (_requestsOn) await _loadConversations(tab: 'requests');
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

  Future<void> _loadConversations({String tab = 'inbox'}) async {
    setState(() => _loading = true);
    final result = await _socialService.getConversations(tab: tab);
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>;
      final items = data['results'] as List? ?? [];
      final rows = items.map((e) => ConversationModel.fromJson(e as Map<String, dynamic>)).toList();
      setState(() {
        if (tab == 'requests') {
          _requests = rows;
        } else {
          _conversations = rows;
        }
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

  Future<void> _watchDm(String conversationId) async {
    if (!SocketService.instance.isConnected) {
      final token = await AuthService().getToken();
      if (token != null && token.isNotEmpty) {
        SocketService.instance.connect(AppConfig.serverUrl, token);
      }
    }
    if (!_dmListening) {
      SocketService.instance.onUserTyping(_onUserTyping);
      _dmListening = true;
    }
    SocketService.instance.joinDm(conversationId);
  }

  void _stopDmWatch() {
    final id = _active?.id;
    if (id != null) {
      SocketService.instance.emitTyping(id, false);
      SocketService.instance.leaveDm(id);
    }
    if (_dmListening) {
      SocketService.instance.offUserTyping(_onUserTyping);
      _dmListening = false;
    }
  }

  void _onUserTyping({required String conversationId, required bool isTyping}) {
    if (!mounted || conversationId != _active?.id) return;
    setState(() => _typing = isTyping ? 'Typing…' : '');
  }

  Future<void> _openConversation(ConversationModel conversation) async {
    final previous = _active?.id;
    if (previous != null && previous != conversation.id) {
      SocketService.instance.emitTyping(previous, false);
      SocketService.instance.leaveDm(previous);
    }
    setState(() {
      _active = conversation;
      _messages = [];
      _pendingAttachments = [];
      _replyTo = null;
      _typing = '';
    });
    await _watchDm(conversation.id);
    await _socialService.markConversationRead(conversation.id);
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
        setState(() {
          if (_pendingAttachments.length < 4) {
            _pendingAttachments = [..._pendingAttachments, url];
          }
        });
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(upload['message']?.toString() ?? 'Upload failed')),
      );
    }
  }

  Future<void> _toggleVoice() async {
    if (!_voiceOn || _active == null || _uploading) return;
    if (_recording) {
      await _finishVoice();
      return;
    }
    if (_pendingAttachments.length >= 4) return;
    final allowed = await _recorder.hasPermission();
    if (!allowed) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('feed.micBlocked'.tr())),
        );
      }
      return;
    }
    final path = '${Directory.systemTemp.path}/voice-${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(const RecordConfig(encoder: AudioEncoder.aacLc), path: path);
    if (!mounted) {
      await _recorder.stop();
      return;
    }
    setState(() => _recording = true);
    _voiceLimit?.cancel();
    _voiceLimit = Timer(const Duration(seconds: 15), () {
      if (_recording) _finishVoice();
    });
  }

  Future<void> _finishVoice() async {
    _voiceLimit?.cancel();
    if (!_recording) return;
    setState(() => _recording = false);
    final path = await _recorder.stop();
    if (path == null || path.isEmpty || _active == null) return;
    if (_pendingAttachments.length >= 4) return;
    setState(() => _uploading = true);
    final upload = await _feedService.uploadMedia(path, folder: 'support');
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
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(upload['message']?.toString() ?? 'Upload failed')),
      );
    }
  }

  Future<void> _blockChat() async {
    final id = _active?.otherUserId ?? '';
    if (id.isEmpty) return;
    final result = await _socialService.blockUser(id);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(result['success'] == true ? 'feed.blocked'.tr() : (result['message']?.toString() ?? 'feed.blockFail'.tr()))),
    );
  }

  Future<void> _reportChat() async {
    final id = _active?.otherUserId ?? '';
    if (id.isEmpty) return;
    final result = await _socialService.submitReport(
      targetType: 'user',
      targetId: id,
      reason: 'spam',
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(result['success'] == true ? 'feed.reported'.tr() : (result['message']?.toString() ?? 'feed.reportFail'.tr()))),
    );
  }

  Future<void> _sendMessage() async {
    final text = _composer.text.trim();
    final active = _active;
    if (active == null) return;
    if (text.isEmpty && _pendingAttachments.isEmpty) return;

    final attachments = List<String>.from(_pendingAttachments);
    final replyId = _replyTo?.id;
    _composer.clear();
    setState(() {
      _pendingAttachments = [];
      _replyTo = null;
    });
    SocketService.instance.emitTyping(active.id, false);

    await _socialService.sendDirectMessage(
      active.id,
      text,
      attachments: attachments.isEmpty ? null : attachments,
      replyTo: replyId,
    );
    await _openConversation(active);
    await _loadConversations();
  }

  @override
  Widget build(BuildContext context) {
    if (_settingsLoading) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }

    if (_messagingSettings?.builtinEnabled == false) {
      return ExternalMessagingPanel(settings: _messagingSettings!);
    }

    if (_loading) {
      return Padding(
        padding: const EdgeInsets.all(32),
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
                onPressed: () async {
                  _voiceLimit?.cancel();
                  if (_recording) {
                    _recording = false;
                    await _recorder.stop();
                  }
                  _stopDmWatch();
                  if (!mounted) return;
                  setState(() {
                    _active = null;
                    _pendingAttachments = [];
                    _replyTo = null;
                    _typing = '';
                  });
                },
                icon: Icon(Icons.arrow_back, color: AppColors.gold),
              ),
              Expanded(
                child: Text(
                  _active!.otherUsername,
                  style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
                ),
              ),
              if (_active!.otherUserId.isNotEmpty) ...[
                TextButton(
                  onPressed: _blockChat,
                  child: Text('feed.block'.tr(), style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
                ),
                TextButton(
                  onPressed: _reportChat,
                  child: Text('feed.report'.tr(), style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          if (_voiceOn && _messages.any((m) => m.attachments.isNotEmpty))
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Wrap(
                spacing: 8,
                children: _messages
                    .expand((m) => m.attachments)
                    .take(12)
                    .map(
                      (url) => TextButton(
                        onPressed: () {
                          final href = ImageUtils.getImageUrl(url) ?? url;
                          final uri = Uri.tryParse(href);
                          if (uri != null) launchUrl(uri, mode: LaunchMode.externalApplication);
                        },
                        child: Text('feed.mediaLink'.tr()),
                      ),
                    )
                    .toList(),
              ),
            ),
          if (_typing.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_typing, style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
            ),
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
                  final audio = _isAudioUrl(url);
                  return Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: audio
                            ? Container(
                                width: 72,
                                height: 72,
                                color: AppColors.surfaceElevated,
                                child: Icon(Icons.mic, color: AppColors.gold),
                              )
                            : ImageUtils.networkImage(
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
              if (_voiceOn)
                TextButton(
                  onPressed: _uploading ? null : _toggleVoice,
                  child: Text(_recording ? 'feed.stopVoice'.tr() : 'feed.voice'.tr()),
                ),
              Expanded(
                child: TextField(
                  controller: _composer,
                  style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
                  onChanged: (value) {
                    final id = _active?.id;
                    if (id == null) return;
                    SocketService.instance.emitTyping(id, value.trim().isNotEmpty);
                  },
                  decoration: InputDecoration(
                    hintText: _replyTo == null ? 'Type a message...' : 'Message ${_replyTo!.senderName}',
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
        if (_requestsOn)
          Row(
            children: [
              TextButton(
                onPressed: () => setState(() => _msgTab = 'inbox'),
                child: Text('Inbox', style: TextStyle(color: _msgTab == 'inbox' ? AppColors.gold : Colors.white70)),
              ),
              TextButton(
                onPressed: () => setState(() => _msgTab = 'requests'),
                child: Text('Requests (${_requests.length})', style: TextStyle(color: _msgTab == 'requests' ? AppColors.gold : Colors.white70)),
              ),
            ],
          ),
        if ((_msgTab == 'requests' ? _requests : _conversations).isEmpty)
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
          ...(_msgTab == 'requests' ? _requests : _conversations).map(
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
              title: Text(c.otherUsername, style: const TextStyle(color: Colors.white)),
              subtitle: Text(c.lastMessagePreview, style: TextStyle(color: Colors.white.withValues(alpha: 0.6))),
              trailing: _msgTab == 'requests'
                  ? TextButton(
                      onPressed: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final result = await _socialService.acceptConversation(c.id);
                        if (!mounted) return;
                        messenger.showSnackBar(
                          SnackBar(content: Text(result['success'] == true ? 'Accepted' : (result['message']?.toString() ?? 'Could not accept'))),
                        );
                        if (result['success'] == true) {
                          await _loadConversations();
                          await _loadConversations(tab: 'requests');
                        }
                      },
                      child: const Text('Accept'),
                    )
                  : null,
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
              if (message.replyTo != null && message.replyTo!.isNotEmpty)
                Text('Reply', style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
              if (message.body.isNotEmpty)
                Text(
                  message.body,
                  style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
                ),
              if (message.isMine)
                Text(
                  message.readBy.length > 1 ? 'feed.seen'.tr() : 'feed.sent'.tr(),
                  style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
                ),
              if (message.attachments.isNotEmpty) ...[
                if (message.body.isNotEmpty) const SizedBox(height: 8),
                ...message.attachments.map(
                  (url) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: _DmAttachment(url: url),
                  ),
                ),
              ],
              if (message.reactions.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(message.reactions.join(' '), style: AppTheme.bodySmall),
                ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: ['🔥', '👏', '❤'].map((emoji) {
                  return InkWell(
                    onTap: () => _reactToMessage(message, emoji),
                    child: Padding(
                      padding: const EdgeInsets.only(right: 8, top: 4),
                      child: Text(emoji),
                    ),
                  );
                }).toList(),
              ),
              TextButton(
                onPressed: () => setState(() => _replyTo = message),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.only(top: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text('Reply', style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _reactToMessage(DirectMessageModel message, String emoji) async {
    final active = _active;
    if (active == null) return;
    final result = await _socialService.reactDirectMessage(active.id, message.id, emoji);
    if (!mounted || result['success'] != true) return;
    final data = result['data'];
    final reactions = data is List
        ? data.map((row) => row is Map ? row['emoji']?.toString() ?? '' : row.toString()).where((e) => e.isNotEmpty).toList()
        : message.reactions;
    setState(() {
      _messages = _messages.map((row) => row.id == message.id ? row.copyWith(reactions: reactions) : row).toList();
    });
  }
}

bool _isAudioUrl(String url) {
  return RegExp(r'\.(mp3|m4a|ogg)(\?|$)', caseSensitive: false).hasMatch(url) ||
      url.toLowerCase().contains('voice');
}

bool _isVideoUrl(String url) {
  return RegExp(r'\.(mp4|webm)(\?|$)', caseSensitive: false).hasMatch(url);
}

class _DmAttachment extends StatefulWidget {
  final String url;

  const _DmAttachment({required this.url});

  @override
  State<_DmAttachment> createState() => _DmAttachmentState();
}

class _DmAttachmentState extends State<_DmAttachment> {
  VideoPlayerController? _controller;

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    final current = _controller;
    if (current != null && current.value.isInitialized) {
      if (current.value.isPlaying) {
        await current.pause();
      } else {
        await current.play();
      }
      if (mounted) setState(() {});
      return;
    }
    final href = ImageUtils.getImageUrl(widget.url) ?? widget.url;
    final controller = VideoPlayerController.networkUrl(Uri.parse(href));
    await controller.initialize();
    if (!mounted) {
      await controller.dispose();
      return;
    }
    setState(() => _controller = controller);
    await controller.play();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (_isAudioUrl(widget.url) || _isVideoUrl(widget.url)) {
      final playing = _controller?.value.isPlaying ?? false;
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: _toggle,
            icon: Icon(playing ? Icons.pause : Icons.play_arrow, color: AppColors.gold),
          ),
          Text(
            _isAudioUrl(widget.url) ? 'feed.voice'.tr() : 'feed.mediaLink'.tr(),
            style: AppTheme.bodySmall.copyWith(color: AppColors.textPrimary),
          ),
        ],
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: ImageUtils.networkImage(
        widget.url,
        width: 200,
        fit: BoxFit.cover,
        memCacheWidth: 600,
        errorWidget: const Icon(Icons.broken_image),
      ),
    );
  }
}
