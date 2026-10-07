import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/screens/profile/public_profile_screen.dart';

enum FollowListType { followers, following }

class FollowListSheet extends StatefulWidget {
  const FollowListSheet({
    super.key,
    required this.userId,
    required this.type,
  });

  final String userId;
  final FollowListType type;

  static Future<void> show(
    BuildContext context, {
    required String userId,
    required FollowListType type,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (context, scrollController) => FollowListSheet(
          userId: userId,
          type: type,
        ),
      ),
    );
  }

  @override
  State<FollowListSheet> createState() => _FollowListSheetState();
}

class _FollowListSheetState extends State<FollowListSheet> {
  final _userService = UserService();
  bool _loading = true;
  List<Map<String, dynamic>> _users = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final result = widget.type == FollowListType.followers
        ? await _userService.getFollowers(widget.userId)
        : await _userService.getFollowing(widget.userId);
    if (!mounted) return;
    if (result['success'] != true) {
      setState(() {
        _users = [];
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']?.toString() ?? 'profile.followListFail'.tr())),
      );
      return;
    }
    final data = result['data'];
    final list = data is List
        ? data
        : (data is Map ? (data['results'] as List? ?? data['users'] as List? ?? []) : []);
    setState(() {
      _users = list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.type == FollowListType.followers
        ? 'profile.followers'.tr()
        : 'profile.following'.tr();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: AppTheme.heading3.copyWith(color: AppColors.gold)),
          const SizedBox(height: 12),
          if (_loading)
            Expanded(child: Center(child: CircularProgressIndicator(color: AppColors.gold)))
          else if (_users.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      widget.type == FollowListType.followers
                          ? 'profile.noFollowers'.tr()
                          : 'profile.noFollowing'.tr(),
                      style: AppTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'profile.followListEmpty'.tr(),
                      style: AppTheme.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                    TextButton(
                      onPressed: () {
                        final nav = Navigator.of(context);
                        nav.pop();
                        nav.push(
                          MaterialPageRoute(builder: (_) => const FeedScreen()),
                        );
                      },
                      child: Text('feedHub.explore'.tr()),
                    ),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: _users.length,
                itemBuilder: (context, i) {
                  final u = _users[i];
                  final id = u['id']?.toString() ?? u['_id']?.toString() ?? '';
                  final name = u['username']?.toString() ?? u['name']?.toString() ?? 'User';
                  final following = u['isFollowing'] == true;
                  final me = context.read<AuthProvider>().user?.id;
                  return ListTile(
                    title: Row(
                      children: [
                        Flexible(child: Text(name, overflow: TextOverflow.ellipsis)),
                        if (id.isNotEmpty && id == me) ...[
                          const SizedBox(width: 6),
                          Text('profile.you'.tr(), style: TextStyle(color: AppColors.gold, fontSize: 12)),
                        ],
                      ],
                    ),
                    trailing: TextButton(
                      onPressed: id.isEmpty
                          ? null
                          : () async {
                              if (following) {
                                final ok = await showDialog<bool>(
                                  context: context,
                                  builder: (ctx) => AlertDialog(
                                    content: Text('profile.unfollowConfirm'.tr()),
                                    actions: [
                                      TextButton(
                                        onPressed: () => Navigator.pop(ctx, false),
                                        child: Text('feed.cancelReply'.tr()),
                                      ),
                                      TextButton(
                                        onPressed: () => Navigator.pop(ctx, true),
                                        child: Text('profile.unfollow'.tr()),
                                      ),
                                    ],
                                  ),
                                );
                                if (ok != true || !mounted) return;
                              }
                              final result = following
                                  ? await _userService.unfollowUser(id)
                                  : await _userService.followUser(id);
                              if (!mounted || result['success'] != true) return;
                              setState(() {
                                _users = _users
                                    .map((row) {
                                      final rowId = row['id']?.toString() ?? row['_id']?.toString() ?? '';
                                      if (rowId != id) return row;
                                      return {...row, 'isFollowing': !following};
                                    })
                                    .toList();
                              });
                            },
                      child: Text(following ? 'profile.unfollow'.tr() : 'profile.follow'.tr()),
                    ),
                    onTap: id.isEmpty
                        ? null
                        : () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PublicProfileScreen(userId: id),
                              ),
                            );
                          },
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
