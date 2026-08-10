import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class SocialReportSheet extends StatefulWidget {
  const SocialReportSheet({
    super.key,
    required this.targetType,
    required this.targetId,
  });

  final String targetType;
  final String targetId;

  static Future<bool> show(
    BuildContext context, {
    required String targetType,
    required String targetId,
  }) async {
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      builder: (_) => SocialReportSheet(targetType: targetType, targetId: targetId),
    );
    return ok == true;
  }

  @override
  State<SocialReportSheet> createState() => _SocialReportSheetState();
}

class _SocialReportSheetState extends State<SocialReportSheet> {
  final _reason = TextEditingController();
  final _details = TextEditingController();
  final _social = SocialService();
  bool _submitting = false;

  @override
  void dispose() {
    _reason.dispose();
    _details.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final r = _reason.text.trim();
    if (r.isEmpty || _submitting) return;
    setState(() => _submitting = true);
    final result = await _social.submitReport(
      targetType: widget.targetType,
      targetId: widget.targetId,
      reason: r,
      details: _details.text.trim(),
    );
    if (!mounted) return;
    setState(() => _submitting = false);
    if (result['success'] == true) {
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']?.toString() ?? 'Failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('profile.reportUser'.tr(), style: AppTheme.heading3.copyWith(color: AppColors.gold)),
          const SizedBox(height: 12),
          TextField(
            controller: _reason,
            decoration: InputDecoration(labelText: 'profile.reportReason'.tr()),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _details,
            maxLines: 3,
            decoration: InputDecoration(labelText: 'profile.reportDetails'.tr()),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            style: FilledButton.styleFrom(backgroundColor: AppColors.gold, foregroundColor: Colors.black),
            child: Text('profile.submitReport'.tr()),
          ),
        ],
      ),
    );
  }
}
