import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

class NewChatSheet extends StatefulWidget {
  const NewChatSheet({super.key});

  static Future<String?> show(BuildContext context) {
    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: const NewChatSheet(),
      ),
    );
  }

  @override
  State<NewChatSheet> createState() => _NewChatSheetState();
}

class _NewChatSheetState extends State<NewChatSheet> {
  final _query = TextEditingController();
  final _social = SocialService();
  bool _searching = false;
  List<Map<String, dynamic>> _results = [];

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final q = _query.text.trim();
    if (q.length < 2) {
      setState(() => _results = []);
      return;
    }
    setState(() => _searching = true);
    final result = await _social.globalSearch(q);
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>? ?? {};
      final users = data['users'] as List? ?? [];
      setState(() {
        _results = users.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        _searching = false;
      });
    } else {
      setState(() {
        _results = [];
        _searching = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('messages.newChat'.tr(), style: AppTheme.heading3.copyWith(color: AppColors.gold)),
            const SizedBox(height: 12),
            TextField(
              controller: _query,
              decoration: InputDecoration(
                hintText: 'messages.searchUsers'.tr(),
                suffixIcon: IconButton(
                  icon: _searching
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.search),
                  onPressed: _search,
                ),
              ),
              onSubmitted: (_) => _search(),
            ),
            const SizedBox(height: 12),
            ..._results.map(
              (u) => ListTile(
                leading: CircleAvatar(
                  child: Text((u['username']?.toString() ?? 'U')[0].toUpperCase()),
                ),
                title: Text(u['username']?.toString() ?? 'User'),
                onTap: () => Navigator.pop(context, u['id']?.toString()),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
