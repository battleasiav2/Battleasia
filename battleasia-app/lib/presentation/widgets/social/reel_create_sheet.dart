import 'dart:io';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class ReelCreateSheet extends StatefulWidget {
  const ReelCreateSheet({super.key});

  static Future<bool> show(BuildContext context) async {
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => const Padding(
        padding: EdgeInsets.only(bottom: 24),
        child: ReelCreateSheet(),
      ),
    );
    return ok == true;
  }

  @override
  State<ReelCreateSheet> createState() => _ReelCreateSheetState();
}

class _ReelCreateSheetState extends State<ReelCreateSheet> {
  final _caption = TextEditingController();
  final _music = TextEditingController();
  final _feedService = FeedService();
  final _socialService = SocialService();
  File? _video;
  bool _submitting = false;

  @override
  void dispose() {
    _caption.dispose();
    _music.dispose();
    super.dispose();
  }

  Future<void> _pickVideo() async {
    final picked = await ImagePicker().pickVideo(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _video = File(picked.path));
    }
  }

  Future<void> _submit() async {
    if (_video == null || _submitting) return;
    setState(() => _submitting = true);
    try {
      final upload = await _feedService.uploadMedia(_video!.path, folder: 'reels');
      if (upload['success'] != true) {
        throw Exception(upload['message']?.toString() ?? 'Upload failed');
      }
      var url = upload['data']?['url']?.toString() ?? '';
      if (url.isNotEmpty && !url.startsWith('http')) {
        url = '${AppConfig.serverUrl}$url';
      }
      final result = await _socialService.createReel(
        videoUrl: url,
        caption: _caption.text.trim(),
        musicTitle: _music.text.trim(),
      );
      if (result['success'] != true) {
        throw Exception(result['message']?.toString() ?? 'Failed');
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('reels.createReel'.tr(), style: AppTheme.heading3.copyWith(color: AppColors.gold)),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _pickVideo,
            icon: const Icon(Icons.video_library_outlined),
            label: Text(_video == null ? 'reels.pickVideo'.tr() : 'reels.videoSelected'.tr()),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _caption,
            maxLines: 2,
            decoration: InputDecoration(labelText: 'reels.caption'.tr()),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _music,
            decoration: InputDecoration(labelText: 'reels.musicTitle'.tr()),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _video == null || _submitting ? null : _submit,
            style: FilledButton.styleFrom(backgroundColor: AppColors.gold, foregroundColor: Colors.black),
            child: _submitting
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : Text('reels.publish'.tr()),
          ),
        ],
      ),
    );
  }
}
