import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/leaderboard_entry_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/screens/profile/public_profile_screen.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  List<LeaderboardEntryModel> _leaderboard = [];
  bool _loading = true;
  String _selectedPeriod = 'all';

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchLeaderboard({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
      });
    }

    try {
      final result = await _userService.getLeaderboard(
        period: _selectedPeriod == 'all' ? null : _selectedPeriod,
      );
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'];
        final items = data is List ? data : (data['results'] as List? ?? []);

        final leaderboardList = items
            .map(
              (item) =>
                  LeaderboardEntryModel.fromJson(item as Map<String, dynamic>),
            )
            .toList();

        setState(() {
          _leaderboard = leaderboardList;
        });
      } else {
        setState(() {
          _leaderboard = [];
        });
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('board.offline'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() {
        _leaderboard = [];
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Widget _buildPlayerAvatar({
    required String? avatar,
    required String username,
    required double radius,
    required Color borderColor,
  }) {
    final size = radius * 2;
    final fallback = Text(
      username.isNotEmpty ? username[0].toUpperCase() : 'U',
      style: TextStyle(
        fontSize: radius * 0.7,
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
    );

    Widget child = fallback;
    if (ImageUtils.isBase64DataUri(avatar)) {
      final bytes = ImageUtils.decodeBase64DataUri(avatar!);
      if (bytes != null) {
        child = ClipOval(
          child: Image.memory(bytes, width: size, height: size, fit: BoxFit.cover),
        );
      }
    } else {
      final resolved = ImageUtils.getImageUrl(avatar);
      if (resolved != null && resolved.isNotEmpty) {
        child = ClipOval(
          child: Image.network(
            resolved,
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Center(child: fallback),
          ),
        );
      }
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF0A0A0A),
        border: Border.all(color: borderColor.withValues(alpha: 0.55)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Center(child: child),
    );
  }

  Future<void> _onRefresh() async {
    await _fetchLeaderboard(silent: true);
  }

  List<LeaderboardEntryModel> get _topThree => _leaderboard.take(3).toList();

  String _formatScore(int score) => NumberFormat('#,###').format(score);

  Color _podiumRankColor(int rank) {
    switch (rank) {
      case 1:
        return AppColors.gold;
      case 2:
        return const Color(0xFFC0C0C0);
      case 3:
        return const Color(0xFFCD7F32);
      default:
        return AppColors.textMuted;
    }
  }

  double _pedestalHeight(int rank) {
    switch (rank) {
      case 1:
        return 88;
      case 2:
        return 58;
      case 3:
        return 44;
      default:
        return 40;
    }
  }

  double _podiumAvatarRadius(int rank) {
    switch (rank) {
      case 1:
        return 34;
      case 2:
        return 24;
      case 3:
        return 22;
      default:
        return 20;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final horizontalPadding = isMobile ? 16.0 : 24.0;
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);
    final tabFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            physics: appScrollPhysics,
            slivers: [
              CupertinoSliverRefreshControl(onRefresh: _onRefresh),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
              SliverToBoxAdapter(
                child: Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: spacing16),
                      Text(
                        'account.leaderboard'.tr(),
                        style: TextStyle(
                          color: const Color(0xFFE7E9DE),
                          fontSize: isMobile ? 22 : 24,
                          fontWeight: FontWeight.w700,
                          height: 1.1,
                        ),
                      ),
                      SizedBox(height: spacing16),
                      if (_loading && _leaderboard.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: CircularProgressIndicator(
                              color: AppColors.gold,
                            ),
                          ),
                        )
                      else ...[
                        PlayTabs(
                          tabs: [
                            {'label': 'board.all'.tr(), 'value': 'all'},
                            {'label': 'board.weekly'.tr(), 'value': 'weekly'},
                            {'label': 'board.monthly'.tr(), 'value': 'monthly'},
                          ],
                          activeTab: _selectedPeriod,
                          onTabChanged: (period) {
                            setState(() => _selectedPeriod = period);
                            _fetchLeaderboard();
                          },
                          fontSize: tabFontSize,
                        ),
                        SizedBox(height: spacing16),
                        if (_loading)
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: CircularProgressIndicator(
                                color: AppColors.gold,
                              ),
                            ),
                          )
                        else if (_leaderboard.isEmpty)
                          _buildEmptyState()
                        else ...[
                          if (_topThree.isNotEmpty) ...[
                            _buildPodium(),
                            SizedBox(height: spacing16),
                          ],
                          _buildLeaderboardTable(),
                        ],
                      ],
                      SizedBox(height: spacing24),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
            ],
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  void _openProfile(LeaderboardEntryModel player) {
    if (player.id.isEmpty) return;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => PublicProfileScreen(userId: player.id)),
    );
  }

  Widget _buildPodium() {
    final byRank = {for (final p in _topThree) p.rank: p};
    // Stadium order: 2nd · 1st · 3rd
    final order = [2, 1, 3];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0x61161618),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.gold.withValues(alpha: 0.12),
            const Color(0x61161618),
          ],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x70000000),
            blurRadius: 40,
            offset: Offset(0, 24),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(10, 20, 10, 0),
      clipBehavior: Clip.antiAlias,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: order.map((rank) {
          final player = byRank[rank];
          final color = _podiumRankColor(rank);
          final isChamp = rank == 1;
          final flex = isChamp ? 12 : 10;

          return Expanded(
            flex: flex,
            child: player == null
                ? SizedBox(height: _pedestalHeight(rank) + 120)
                : GestureDetector(
                    onTap: () => _openProfile(player),
                    child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isChamp)
                        Icon(
                          Icons.workspace_premium,
                          color: AppColors.gold,
                          size: 22,
                          shadows: [
                            Shadow(
                              color: AppColors.gold.withValues(alpha: 0.55),
                              blurRadius: 10,
                            ),
                          ],
                        )
                      else
                        const SizedBox(height: 22),
                      const SizedBox(height: 6),
                      Stack(
                        clipBehavior: Clip.none,
                        alignment: Alignment.center,
                        children: [
                          Container(
                            decoration: isChamp
                                ? BoxDecoration(
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.gold
                                            .withValues(alpha: 0.35),
                                        blurRadius: 18,
                                        spreadRadius: 2,
                                      ),
                                    ],
                                  )
                                : null,
                            child: _buildPlayerAvatar(
                              avatar: player.avatar,
                              username: player.username,
                              radius: _podiumAvatarRadius(rank),
                              borderColor: color,
                            ),
                          ),
                          Positioned(
                            bottom: -6,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 7,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF06090E),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(
                                  color: color.withValues(alpha: 0.7),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: color.withValues(alpha: 0.25),
                                    blurRadius: 10,
                                  ),
                                ],
                              ),
                              child: Text(
                                '#$rank',
                                style: TextStyle(
                                  color: color,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        isChamp ? 'CHAMPION' : 'RANK $rank',
                        style: TextStyle(
                          color: const Color(0xFF858B83),
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        player.username,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w900,
                          fontSize: isChamp ? 13 : 11,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_formatScore(player.totalScore)} BAC',
                        style: TextStyle(
                          color: const Color(0xFFCBD481),
                          fontWeight: FontWeight.w700,
                          fontSize: isChamp ? 13 : 11,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        height: _pedestalHeight(rank),
                        width: double.infinity,
                        alignment: Alignment.topCenter,
                        padding: const EdgeInsets.only(top: 8),
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(14),
                          ),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              color.withValues(alpha: 0.34),
                              color.withValues(alpha: 0.08),
                              Colors.black.withValues(alpha: 0.35),
                            ],
                          ),
                          border: Border(
                            top: BorderSide(color: color, width: 2),
                            left: BorderSide(
                              color: color.withValues(alpha: 0.35),
                            ),
                            right: BorderSide(
                              color: color.withValues(alpha: 0.35),
                            ),
                          ),
                          boxShadow: isChamp
                              ? [
                                  BoxShadow(
                                    color: color.withValues(alpha: 0.22),
                                    blurRadius: 18,
                                    offset: const Offset(0, -6),
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          '$rank',
                          style: TextStyle(
                            color: color.withValues(alpha: 0.55),
                            fontSize: isChamp ? 26 : 18,
                            fontWeight: FontWeight.w900,
                            height: 1,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLeaderboardTable() {
    final rest = _leaderboard.where((p) => p.rank > 3).toList();
    if (rest.isEmpty) return const SizedBox.shrink();

    Widget rankMark(int rank) {
      return Text(
        rank.toString().padLeft(2, '0'),
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: Colors.white.withValues(alpha: 0.45),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0x6E07090A),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'THE CHASING PACK',
                    style: TextStyle(
                      color: const Color(0xFF7B8179),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
                Text(
                  'RANK / PLAYER / BAC',
                  style: TextStyle(
                    color: const Color(0xFF7B8179),
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                  ),
                ),
              ],
            ),
          ),
          ...rest.map((player) {
            return InkWell(
              onTap: () => _openProfile(player),
              child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.white.withValues(alpha: 0.055)),
                ),
              ),
              child: Row(
                children: [
                  SizedBox(width: 28, child: rankMark(player.rank)),
                  _buildPlayerAvatar(
                    avatar: player.avatar,
                    username: player.username,
                    radius: 14,
                    borderColor: const Color(0x2BD4E82A),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      player.username,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFC9CCC3),
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  Text(
                    _formatScore(player.totalScore),
                    style: const TextStyle(
                      color: Color(0xFFCBD481),
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.emoji_events_outlined,
              size: 56,
              color: AppColors.textMuted.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'board.none'.tr(),
              style: AppTheme.heading3.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
