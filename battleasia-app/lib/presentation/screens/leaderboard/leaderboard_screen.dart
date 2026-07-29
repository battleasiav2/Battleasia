import 'dart:typed_data';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as AppDateUtils;
import 'package:battleasia_app/data/models/leaderboard_entry_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/refresh_overlay.dart';
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
  double _overscrollAccumulator = 0.0;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;

  final List<Map<String, String>> _periods = [
    {'value': 'all', 'label': 'All Time'},
    {'value': 'weekly', 'label': 'This Week'},
    {'value': 'monthly', 'label': 'This Month'},
  ];

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

  List<LeaderboardEntryModel> get _topThree {
    return _leaderboard.take(3).toList();
  }

  String _getRankIcon(int rank) {
    if (rank == 1) return '🥇';
    if (rank == 2) return '🥈';
    if (rank == 3) return '🥉';
    return '#$rank';
  }

  String _formatScore(int score) {
    return NumberFormat('#,###').format(score);
  }

  Color _getBadgeColor(String badge) {
    switch (badge) {
      case 'Champion':
        return Colors.red;
      case 'Elite':
        return Colors.orange;
      case 'Master':
        return Colors.blue;
      case 'Expert':
        return Colors.green;
      case 'Advanced':
      default:
        return Colors.grey;
    }
  }

  Color _getPodiumColor(int index) {
    switch (index) {
      case 0:
        return AppTheme.primaryColor;
      case 1:
        return const Color(0xFF9E9E9E); // silver
      case 2:
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  /// Renders a player avatar correctly for all three storage forms:
  ///   1. Base64 data URI  → decoded via [MemoryImage]
  ///   2. HTTP/HTTPS URL   → [NetworkImage] with error fallback
  ///   3. No avatar        → initial letter on [bgColor] circle
  Widget _buildPlayerAvatar({
    required String? avatar,
    required String username,
    required double radius,
    required double fontSize,
    required Color bgColor,
  }) {
    final size = radius * 2;

    Widget fallback = Text(
      username.isNotEmpty ? username[0].toUpperCase() : 'U',
      style: TextStyle(
        fontSize: fontSize,
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
    );

    // ── 1. Base64 data URI ───────────────────────────────────────────────
    if (ImageUtils.isBase64DataUri(avatar)) {
      final Uint8List? bytes = ImageUtils.decodeBase64DataUri(avatar!);
      if (bytes != null) {
        return CircleAvatar(
          radius: radius,
          backgroundColor: bgColor,
          backgroundImage: MemoryImage(bytes),
        );
      }
    }

    // ── 2. Regular HTTP / HTTPS URL ──────────────────────────────────────
    final resolved = ImageUtils.getImageUrl(avatar);
    if (resolved != null && resolved.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: ClipOval(
          child: Image.network(
            resolved,
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => fallback,
          ),
        ),
      );
    }

    // ── 3. No avatar — initial letter ────────────────────────────────────
    return CircleAvatar(
      radius: radius,
      backgroundColor: bgColor,
      child: fallback,
    );
  }

  Future<void> _onRefresh() async {
    await _fetchLeaderboard(silent: true);
  }

  bool _atTop() =>
      _scrollController.hasClients &&
      _scrollController.position.pixels <= 0;

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
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);
    final loadingPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 40.0);

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
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: spacing16),
                      // Header
                      _buildHeader(),
                      SizedBox(height: spacing24),
                      // Top 3 Podium
                      if (_loading && _leaderboard.isEmpty)
                        Center(
                          child: Padding(
                            padding: EdgeInsets.all(loadingPadding),
                            child: const CircularProgressIndicator(),
                          ),
                        )
                      else if (_topThree.isNotEmpty)
                        _buildPodium(),
                      SizedBox(height: spacing24),
                      // Leaderboard Table
                      _buildLeaderboardTable(),
                      SizedBox(height: spacing24),
                    ],
                  ),
                ),
              ),
                // Bottom padding for floating nav
                SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
              ],
            ),
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: AppHeader(scrollController: _scrollController),
            ),

            // Bottom menu
            const FloatingBottomNav(),
            if (_isRefreshing) const RefreshOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );
    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );
    final buttonPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);
    final buttonPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Text(
          'Leader Board',
          style: AppTheme.heading2.copyWith(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            fontSize: titleFontSize,
            letterSpacing: 1,
          ),
        ),
        // Period Filter
        Row(
          children: _periods.map((period) {
            final isActive = _selectedPeriod == period['value'];
            return Padding(
              padding: EdgeInsets.only(left: spacing8),
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _selectedPeriod = period['value']!;
                  });
                  _fetchLeaderboard();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isActive
                      ? Colors.black87
                      : Colors.white,
                  foregroundColor: isActive ? Colors.white : Colors.black54,
                  padding: EdgeInsets.symmetric(
                    horizontal: buttonPaddingH,
                    vertical: buttonPaddingV,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(
                      color: isActive
                          ? Colors.black87
                          : AppTheme.textSecondary.withOpacity(0.4),
                    ),
                  ),
                  elevation: isActive ? 2 : 0,
                ),
                child: Text(
                  period['label']!,
                  style: AppTheme.bodySmall.copyWith(
                    fontSize: buttonFontSize,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.normal,
                    color: isActive ? Colors.white : Colors.black54,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPodium() {
    final podiumPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 6.0);
    final rankIconFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 32.0,
      min: 28.0,
      max: 40.0,
    );
    final avatarRadius = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 40.0,
    ).clamp(36.0, 48.0);
    final avatarFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 28.0,
    );
    final usernameFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 22.0,
    );
    final badgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 10.0,
      max: 12.0,
    );
    final badgePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final badgePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 6.0);
    final statsFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(14.0, 18.0);

    return Column(
      children: _topThree.asMap().entries.map((entry) {
        final index = entry.key;
        final player = entry.value;
        final color = _getPodiumColor(index);

        return Padding(
          padding: EdgeInsets.only(bottom: spacing8),
          child: Card(
            color: color,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: EdgeInsets.all(podiumPadding),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // ── Left: medal + avatar side-by-side ─────────────────
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Medal emoji
                      Text(
                        _getRankIcon(player.rank),
                        style: TextStyle(fontSize: rankIconFontSize),
                      ),
                      SizedBox(width: spacing8),
                      // Avatar
                      _buildPlayerAvatar(
                        avatar: player.avatar,
                        username: player.username,
                        radius: avatarRadius,
                        fontSize: avatarFontSize,
                        bgColor: Colors.white.withOpacity(0.2),
                      ),
                    ],
                  ),
                  SizedBox(width: podiumPadding),
                  // ── Right: username + badge + stats ────────────────────
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Username
                        Text(
                          player.username,
                          style: AppTheme.heading3.copyWith(
                            fontSize: usernameFontSize,
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: spacing4),
                        // Badge
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: badgePaddingH,
                            vertical: badgePaddingV,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            player.badge,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: badgeFontSize,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        SizedBox(height: spacing8),
                        // Stats row
                        Wrap(
                          spacing: podiumPadding,
                          runSpacing: spacing4,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.star,
                                    size: iconSize, color: Colors.white),
                                SizedBox(width: spacing4),
                                Text(
                                  '${_formatScore(player.totalScore)} Points',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: statsFontSize,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${_formatScore(player.gamesPlayed)} Games',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: statsFontSize,
                              ),
                            ),
                            Text(
                              'Avg: ${player.averageScore.toStringAsFixed(1)}%',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: statsFontSize,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildLeaderboardTable() {
    if (_loading && _leaderboard.isEmpty) {
      return const SizedBox.shrink();
    }

    // Entries ranked 4th and beyond — top 3 are already shown in the podium.
    final rest = _leaderboard.where((p) => p.rank > 3).toList();

    if (rest.isEmpty && _leaderboard.isNotEmpty) {
      return const SizedBox.shrink(); // only top-3 data available
    }
    if (_leaderboard.isEmpty) {
      return _buildEmptyState();
    }

    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 6.0);
    final avatarRadius = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 28.0,
    ).clamp(24.0, 34.0);
    final avatarFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    final rankFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 22.0,
      min: 18.0,
      max: 26.0,
    );
    final usernameFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    final badgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 10.0,
      max: 12.0,
    );
    final badgePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final badgePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 6.0);
    final statsFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 14.0,
    ).clamp(12.0, 16.0);

    return Column(
      children: rest.map((player) {
        return Padding(
          padding: EdgeInsets.only(bottom: spacing8),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.grey[350]!,
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Padding(
              padding: EdgeInsets.all(cardPadding),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // ── Rank number ────────────────────────────────────────
                  SizedBox(
                    width: 36,
                    child: Text(
                      '${player.rank}',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: rankFontSize,
                        fontWeight: FontWeight.w800,
                        color: Colors.black54,
                      ),
                    ),
                  ),
                  SizedBox(width: spacing8),
                  // ── Avatar ─────────────────────────────────────────────
                  _buildPlayerAvatar(
                    avatar: player.avatar,
                    username: player.username,
                    radius: avatarRadius,
                    fontSize: avatarFontSize,
                    bgColor: AppTheme.primaryColor,
                  ),
                  SizedBox(width: cardPadding),
                  // ── Info ───────────────────────────────────────────────
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Username
                        Text(
                          player.username,
                          style: TextStyle(
                            fontSize: usernameFontSize,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: spacing4),
                        // Badge
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: badgePaddingH,
                            vertical: badgePaddingV,
                          ),
                          decoration: BoxDecoration(
                            color: _getBadgeColor(player.badge),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            player.badge,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: badgeFontSize,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        SizedBox(height: spacing8),
                        // Stats
                        Wrap(
                          spacing: cardPadding,
                          runSpacing: spacing4,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.star,
                                    size: iconSize, color: Colors.orange),
                                SizedBox(width: spacing4),
                                Text(
                                  '${_formatScore(player.totalScore)} Points',
                                  style: TextStyle(
                                    fontSize: statsFontSize,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${_formatScore(player.gamesPlayed)} Games',
                              style: TextStyle(
                                fontSize: statsFontSize,
                                color: Colors.black54,
                              ),
                            ),
                            Text(
                              'Avg: ${player.averageScore.toStringAsFixed(1)}%',
                              style: TextStyle(
                                fontSize: statsFontSize,
                                color: Colors.black54,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildEmptyState() {
    final emptyStatePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 40.0);
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 64.0,
    ).clamp(48.0, 80.0);
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final headingFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 18.0,
      max: 24.0,
    );
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );

    return Center(
      child: Padding(
        padding: EdgeInsets.all(emptyStatePadding),
        child: Column(
          children: [
            Icon(
              Icons.emoji_events_outlined,
              size: iconSize,
              color: Colors.grey[400],
            ),
            SizedBox(height: spacing16),
            Text(
              'No Leaderboard Data',
              style: AppTheme.heading3.copyWith(
                fontSize: headingFontSize,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: spacing8),
            Text(
              'No players found for the selected period',
              style: AppTheme.bodyMedium.copyWith(
                fontSize: bodyFontSize,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
