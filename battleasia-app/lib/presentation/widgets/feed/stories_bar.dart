import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/story_model.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/presentation/screens/feed/reel_player_screen.dart';

const _storyDuration = Duration(milliseconds: 5000);

class StoriesBar extends StatefulWidget {
  const StoriesBar({super.key});

  @override
  State<StoriesBar> createState() => _StoriesBarState();
}

class _StoriesBarState extends State<StoriesBar> {
  final SocialService _socialService = SocialService();
  final AuthService _authService = AuthService();

  bool _loading = true;
  List<StoryGroup> _groups = [];
  UserModel? _me;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final user = await _authService.getUser();
    final result = await _socialService.getStories();
    if (!mounted) return;

    List<StoryGroup> groups = [];
    if (result['success'] == true && result['data'] is List) {
      groups = (result['data'] as List)
          .map((e) => StoryGroup.fromJson(e as Map<String, dynamic>))
          .toList();
      groups.sort((a, b) {
        final aUnseen = a.hasUnseen ? 0 : 1;
        final bUnseen = b.hasUnseen ? 0 : 1;
        if (aUnseen != bUnseen) return aUnseen.compareTo(bUnseen);
        return a.username.toLowerCase().compareTo(b.username.toLowerCase());
      });
    }

    setState(() {
      _me = user;
      _groups = groups;
      _loading = false;
    });
  }

  Future<void> _createStory() async {
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceElevated,
      builder: (_) => const _StoryCreateSheet(),
    );
    if (created == true) await _load();
  }

  void _openViewer(int groupIndex) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        pageBuilder: (_, __, ___) => StoryViewerScreen(
          groups: _groups,
          initialGroupIndex: groupIndex,
          onViewed: (storyId) {
            _socialService.viewStory(storyId);
            setState(() {
              _groups = _groups.map((g) {
                return StoryGroup(
                  userId: g.userId,
                  username: g.username,
                  avatar: g.avatar,
                  stories: g.stories
                      .map((s) =>
                          s.id == storyId ? s.copyWith(viewed: true) : s)
                      .toList(),
                );
              }).toList();
            });
          },
        ),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return SizedBox(
        height: 148,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: 4,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (_, __) => Container(
            width: 96,
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius: BorderRadius.circular(2),
              border: Border.all(color: AppColors.border(0.2)),
            ),
          ),
        ),
      );
    }

    final others = <StoryGroup>[];
    StoryGroup? myGroup;
    for (final g in _groups) {
      if (_me != null && g.userId == _me!.id) {
        myGroup = g;
      } else {
        others.add(g);
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Stories',
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textMuted,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 148,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              _StoryCard(
                label: 'Your story',
                hasUnseen: myGroup?.hasUnseen ?? false,
                createCard: true,
                avatarUrl: _me?.avatar,
                onTap: _createStory,
                onLongPress: myGroup != null && myGroup.stories.isNotEmpty
                    ? () {
                        final idx = _groups.indexWhere((g) => g.userId == _me!.id);
                        if (idx >= 0) _openViewer(idx);
                      }
                    : null,
              ),
              ...others.map((group) {
                final preview = group.previewStory;
                return Padding(
                  padding: const EdgeInsets.only(left: 10),
                  child: _StoryCard(
                    label: group.username,
                    hasUnseen: group.hasUnseen,
                    avatarUrl: group.avatar,
                    previewUrl: preview?.mediaUrl,
                    isVideo: preview?.mediaType == 'video',
                    onTap: () {
                      final idx =
                          _groups.indexWhere((g) => g.userId == group.userId);
                      if (idx >= 0) _openViewer(idx);
                    },
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}

class _StoryCard extends StatelessWidget {
  final String label;
  final bool hasUnseen;
  final bool createCard;
  final String? avatarUrl;
  final String? previewUrl;
  final bool isVideo;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;

  const _StoryCard({
    required this.label,
    required this.hasUnseen,
    required this.onTap,
    this.createCard = false,
    this.avatarUrl,
    this.previewUrl,
    this.isVideo = false,
    this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    final preview = ImageUtils.getImageUrl(previewUrl);
    final avatar = ImageUtils.getImageUrl(avatarUrl);

    return InkWell(
      onTap: onTap,
      onLongPress: onLongPress,
      borderRadius: BorderRadius.circular(2),
      child: Container(
        width: 96,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.55),
          borderRadius: BorderRadius.circular(2),
          border: Border.all(
            width: 2,
            color: createCard
                ? AppColors.gold.withValues(alpha: 0.45)
                : hasUnseen
                    ? AppColors.gold
                    : AppColors.border(0.25),
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (preview != null && preview.isNotEmpty && !createCard)
              Image.network(
                preview,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black26),
              )
            else if (avatar != null && avatar.isNotEmpty)
              Image.network(
                avatar,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    const ColoredBox(color: Colors.black38),
              )
            else
              ColoredBox(
                color: AppColors.surfaceElevated,
                child: Icon(
                  createCard ? Icons.add : Icons.person,
                  color: AppColors.gold,
                  size: createCard ? 28 : 36,
                ),
              ),
            if (isVideo && !createCard)
              const Align(
                alignment: Alignment.center,
                child: Icon(Icons.play_circle_fill, color: Colors.white70),
              ),
            if (createCard)
              Align(
                alignment: Alignment.center,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.9),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.add, color: Colors.black, size: 22),
                ),
              ),
            Align(
              alignment: Alignment.bottomLeft,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(6, 16, 6, 6),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Colors.black87],
                  ),
                ),
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTheme.bodySmall.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StoryCreateSheet extends StatefulWidget {
  const _StoryCreateSheet();

  @override
  State<_StoryCreateSheet> createState() => _StoryCreateSheetState();
}

class _StoryCreateSheetState extends State<_StoryCreateSheet> {
  final FeedService _feedService = FeedService();
  final SocialService _socialService = SocialService();
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _caption = TextEditingController();

  String? _path;
  String _mediaType = 'image';
  bool _submitting = false;

  @override
  void dispose() {
    _caption.dispose();
    super.dispose();
  }

  Future<void> _pick(bool video) async {
    if (video) {
      final file = await _picker.pickVideo(source: ImageSource.gallery);
      if (file == null) return;
      setState(() {
        _path = file.path;
        _mediaType = 'video';
      });
    } else {
      final file = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (file == null) return;
      setState(() {
        _path = file.path;
        _mediaType = 'image';
      });
    }
  }

  Future<void> _submit() async {
    if (_path == null || _submitting) return;
    setState(() => _submitting = true);
    try {
      final upload =
          await _feedService.uploadMedia(_path!, folder: 'stories');
      if (upload['success'] != true) {
        throw Exception(upload['message'] ?? 'Upload failed');
      }
      final url = (upload['data'] as Map)['url']?.toString();
      if (url == null || url.isEmpty) throw Exception('Upload failed');

      final result = await _socialService.createStory(
        mediaUrl: url,
        mediaType: _mediaType,
        caption: _caption.text.trim(),
      );
      if (result['success'] == true) {
        if (mounted) Navigator.pop(context, true);
      } else {
        throw Exception(result['message'] ?? 'Failed to create story');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Create story',
            style: AppTheme.heading3.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),
          if (_path != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: _mediaType == 'image'
                  ? Image.file(File(_path!), height: 180, fit: BoxFit.cover)
                  : Container(
                      height: 120,
                      color: Colors.black26,
                      alignment: Alignment.center,
                      child: const Icon(Icons.videocam, color: AppColors.gold),
                    ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pick(false),
                    icon: const Icon(Icons.image_outlined),
                    label: const Text('Photo'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pick(true),
                    icon: const Icon(Icons.videocam_outlined),
                    label: const Text('Video'),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 12),
          TextField(
            controller: _caption,
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Caption (optional)',
              hintStyle: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _path == null || _submitting ? null : _submit,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.gold,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            child: _submitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Share story'),
          ),
        ],
      ),
    );
  }
}

class StoryViewerScreen extends StatefulWidget {
  final List<StoryGroup> groups;
  final int initialGroupIndex;
  final ValueChanged<String>? onViewed;

  const StoryViewerScreen({
    super.key,
    required this.groups,
    required this.initialGroupIndex,
    this.onViewed,
  });

  @override
  State<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends State<StoryViewerScreen>
    with SingleTickerProviderStateMixin {
  late int _groupIndex;
  late int _storyIndex;
  AnimationController? _progress;
  Timer? _videoFallback;

  StoryGroup get _group => widget.groups[_groupIndex];
  StoryItem get _story => _group.stories[_storyIndex];

  @override
  void initState() {
    super.initState();
    _groupIndex = widget.initialGroupIndex.clamp(0, widget.groups.length - 1);
    _storyIndex = 0;
    _startProgress();
  }

  void _startProgress() {
    _progress?.dispose();
    _videoFallback?.cancel();
    final isVideo = _story.mediaType == 'video';
    _progress = AnimationController(
      vsync: this,
      duration: isVideo ? const Duration(seconds: 15) : _storyDuration,
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) _next();
      });
    widget.onViewed?.call(_story.id);
    if (!isVideo) {
      _progress!.forward(from: 0);
    } else {
      // Video end callback advances; fallback timer as safety.
      _progress!.forward(from: 0);
    }
    setState(() {});
  }

  void _next() {
    if (_storyIndex < _group.stories.length - 1) {
      setState(() => _storyIndex++);
      _startProgress();
      return;
    }
    if (_groupIndex < widget.groups.length - 1) {
      setState(() {
        _groupIndex++;
        _storyIndex = 0;
      });
      _startProgress();
      return;
    }
    Navigator.of(context).maybePop();
  }

  void _prev() {
    if (_storyIndex > 0) {
      setState(() => _storyIndex--);
      _startProgress();
      return;
    }
    if (_groupIndex > 0) {
      final prev = widget.groups[_groupIndex - 1];
      setState(() {
        _groupIndex--;
        _storyIndex = prev.stories.length - 1;
      });
      _startProgress();
      return;
    }
    _startProgress();
  }

  @override
  void dispose() {
    _progress?.dispose();
    _videoFallback?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final avatar = ImageUtils.getImageUrl(_group.avatar);

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapUp: (details) {
          final w = MediaQuery.of(context).size.width;
          if (details.localPosition.dx < w * 0.35) {
            _prev();
          } else {
            _next();
          }
        },
        onLongPressStart: (_) => _progress?.stop(),
        onLongPressEnd: (_) => _progress?.forward(),
        child: Stack(
          fit: StackFit.expand,
          children: [
            StoryMediaPlayer(
              key: ValueKey(_story.id),
              mediaUrl: _story.mediaUrl,
              mediaType: _story.mediaType,
              onVideoEnded: _next,
            ),
            SafeArea(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                    child: Row(
                      children: List.generate(_group.stories.length, (i) {
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 2),
                            child: AnimatedBuilder(
                              animation: _progress ??
                                  const AlwaysStoppedAnimation(0),
                              builder: (_, __) {
                                double value = 0;
                                if (i < _storyIndex) {
                                  value = 1;
                                } else if (i == _storyIndex) {
                                  value = _progress?.value ?? 0;
                                }
                                return LinearProgressIndicator(
                                  value: value,
                                  minHeight: 2,
                                  backgroundColor: Colors.white24,
                                  color: AppColors.gold,
                                );
                              },
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundImage: avatar != null && avatar.isNotEmpty
                              ? NetworkImage(avatar)
                              : null,
                          child: avatar == null || avatar.isEmpty
                              ? const Icon(Icons.person, size: 16)
                              : null,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _group.username,
                            style: AppTheme.bodyMedium
                                .copyWith(color: Colors.white),
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.close, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  if (_story.caption.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        _story.caption,
                        style:
                            AppTheme.bodyMedium.copyWith(color: Colors.white),
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
