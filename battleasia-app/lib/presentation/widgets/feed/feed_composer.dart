import 'dart:io';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class FeedComposer extends StatefulWidget {
  final VoidCallback? onPosted;

  const FeedComposer({super.key, this.onPosted});

  @override
  State<FeedComposer> createState() => _FeedComposerState();
}

class _FeedComposerState extends State<FeedComposer> {
  final FeedService _feedService = FeedService();
  final TextEditingController _controller = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  String? _imagePath;
  bool _isVideo = false;
  bool _submitting = false;
  int? _uploadPct;
  UploadTicket? _ticket;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      maxHeight: 1600,
      imageQuality: 85,
    );
    if (file == null) return;
    setState(() {
      _imagePath = file.path;
      _isVideo = false;
    });
  }

  Future<void> _pickVideo() async {
    final file = await _picker.pickVideo(source: ImageSource.gallery);
    if (file == null) return;
    setState(() {
      _imagePath = file.path;
      _isVideo = true;
    });
  }

  void _cancelUpload() {
    _ticket?.cancel();
  }

  Future<void> _submit() async {
    final description = _controller.text.trim();
    if ((description.isEmpty && _imagePath == null) || _submitting) return;
    if (description.length > 500) return;

    final ticket = UploadTicket();
    _ticket = ticket;
    setState(() {
      _submitting = true;
      _uploadPct = _imagePath != null ? 0 : null;
    });
    try {
      String? coverUrl;
      List<String>? mediaUrls;
      var postType = 'text';

      if (_imagePath != null) {
        final upload = await _feedService.uploadMedia(
          _imagePath!,
          folder: _isVideo ? 'reels' : 'feed',
          ticket: ticket,
          onProgress: (pct) {
            if (mounted) setState(() => _uploadPct = pct);
          },
        );
        if (upload['cancelled'] == true) return;
        if (upload['success'] != true) {
          throw Exception(upload['message'] ?? 'feed.postFail'.tr());
        }
        coverUrl = (upload['data'] as Map)['url']?.toString();
        if (coverUrl == null || coverUrl.isEmpty) {
          throw Exception('feed.postFail'.tr());
        }
        mediaUrls = [coverUrl];
        postType = _isVideo ? 'video' : 'image';
      }

      final fallback = _isVideo ? 'feed.clip'.tr() : 'feed.photo'.tr();
      final result = await _feedService.createFeedPost(
        description: description.isNotEmpty ? description : fallback,
        coverUrl: coverUrl,
        mediaUrls: mediaUrls,
        postType: postType,
      );

      if (result['success'] == true) {
        _controller.clear();
        setState(() {
          _imagePath = null;
          _isVideo = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('feed.posted'.tr()),
              backgroundColor: AppColors.success,
            ),
          );
        }
        widget.onPosted?.call();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message']?.toString() ?? 'Failed to post')),
        );
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
      _ticket = null;
      if (mounted) {
        setState(() {
          _submitting = false;
          _uploadPct = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _controller,
            maxLines: 3,
            minLines: 2,
            maxLength: 500,
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: "What's on your mind?",
              hintStyle: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
              border: InputBorder.none,
              isDense: true,
            ),
          ),
          if (_imagePath != null) ...[
            const SizedBox(height: 8),
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: _isVideo
                      ? Container(
                          height: 140,
                          color: const Color(0xFF121318),
                          alignment: Alignment.center,
                          child: Text('feed.clip'.tr(), style: TextStyle(color: AppColors.gold)),
                        )
                      : Image.file(
                          File(_imagePath!),
                          height: 140,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: IconButton(
                    onPressed: () => setState(() {
                      _imagePath = null;
                      _isVideo = false;
                    }),
                    icon: const Icon(Icons.close, color: Colors.white, size: 18),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.black54,
                      padding: const EdgeInsets.all(4),
                      minimumSize: const Size(28, 28),
                    ),
                  ),
                ),
              ],
            ),
          ],
          if (_uploadPct != null) ...[
            const SizedBox(height: 8),
            Text(
              'feed.progress'.tr(namedArgs: {'n': '$_uploadPct'}),
              style: AppTheme.bodySmall.copyWith(color: AppColors.gold),
            ),
            const SizedBox(height: 6),
            LinearProgressIndicator(
              value: _uploadPct! > 0 ? _uploadPct! / 100 : null,
              minHeight: 4,
              backgroundColor: AppColors.border(0.2),
              color: AppColors.gold,
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: _cancelUpload,
                child: Text('feed.cancelUpload'.tr()),
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              IconButton(
                onPressed: _submitting ? null : _pickImage,
                icon: Icon(Icons.image_outlined, color: AppColors.gold),
                tooltip: 'feed.photo'.tr(),
              ),
              IconButton(
                onPressed: _submitting ? null : _pickVideo,
                icon: Icon(Icons.videocam_outlined, color: AppColors.gold),
                tooltip: 'feed.clip'.tr(),
              ),
              const Spacer(),
              TextButton(
                onPressed: _submitting ? null : _submit,
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                child: _submitting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        'Post',
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
