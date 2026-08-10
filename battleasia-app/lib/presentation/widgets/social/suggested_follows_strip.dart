import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/profile/public_profile_screen.dart';

class SuggestedFollowsStrip extends StatefulWidget {
  const SuggestedFollowsStrip({
    super.key,
    this.contextUserId,
    this.onFollowChange,
  });

  final String? contextUserId;
  final VoidCallback? onFollowChange;

  @override
  State<SuggestedFollowsStrip> createState() => _SuggestedFollowsStripState();
}

class _SuggestedFollowsStripState extends State<SuggestedFollowsStrip> {
  final _userService = UserService();
  bool _loading = true;
  List<Map<String, dynamic>> _users = [];
  String? _actionId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final result = await _userService.getSuggestedFollows(
      contextUserId: widget.contextUserId,
    );
    if (!mounted) return;
    final data = result['data'];
    final list = data is List
        ? data
        : (data is Map ? (data['results'] as List? ?? data['users'] as List? ?? []) : []);
    setState(() {
      _users = list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      _loading = false;
    });
  }

  Future<void> _toggleFollow(Map<String, dynamic> user) async {
    final id = user['id']?.toString() ?? user['_id']?.toString() ?? '';
    if (id.isEmpty || _actionId != null) return;
    setState(() => _actionId = id);
    final isFollowing = user['isFollowing'] == true;
    final result = isFollowing
        ? await _userService.unfollowUser(id)
        : await _userService.followUser(id);
    if (!mounted) return;
    setState(() {
      _actionId = null;
      if (result['success'] == true) {
        _users.removeWhere(
          (u) => (u['id']?.toString() ?? u['_id']?.toString()) == id,
        );
      }
    });
    if (result['success'] == true) {
      widget.onFollowChange?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading || _users.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'profile.suggestedForYou'.tr(),
          style: AppTheme.heading3.copyWith(color: AppColors.gold),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 148,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _users.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final user = _users[index];
              final id = user['id']?.toString() ?? user['_id']?.toString() ?? '';
              final name = user['username']?.toString() ?? user['name']?.toString() ?? 'User';
              final busy = _actionId == id;
              return Container(
                width: 132,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppColors.border(0.12)),
                ),
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: id.isEmpty
                          ? null
                          : () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PublicProfileScreen(userId: id),
                                ),
                              );
                            },
                      child: CircleAvatar(
                        radius: 26,
                        backgroundColor: AppColors.gold,
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'U',
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Spacer(),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: busy ? null : () => _toggleFollow(user),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.gold,
                          side: BorderSide(color: AppColors.gold.withValues(alpha: 0.5)),
                          padding: const EdgeInsets.symmetric(vertical: 6),
                        ),
                        child: busy
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text('profile.follow'.tr()),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
