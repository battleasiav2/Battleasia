import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/social_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/link_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/public_user_model.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/play/match_result_screen.dart';
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
  int _postsCount = 0;
  int _careerWins = 0;
  int _careerKills = 0;
  String _instagram = '';
  String _twitter = '';
  String _facebook = '';
  bool _loading = true;
  int _gamesPlayed = 0;
  int _totalKills = 0;
  double _amountWon = 0;
  List<ActivityCard> _activities = [];
  List<Map<String, dynamic>> _highlights = [];
  List<Map<String, dynamic>> _posts = [];
  List<Map<String, dynamic>> _history = [];
  String _gridTab = 'posts';
  bool _playerTip = false;
  bool _tipping = false;

  @override
  void initState() {
    super.initState();
    _loadPosts();
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
          _followersCount = _asInt(userData['followersCount'] ?? userData['followers']);
          _followingCount = _asInt(userData['followingCount'] ?? userData['following']);
          _postsCount = _asInt(userData['posts']);
          final stats = userData['gamingStats'];
          if (stats is Map) {
            _careerWins = _asInt(stats['totalWins']);
            _careerKills = _asInt(stats['totalKills']);
          }
          _instagram = userData['instagramLink']?.toString() ?? '';
          _twitter = userData['twitterLink']?.toString() ?? '';
          _facebook = userData['facebookLink']?.toString() ?? '';
        });

        await _fetchUserStats();
        await _fetchExtras();
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
        _history = history.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
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

  Future<void> _fetchExtras() async {
    final flags = await _userService.getP1Flags();
    final highlights = await _socialService.getHighlights(widget.userId);
    if (!mounted) return;
    final flagData = flags['data'];
    final rows = highlights['data'];
    setState(() {
      _playerTip = flagData is Map && flagData['playerTip'] == true;
      _highlights = rows is List
          ? rows.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList()
          : [];
    });
  }

  Future<void> _sendTip(int amount) async {
    final name = _viewingUser?.name ?? '';
    if (name.isEmpty || _tipping) return;
    setState(() => _tipping = true);
    final result = await _userService.sendTip(name, amount);
    if (!mounted) return;
    setState(() => _tipping = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result['success'] == true
              ? 'profile.tipped'.tr(namedArgs: {'n': '$amount'})
              : ((result['message']?.toString().trim().isNotEmpty == true)
                  ? result['message'].toString()
                  : 'profile.tipFail'.tr()),
        ),
      ),
    );
  }

  Future<void> _loadPosts() async {
    final result = await _userService.getUserFeeds(widget.userId);
    if (!mounted || result['success'] != true) return;
    final data = result['data'];
    final list = data is Map
        ? (data['results'] as List? ?? [])
        : (data is List ? data : const []);
    setState(() {
      _posts = list.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
    });
  }

  bool _isReel(Map<String, dynamic> post) {
    final media = post['mediaUrls'];
    if (media is List && media.any((url) => url.toString().toLowerCase().contains('.mp4'))) {
      return true;
    }
    final cover = post['coverUrl']?.toString().toLowerCase() ?? '';
    return cover.contains('.mp4');
  }

  Future<void> _handleFollowToggle() async {
    if (_viewingUser == null || _followLoading) return;
    if (_isFollowing) {
      final ok = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          content: Text('profile.unfollowConfirm'.tr()),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('feed.cancelReply'.tr())),
            TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('profile.unfollow'.tr())),
          ],
        ),
      );
      if (ok != true || !mounted) return;
    }

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

  Future<void> _shareProfile() async {
    final user = _viewingUser;
    if (user == null) return;
    final conv = await _socialService.createConversation(user.id);
    final convData = conv['data'];
    final convId = convData is Map ? convData['id']?.toString() ?? '' : '';
    if (!mounted) return;
    if (conv['success'] != true || convId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(conv['message']?.toString() ?? 'profile.shareFail'.tr())),
      );
      return;
    }
    final sent = await _socialService.sendDirectMessage(
      convId,
      'Check this profile: ${AppConfig.siteUrl}/profile/${user.id}',
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          sent['success'] == true
              ? 'profile.shared'.tr()
              : ((sent['message']?.toString().trim().isNotEmpty == true)
                  ? sent['message'].toString()
                  : 'profile.shareFail'.tr()),
        ),
      ),
    );
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
                        if (_highlights.isNotEmpty) ...[
                          SizedBox(height: spacing16),
                          _buildHighlights(),
                        ],
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
                        SizedBox(height: spacing24),
                        _buildPostGrid(),
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

  int _asInt(dynamic value) {
    if (value is num) return value.toInt();
    return int.tryParse('$value') ?? 0;
  }

  String _tier(int wins) {
    if (wins >= 50) return 'Elite';
    if (wins >= 20) return 'Diamond';
    if (wins >= 8) return 'Platinum';
    if (wins >= 3) return 'Gold';
    if (wins >= 1) return 'Silver';
    return 'Bronze';
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
            if (_viewingUser!.isOnline) ...[
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF34D399),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'profile.live'.tr(),
                    style: AppTheme.bodySmall.copyWith(color: Colors.black54),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 8),
            Text(
              '${_tier(_careerWins)} · $_careerWins ${'profile.wins'.tr()} · $_careerKills ${'profile.kills'.tr()}',
              textAlign: TextAlign.center,
              style: AppTheme.bodySmall.copyWith(color: Colors.black87, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(
              _viewingUser!.bio.trim().isEmpty ? 'profile.noBio'.tr() : _viewingUser!.bio,
              textAlign: TextAlign.center,
              style: AppTheme.bodyMedium.copyWith(color: Colors.black87),
            ),
            const SizedBox(height: 4),
            Text(
              'PUBG ${_viewingUser!.pubgId?.trim().isNotEmpty == true ? _viewingUser!.pubgId : '—'} · ${_viewingUser!.gameServer?.trim().isNotEmpty == true ? _viewingUser!.gameServer : 'profile.serverTbd'.tr()}',
              textAlign: TextAlign.center,
              style: AppTheme.bodySmall.copyWith(color: Colors.black54),
            ),
            _buildSocialLinks(),
            if (context.read<AuthProvider>().user?.id == widget.userId)
              TextButton(
                onPressed: () async {
                  await Clipboard.setData(ClipboardData(text: _viewingUser!.name));
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('profile.usernameCopied'.tr())),
                  );
                },
                child: Text('profile.copyUsername'.tr()),
              ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildStatItem(
                  'profile.postsN'.tr(),
                  (_postsCount > 0 ? _postsCount : _posts.length).toString(),
                ),
                const SizedBox(width: 24),
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

  Widget _buildSocialLinks() {
    final links = <(String, String)>[
      if (_instagram.startsWith('http')) ('Instagram', _instagram),
      if (_twitter.startsWith('http')) ('X', _twitter),
      if (_facebook.startsWith('http')) ('Facebook', _facebook),
    ];
    if (links.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Wrap(
        alignment: WrapAlignment.center,
        spacing: 12,
        children: [
          for (final link in links)
            TextButton(
              onPressed: () => LinkUtils.openExternal(link.$2),
              child: Text(link.$1),
            ),
        ],
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

  Widget _buildHighlights() {
    return SizedBox(
      height: 84,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _highlights.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final row = _highlights[index];
          final image = ImageUtils.getImageUrl(row['mediaUrl']?.toString());
          return ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 72,
              child: image == null || image.isEmpty
                  ? const ColoredBox(color: Color(0xFF121318))
                  : Image.network(image, fit: BoxFit.cover),
            ),
          );
        },
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
          onPressed: _shareProfile,
          icon: const Icon(Icons.ios_share, size: 18),
          label: Text('profile.share'.tr()),
        ),
        OutlinedButton.icon(
          onPressed: _blockLoading ? null : _handleBlockToggle,
          icon: Icon(_isBlocked ? Icons.lock_open : Icons.block, size: 18),
          label: Text(_isBlocked ? 'profile.unblock'.tr() : 'profile.block'.tr()),
        ),
        if (_playerTip)
          ...[10, 25, 50].map(
            (amount) => OutlinedButton(
              onPressed: _tipping ? null : () => _sendTip(amount),
              child: Text('profile.tip'.tr(namedArgs: {'n': '$amount'})),
            ),
          ),
        OutlinedButton.icon(
          onPressed: _handleReport,
          icon: const Icon(Icons.flag_outlined, size: 18),
          label: Text('profile.reportUser'.tr()),
        ),
      ],
    );
  }

  Widget _buildHighlightGrid() {
    if (_highlights.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Column(
          children: [
            Text(
              'profile.noHighlights'.tr(),
              style: AppTheme.heading3.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              'profile.highlightsLead'.tr(),
              style: AppTheme.bodySmall.copyWith(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _highlights.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 4,
        crossAxisSpacing: 4,
      ),
      itemBuilder: (context, index) {
        final image = ImageUtils.getImageUrl(_highlights[index]['mediaUrl']?.toString());
        return ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: image == null || image.isEmpty
              ? const ColoredBox(color: Color(0xFF121318))
              : Image.network(image, fit: BoxFit.cover),
        );
      },
    );
  }

  Widget _buildHistory() {
    final rows = _history.take(24).toList();
    if (rows.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Column(
          children: [
            Text('profile.noHistory'.tr(), style: AppTheme.heading3.copyWith(color: Colors.white)),
            const SizedBox(height: 6),
            Text(
              'profile.historyLead'.tr(),
              style: AppTheme.bodySmall.copyWith(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
    return Column(
      children: rows.map((row) {
        final id = (row['matchId'] ?? row['id'] ?? '').toString();
        final name = (row['matchName'] ?? '—').toString();
        final rank = (row['rank'] ?? '—').toString();
        final kills = (row['kills'] ?? 0).toString();
        final won = (row['winnings'] ?? row['amountWon'] ?? 0).toString();
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(name, style: const TextStyle(color: Colors.white)),
          subtitle: Text(
            '${'profile.rank'.tr()} $rank · ${'profile.kills'.tr()} $kills · ${'profile.won'.tr()} $won',
            style: const TextStyle(color: Colors.white70),
          ),
          onTap: id.isEmpty
              ? null
              : () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => MatchResultScreen(matchId: id)),
                  );
                },
        );
      }).toList(),
    );
  }

  Widget _buildPostGrid() {
    final rows = _gridTab == 'reels' ? _posts.where(_isReel).toList() : _posts;
    final own = context.read<AuthProvider>().user?.id == widget.userId;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            TextButton(
              onPressed: () => setState(() => _gridTab = 'posts'),
              child: Text(
                'profile.posts'.tr(),
                style: TextStyle(
                  color: _gridTab == 'posts' ? AppColors.gold : Colors.white70,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            TextButton(
              onPressed: () => setState(() => _gridTab = 'reels'),
              child: Text(
                'profile.reels'.tr(),
                style: TextStyle(
                  color: _gridTab == 'reels' ? AppColors.gold : Colors.white70,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            TextButton(
              onPressed: () => setState(() => _gridTab = 'history'),
              child: Text(
                'profile.history'.tr(),
                style: TextStyle(
                  color: _gridTab == 'history' ? AppColors.gold : Colors.white70,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            TextButton(
              onPressed: () => setState(() => _gridTab = 'highlights'),
              child: Text(
                'profile.highlights'.tr(),
                style: TextStyle(
                  color: _gridTab == 'highlights' ? AppColors.gold : Colors.white70,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        if (_gridTab == 'history')
          _buildHistory()
        else if (_gridTab == 'highlights')
          _buildHighlightGrid()
        else if (rows.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Column(
              children: [
                Text(
                  _gridTab == 'reels' ? 'profile.noReels'.tr() : 'profile.noPosts'.tr(),
                  style: AppTheme.heading3.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 6),
                Text(
                  own ? 'profile.ownEmpty'.tr() : 'profile.otherEmpty'.tr(),
                  style: AppTheme.bodySmall.copyWith(color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: rows.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 4,
              crossAxisSpacing: 4,
            ),
            itemBuilder: (context, index) {
              final post = rows[index];
              final id = post['id']?.toString() ?? '';
              final cover = post['coverUrl']?.toString() ?? '';
              final label = post['description']?.toString() ?? post['title']?.toString() ?? '';
              return GestureDetector(
                onTap: id.isEmpty
                    ? null
                    : () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => FeedDetailScreen(feedId: id)),
                        );
                      },
                child: ColoredBox(
                  color: const Color(0xFF161618),
                  child: cover.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.all(8),
                          child: Text(
                            label,
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        )
                      : ImageUtils.networkImage(
                          cover,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                          errorWidget: const SizedBox.shrink(),
                        ),
                ),
              );
            },
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
