import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/leaderboard_entry_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/refresh_overlay.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:intl/intl.dart';

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
  bool _isRefreshing = false;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;

  static const Color _panelBg = Color(0xD906090E);

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
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load leaderboard: ${e.toString()}'),
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

  BoxDecoration get _panelDecoration => BoxDecoration(
        color: _panelBg,
        border: Border(
          top: BorderSide(color: AppColors.gold, width: 2),
          left: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          right: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          bottom: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
        ),
      );

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

  bool _atTop() =>
      _scrollController.hasClients && _scrollController.position.pixels <= 0;

  bool _atBottom() =>
      _scrollController.hasClients &&
      _scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent;

  void _onPointerDown(PointerDownEvent e) {
    _dragStartY = e.position.dy;
    _dragStartedAtTop = _atTop();
    _dragStartedAtBottom = _atBottom();
  }

  void _onPointerMove(PointerMoveEvent e) {
    if (_isRefreshing) return;
    final dy = e.position.dy - _dragStartY;
    if ((dy > 0 && _dragStartedAtTop) || (dy < 0 && _dragStartedAtBottom)) {
      if (dy.abs() >= 70) _triggerRefresh();
    }
  }

  void _onPointerSignal(PointerSignalEvent e) {
    if (_isRefreshing) return;
    if (e is PointerScrollEvent) {
      final scrollingUp = e.scrollDelta.dy < 0;
      final scrollingDown = e.scrollDelta.dy > 0;
      if (scrollingDown && _atTop()) {
        _wheelAccumulator += e.scrollDelta.dy.abs();
      } else if (scrollingUp && _atBottom()) {
        _wheelAccumulator += e.scrollDelta.dy.abs();
      } else {
        _wheelAccumulator = 0;
      }
      if (_wheelAccumulator >= 60) {
        _wheelAccumulator = 0;
        _triggerRefresh();
      }
    }
  }

  Future<void> _triggerRefresh() async {
    if (_isRefreshing || !mounted) return;
    setState(() => _isRefreshing = true);
    await _onRefresh();
    if (mounted) setState(() => _isRefreshing = false);
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
      body: Listener(
        onPointerDown: _onPointerDown,
        onPointerMove: _onPointerMove,
        onPointerSignal: _onPointerSignal,
        child: Stack(
          fit: StackFit.expand,
          children: [
            CustomScrollView(
              controller: _scrollController,
              physics: const ClampingScrollPhysics(),
              slivers: [
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding:
                        EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                            tabs: const [
                              {'label': 'ALL TIME', 'value': 'all'},
                              {'label': 'THIS WEEK', 'value': 'weekly'},
                              {'label': 'THIS MONTH', 'value': 'monthly'},
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
                              SizedBox(height: spacing24),
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
            if (_isRefreshing) const RefreshOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildPodium() {
    final byRank = {for (final p in _topThree) p.rank: p};
    // Stadium order: 2nd · 1st · 3rd
    final order = [2, 1, 3];

    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: AppColors.gold, width: 2),
          left: BorderSide(color: AppColors.gold.withValues(alpha: 0.32)),
          right: BorderSide(color: AppColors.gold.withValues(alpha: 0.32)),
          bottom: BorderSide(color: AppColors.gold.withValues(alpha: 0.32)),
        ),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.gold.withValues(alpha: 0.1),
            const Color(0xE004070C),
          ],
        ),
      ),
      padding: const EdgeInsets.fromLTRB(8, 20, 8, 0),
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
                : Column(
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
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF06090E),
                                border: Border.all(
                                  color: color.withValues(alpha: 0.7),
                                ),
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
                        player.username.toUpperCase(),
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
                        _formatScore(player.totalScore),
                        style: TextStyle(
                          color: isChamp ? AppColors.gold : AppColors.textPrimary,
                          fontWeight: FontWeight.w800,
                          fontSize: isChamp ? 15 : 12,
                        ),
                      ),
                      const SizedBox(height: 10),
                      // Pedestal
                      Container(
                        height: _pedestalHeight(rank),
                        width: double.infinity,
                        alignment: Alignment.topCenter,
                        padding: const EdgeInsets.only(top: 8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              color.withValues(alpha: 0.28),
                              color.withValues(alpha: 0.06),
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
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLeaderboardTable() {
    final rest = _leaderboard.where((p) => p.rank > 3).toList();
    if (rest.isEmpty) return const SizedBox.shrink();

    final peak = _leaderboard.isNotEmpty
        ? _leaderboard.first.totalScore.clamp(1, 1 << 30)
        : 1;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 2, bottom: 10),
          child: Row(
            children: [
              Icon(Icons.leaderboard, size: 16, color: AppColors.gold),
              const SizedBox(width: 6),
              Text(
                'FULL RANKINGS',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.55),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
        ),
        Container(
          decoration: _panelDecoration,
          child: Column(
            children: List.generate(rest.length, (index) {
              final player = rest[index];
              final isLast = index == rest.length - 1;
              final strength =
                  ((player.totalScore / peak) * 100).clamp(0, 100).round();
              final meta = [
                'Lvl ${player.level}',
                '${_formatScore(player.gamesPlayed)} Games',
                'Avg ${player.averageScore.toStringAsFixed(1)}%',
                player.badge,
                if (player.lastPlayed != null && player.lastPlayed!.isNotEmpty)
                  player.lastPlayed!,
              ].join(' · ');

              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color:
                          Colors.white.withValues(alpha: isLast ? 0 : 0.08),
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    SizedBox(
                      width: 36,
                      child: Text(
                        '${player.rank}',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: Colors.white.withValues(alpha: 0.45),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    _buildPlayerAvatar(
                      avatar: player.avatar,
                      username: player.username,
                      radius: 20,
                      borderColor: Colors.white.withValues(alpha: 0.12),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            player.username.toUpperCase(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            meta,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTheme.bodySmall.copyWith(
                              color: Colors.white.withValues(alpha: 0.5),
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            child: LinearProgressIndicator(
                              value: strength / 100,
                              minHeight: 3,
                              backgroundColor:
                                  Colors.white.withValues(alpha: 0.06),
                              color: AppColors.gold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          _formatScore(player.totalScore),
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$strength% PWR',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.35),
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ),
        ),
      ],
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
              'No Leaderboard Data',
              style: AppTheme.heading3.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            Text(
              'No players found for the selected period',
              style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
