import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/reel_model.dart';

class ReelPlayerScreen extends StatefulWidget {
  final ReelModel reel;

  const ReelPlayerScreen({super.key, required this.reel});

  @override
  State<ReelPlayerScreen> createState() => _ReelPlayerScreenState();
}

class _ReelPlayerScreenState extends State<ReelPlayerScreen> {
  final SocialService _socialService = SocialService();
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  String? _error;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    _initPlayer();
    _socialService.viewReel(widget.reel.id);
  }

  Future<void> _initPlayer() async {
    final url =
        AppConfig.getImageUrl(widget.reel.videoUrl) ?? widget.reel.videoUrl;
    if (url.isEmpty) {
      setState(() => _error = 'Video unavailable');
      return;
    }
    try {
      final controller = VideoPlayerController.networkUrl(Uri.parse(url));
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      final chewie = ChewieController(
        videoPlayerController: controller,
        autoPlay: true,
        looping: true,
        allowFullScreen: false,
        allowMuting: true,
        showControls: true,
        aspectRatio: controller.value.aspectRatio == 0
            ? 9 / 16
            : controller.value.aspectRatio,
        materialProgressColors: ChewieProgressColors(
          playedColor: AppColors.gold,
          handleColor: AppColors.gold,
          bufferedColor: AppColors.gold.withValues(alpha: 0.3),
          backgroundColor: Colors.white24,
        ),
      );
      setState(() {
        _videoController = controller;
        _chewieController = chewie;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _error = 'Failed to play video');
      }
    }
  }

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoController?.dispose();
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(
          widget.reel.username,
          style: AppTheme.bodyMedium.copyWith(color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: _error != null
                  ? Text(
                      _error!,
                      style: AppTheme.bodyMedium.copyWith(color: Colors.white70),
                    )
                  : _chewieController == null
                      ? const CircularProgressIndicator(color: AppColors.gold)
                      : Chewie(controller: _chewieController!),
            ),
          ),
          if (widget.reel.caption.isNotEmpty ||
              widget.reel.musicTitle.isNotEmpty)
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (widget.reel.caption.isNotEmpty)
                      Text(
                        widget.reel.caption,
                        style: AppTheme.bodyMedium.copyWith(color: Colors.white),
                      ),
                    if (widget.reel.musicTitle.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.music_note,
                              size: 14, color: AppColors.gold),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              widget.reel.musicTitle,
                              style: AppTheme.bodySmall
                                  .copyWith(color: AppColors.gold),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      '${widget.reel.totalViews} views',
                      style:
                          AppTheme.bodySmall.copyWith(color: Colors.white54),
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

/// Lightweight full-screen image/video story player (no Chewie chrome).
class StoryMediaPlayer extends StatefulWidget {
  final String mediaUrl;
  final String mediaType;
  final VoidCallback? onVideoEnded;

  const StoryMediaPlayer({
    super.key,
    required this.mediaUrl,
    required this.mediaType,
    this.onVideoEnded,
  });

  @override
  State<StoryMediaPlayer> createState() => _StoryMediaPlayerState();
}

class _StoryMediaPlayerState extends State<StoryMediaPlayer> {
  VideoPlayerController? _controller;

  @override
  void initState() {
    super.initState();
    if (widget.mediaType == 'video') {
      _initVideo();
    }
  }

  Future<void> _initVideo() async {
    final url = ImageUtils.getImageUrl(widget.mediaUrl) ?? widget.mediaUrl;
    if (url.isEmpty) return;
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    await controller.initialize();
    if (!mounted) {
      await controller.dispose();
      return;
    }
    controller.addListener(() {
      if (controller.value.position >= controller.value.duration &&
          controller.value.duration > Duration.zero) {
        widget.onVideoEnded?.call();
      }
    });
    await controller.play();
    setState(() => _controller = controller);
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final url = ImageUtils.getImageUrl(widget.mediaUrl) ?? widget.mediaUrl;
    if (widget.mediaType == 'video') {
      if (_controller == null || !_controller!.value.isInitialized) {
        return const Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        );
      }
      return FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: _controller!.value.size.width,
          height: _controller!.value.size.height,
          child: VideoPlayer(_controller!),
        ),
      );
    }
    return Image.network(
      url,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => const Icon(
        Icons.broken_image,
        color: Colors.white54,
        size: 48,
      ),
    );
  }
}
