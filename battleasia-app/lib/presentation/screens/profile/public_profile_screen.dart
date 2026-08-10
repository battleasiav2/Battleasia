import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/public_user_model.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/profile/public_profile_info.dart';
import 'package:battleasia_app/presentation/widgets/social/follow_list_sheet.dart';
import 'package:battleasia_app/presentation/widgets/social/social_report_sheet.dart';
import 'package:battleasia_app/presentation/widgets/social/suggested_follows_strip.dart';

class PublicProfileScreen extends StatefulWidget {
  final String userId;

  const PublicProfileScreen({super.key, required this.userId});

  @override
  State<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends State<PublicProfileScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();
  final SocialService _socialService = SocialService();

  PublicUserModel? _viewingUser;
  bool _isFollowing = false;
  bool _isBlocked = false;
  bool _blockLoading = false;
  bool _followLoading = false;
  int _followersCount = 0;
  int _followingCount = 0;
  bool _loading = true;
  int _gamesPlayed = 0;
  int _totalKills = 0;
  double _amountWon = 0;
  List<ActivityCard> _activities = [];

  @override
  void initState() {
    super.initState();
    _fetchUserProfile();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchUserProfile() async {
    setState(() {
      _loading = true;
    });

    try {
      final userResult = await _userService.getUserById(widget.userId);
      if (userResult['success'] == true && userResult['data'] != null) {
        final userData = userResult['data'] as Map<String, dynamic>;
        final user = PublicUserModel.fromJson(userData);

        setState(() {
          _viewingUser = user;
          _isFollowing = userData['isFollowing'] ?? false;
          _isBlocked = userData['isBlocked'] == true;
          _followersCount = userData['followersCount'] ?? 0;
          _followingCount = userData['followingCount'] ?? 0;
        });

        await _fetchUserStats();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                userResult['message'] as String? ?? 'Failed to load user profile',
              ),
              backgroundColor: Colors.red,
            ),
          );
          Navigator.of(context).pop();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
        Navigator.of(context).pop();
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _fetchUserStats() async {
    try {
      final historyResult = await _userService.getUserMatchHistory(widget.userId);
      if (historyResult['success'] == true && historyResult['data'] != null) {
        final history = historyResult['data'] as List<dynamic>;
        _gamesPlayed = history.length;

        _totalKills = history.fold<int>(0, (sum, record) {
          final kills = record['kills'] ?? record['perKill'] ?? 0;
          return sum + (int.tryParse(kills.toString()) ?? 0);
        });

        _amountWon = history.fold<double>(0.0, (sum, record) {
          final prize = record['amountWon'] ?? record['winnings'] ?? 0;
          return sum + (double.tryParse(prize.toString()) ?? 0.0);
        });

        final activityList = <ActivityCard>[];
        final gameCounts = <String, Map<String, dynamic>>{};
        
        for (var record in history) {
          final gameName = record['gameName'] ?? record['matchName'] ?? 'Unknown';
          final count = gameCounts[gameName]?['count'] as int? ?? 0;
          gameCounts[gameName] = {'count': count + 1, 'record': record};
        }

        String? mostPlayedTitle;
        Map<String, dynamic>? mostPlayedRecord;
        int maxCount = 0;
        
        gameCounts.forEach((title, info) {
          final count = info['count'] as int? ?? 0;
          if (count > maxCount) {
            maxCount = count;
            mostPlayedTitle = title;
            mostPlayedRecord = info['record'] as Map<String, dynamic>?;
          }
        });

        if (mostPlayedTitle != null && mostPlayedRecord != null) {
          activityList.add(
            ActivityCard(
              title: mostPlayedTitle!,
              subtitle: 'Most played',
              image: mostPlayedRecord?['banner']?.toString(),
              icon: Icons.favorite,
            ),
          );
        }

        if (mounted) {
          setState(() {
            _activities = activityList;
          });
        }
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> _handleFollowToggle() async {
    if (_viewingUser == null || _followLoading) return;

    setState(() {
      _followLoading = true;
    });

    try {
      final result = _isFollowing
          ? await _userService.unfollowUser(_viewingUser!.id)
          : await _userService.followUser(_viewingUser!.id);

      if (result['success'] == true) {
        setState(() {
          _isFollowing = !_isFollowing;
          _followersCount += _isFollowing ? 1 : -1;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                _isFollowing
                    ? 'Successfully followed ${_viewingUser!.name}'
                    : 'Successfully unfollowed ${_viewingUser!.name}',
              ),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                result['message'] as String? ?? 'Failed to follow/unfollow user',
              ),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _followLoading = false;
        });
      }
    }
  }

  Future<void> _handleBlockToggle() async {
    if (_viewingUser == null || _blockLoading) return;

    setState(() => _blockLoading = true);
    try {
      final result = _isBlocked
          ? await _socialService.unblockUser(_viewingUser!.id)
          : await _socialService.blockUser(_viewingUser!.id);

      if (!mounted) return;
      if (result['success'] == true) {
        setState(() => _isBlocked = !_isBlocked);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isBlocked ? 'profile.blocked'.tr() : 'profile.unblocked'.tr(),
            ),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']?.toString() ?? 'Failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _blockLoading = false);
    }
  }

  Future<void> _handleReport() async {
    if (_viewingUser == null) return;
    final ok = await SocialReportSheet.show(
      context,
      targetType: 'user',
      targetId: _viewingUser!.id,
    );
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('profile.reportSubmitted'.tr())),
      );
    }
  }

  void _openMessage() {
    if (_viewingUser == null) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FeedScreen(initialMessageUserId: _viewingUser!.id),
      ),
    );
  }

  void _openFollowList(FollowListType type) {
    FollowListSheet.show(
      context,
      userId: widget.userId,
      type: type,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.user;
    final isOwnProfile = currentUser?.id == widget.userId;

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          if (_loading)
            const Center(child: CircularProgressIndicator())
          else if (_viewingUser == null)
            const Center(child: Text('User not found'))
          else
            CustomScrollView(
              controller: _scrollController,
              slivers: [
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: spacing16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildProfileHeader(),
                        SizedBox(height: spacing24),

                        if (!isOwnProfile) ...[
                          _buildFollowButton(),
                          SizedBox(height: spacing16),
                          _buildSocialActions(isLoggedIn: authProvider.isAuthenticated),
                          SizedBox(height: spacing24),
                        ],

                        if (authProvider.isAuthenticated) ...[
                          SuggestedFollowsStrip(
                            contextUserId: widget.userId,
                            onFollowChange: _fetchUserProfile,
                          ),
                          SizedBox(height: spacing24),
                        ],

                        PublicProfileInfo(
                          gamesPlayed: _gamesPlayed,
                          totalKills: _totalKills,
                          amountWon: _amountWon,
                          activities: _activities,
                        ),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Card(
      color: Colors.white,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            CircleAvatar(
              radius: 50,
              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
              child: _viewingUser!.avatar != null
                  ? ClipOval(
                      child: Image.network(
                        _viewingUser!.avatar!,
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Text(
                            _viewingUser!.name[0].toUpperCase(),
                            style: AppTheme.heading1.copyWith(
                              color: AppTheme.primaryColor,
                              fontSize: 40,
                            ),
                          );
                        },
                      ),
                    )
                  : Text(
                      _viewingUser!.name[0].toUpperCase(),
                      style: AppTheme.heading1.copyWith(
                        color: AppTheme.primaryColor,
                        fontSize: 40,
                      ),
                    ),
            ),
            const SizedBox(height: 16),
            Text(
              _viewingUser!.name,
              style: AppTheme.heading2.copyWith(
                color: Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildStatItem(
                  'profile.followers'.tr(),
                  _followersCount.toString(),
                  onTap: () => _openFollowList(FollowListType.followers),
                ),
                const SizedBox(width: 24),
                _buildStatItem(
                  'profile.following'.tr(),
                  _followingCount.toString(),
                  onTap: () => _openFollowList(FollowListType.following),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, {VoidCallback? onTap}) {
    final content = Column(
      children: [
        Text(
          value,
          style: AppTheme.heading3.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTheme.bodyMedium.copyWith(
            color: Colors.grey.shade600,
            fontSize: 12,
          ),
        ),
      ],
    );

    if (onTap == null) return content;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: content,
      ),
    );
  }

  Widget _buildSocialActions({required bool isLoggedIn}) {
    if (!isLoggedIn) return const SizedBox.shrink();

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        OutlinedButton.icon(
          onPressed: _openMessage,
          icon: const Icon(Icons.chat_bubble_outline, size: 18),
          label: Text('profile.message'.tr()),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.gold,
            side: BorderSide(color: AppColors.gold.withValues(alpha: 0.5)),
          ),
        ),
        OutlinedButton.icon(
          onPressed: _blockLoading ? null : _handleBlockToggle,
          icon: Icon(_isBlocked ? Icons.lock_open : Icons.block, size: 18),
          label: Text(_isBlocked ? 'profile.unblock'.tr() : 'profile.block'.tr()),
        ),
        OutlinedButton.icon(
          onPressed: _handleReport,
          icon: const Icon(Icons.flag_outlined, size: 18),
          label: Text('profile.reportUser'.tr()),
        ),
      ],
    );
  }

  Widget _buildFollowButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _followLoading ? null : _handleFollowToggle,
        style: ElevatedButton.styleFrom(
          backgroundColor: _isFollowing ? Colors.grey : AppTheme.primaryColor,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: _followLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Text(
                _isFollowing ? 'Unfollow' : 'Follow',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
      ),
    );
  }
}
