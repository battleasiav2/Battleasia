import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/match_history_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/refresh_overlay.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/screens/play/match_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/play/match_result_screen.dart';
import 'package:intl/intl.dart';

class MyMatchesScreen extends StatefulWidget {
  const MyMatchesScreen({super.key});

  @override
  State<MyMatchesScreen> createState() => _MyMatchesScreenState();
}

class _MyMatchesScreenState extends State<MyMatchesScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();

  String _activeTab = 'all';
  List<MatchHistoryModel> _matches = [];
  bool _loading = true;
  bool _isRefreshing = false;
  double _overscrollAccumulator = 0.0;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchMatches();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMatches({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
      });
    }

    try {
      final result = await _gamesService.getMatchHistory();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as List<dynamic>;
        setState(() {
          _matches = data
              .map(
                (item) =>
                    MatchHistoryModel.fromJson(item as Map<String, dynamic>),
              )
              .toList();
        });
      } else {
        // Handle case where API returns success but no data
        setState(() {
          _matches = [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load match history: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  List<MatchHistoryModel> get _filteredMatches {
    if (_activeTab == 'all') return _matches;
    if (_activeTab == 'win') {
      return _matches.where((m) => m.matchStatus == 'win').toList();
    }
    if (_activeTab == 'loss') {
      return _matches.where((m) => m.matchStatus == 'loss').toList();
    }
    return _matches.where((m) => m.matchStatus == 'pending').toList();
  }

  Map<String, dynamic> get _stats {
    final total = _matches.length;
    final wins = _matches.where((m) => m.matchStatus == 'win').length;
    final losses = _matches.where((m) => m.matchStatus == 'loss').length;
    final pending = _matches.where((m) => m.matchStatus == 'pending').length;
    final totalPrize = _matches
        .where((m) => m.matchStatus == 'win')
        .fold<double>(0.0, (sum, m) => sum + m.prizeWon);
    final totalEntryFee = _matches.fold<double>(
      0.0,
      (sum, m) => sum + (m.entryFee ?? 0.0),
    );

    return {
      'total': total,
      'wins': wins,
      'losses': losses,
      'pending': pending,
      'totalPrize': totalPrize,
      'totalEntryFee': totalEntryFee,
    };
  }

  void _handleViewDetails(MatchHistoryModel match) {
    final targetId = match.matchId ?? match.id;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => match.matchStatus == 'pending'
            ? MatchDetailScreen(matchId: targetId)
            : MatchResultScreen(matchId: targetId),
      ),
    );
  }

  Future<void> _onRefresh() async {
    await _fetchMatches(silent: true);
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
    // Responsive sizes
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final bottomPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(60.0, 80.0);

    final tabFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
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
                SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: spacing16),
                        // Statistics Summary
                      _buildStatisticsSummary(context),
                      SizedBox(height: spacing24),

                      // Tabs
                      PlayTabs(
                        tabs: const [
                          {'label': 'ALL', 'value': 'all'},
                          {'label': 'WINS', 'value': 'win'},
                          {'label': 'LOSSES', 'value': 'loss'},
                          {'label': 'PENDING', 'value': 'pending'},
                        ],
                        activeTab: _activeTab,
                        onTabChanged: (tab) {
                          setState(() {
                            _activeTab = tab;
                          });
                        },
                        fontSize: tabFontSize,
                      ),

                      // Match Cards
                      if (_loading)
                        Center(
                          child: Padding(
                            padding: EdgeInsets.all(spacing24 * 1.33),
                            child: const CircularProgressIndicator(),
                          ),
                        )
                      else if (_filteredMatches.isEmpty)
                        _buildEmptyState(context)
                      else
                        _buildMatchGrid(context),
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

  Widget _buildStatisticsSummary(BuildContext context) {
    final stats = _stats;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatItem(
          context,
          'Total Matches',
          stats['total'].toString(),
          Colors.black,
        ),
        _buildStatItem(context, 'Wins', stats['wins'].toString(), Colors.green),
        _buildStatItem(
          context,
          'Losses',
          stats['losses'].toString(),
          Colors.red,
        ),
        _buildStatItem(
          context,
          'Total Prize',
          stats['totalPrize'].toStringAsFixed(2),
          AppTheme.primaryColor,
        ),
      ],
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    Color color,
  ) {
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 22.0,
    );

    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    return Column(
      children: [
        Text(
          label,
          style: AppTheme.bodySmall.copyWith(
            color: Colors.grey,
            fontSize: labelFontSize,
          ),
        ),
        SizedBox(height: spacing4),
        Text(
          value,
          style: AppTheme.heading3.copyWith(
            color: color,
            fontWeight: FontWeight.w600,
            fontSize: valueFontSize,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final emptyStatePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 32.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 64.0,
    ).clamp(48.0, 64.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final textFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 20.0,
    );

    return Center(
      child: Padding(
        padding: EdgeInsets.all(emptyStatePadding),
        child: Column(
          children: [
            Icon(Icons.description, size: iconSize, color: Colors.grey[400]),
            SizedBox(height: spacing16),
            Text(
              'No matches found',
              style: AppTheme.heading3.copyWith(
                color: Colors.grey,
                fontSize: textFontSize,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMatchGrid(BuildContext context) {
    final gridSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 10.0,
    ).clamp(4.0, 12.0);

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: gridSpacing,
        mainAxisSpacing: gridSpacing,
        mainAxisExtent: 250, // Large enough to allow content-based sizing
      ),
      itemCount: _filteredMatches.length,
      itemBuilder: (context, index) {
        return _MyMatchCard(
          match: _filteredMatches[index],
          onViewDetails: () => _handleViewDetails(_filteredMatches[index]),
        );
      },
    );
  }
}

class _MyMatchCard extends StatelessWidget {
  final MatchHistoryModel match;
  final VoidCallback onViewDetails;

  const _MyMatchCard({required this.match, required this.onViewDetails});

  Color _getStatusColor() {
    final status = match.matchStatus;
    if (status == 'win') return Colors.green;
    if (status == 'loss') return Colors.red;
    return Colors.orange;
  }

  String _getStatusLabel() {
    final status = match.matchStatus;
    if (status == 'win') return 'WON';
    if (status == 'loss') return 'LOST';
    return 'PENDING';
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    final statusLabel = _getStatusLabel();
    final bannerUrl =
        ImageUtils.getImageUrl(match.banner) ?? 'assets/images/war2.webp';
    final isLoss = match.matchStatus == 'loss';

    // Responsive sizes
    final bannerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 120.0,
    ).clamp(90.0, 120.0);

    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 12.0);

    final badgePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final badgePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    final badgeTop = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final badgeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 10.0,
      min: 8.0,
      max: 12.0,
    );

    final matchTypePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 6.0,
    ).clamp(4.0, 6.0);

    final matchTypePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 2.0,
    ).clamp(1.0, 2.0);

    final matchTypeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 10.0,
      min: 8.0,
      max: 12.0,
    );

    final mapFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 9.0,
      max: 13.0,
    );

    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    final spacing6 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 6.0,
    ).clamp(4.0, 6.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final spacing2 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 2.0,
    ).clamp(1.0, 2.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    final dateFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 9.0,
      max: 13.0,
    );

    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 10.0,
      min: 8.0,
      max: 12.0,
    );

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 12.0);

    final bulletSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 5.0,
    ).clamp(4.0, 5.0);

    final buttonIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(14.0, 16.0);

    final buttonPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 6.0,
    ).clamp(4.0, 8.0);

    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final borderRadius = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxHeight: 250),
      child: Card(
        color: AppTheme.surfaceColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero Image
                Stack(
                  children: [
                    Container(
                      height: bannerHeight,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(borderRadius),
                        ),
                        image: DecorationImage(
                          image:
                              bannerUrl.startsWith('http') ||
                                  bannerUrl.startsWith('assets')
                              ? (bannerUrl.startsWith('assets')
                                    ? AssetImage(bannerUrl) as ImageProvider
                                    : NetworkImage(bannerUrl))
                              : AssetImage('assets/images/war2.webp'),
                          fit: BoxFit.cover,
                          colorFilter: isLoss
                              ? const ColorFilter.mode(
                                  Colors.grey,
                                  BlendMode.saturation,
                                )
                              : null,
                        ),
                      ),
                    ),
                    // Gradient overlay
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.2),
                              Colors.black.withOpacity(0.6),
                            ],
                          ),
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(borderRadius),
                          ),
                        ),
                      ),
                    ),
                    // Status Badge
                    Positioned(
                      top: badgeTop,
                      right: badgeTop,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: badgePaddingH,
                          vertical: badgePaddingV,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          statusLabel,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: badgeFontSize,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    // Match Type & Map
                    Positioned(
                      top: badgeTop,
                      left: badgeTop,
                      child: Row(
                        children: [
                          if (match.matchType != null)
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: matchTypePaddingH,
                                vertical: matchTypePaddingV,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF6B7A),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                match.matchType!.toUpperCase(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: matchTypeFontSize,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          if (match.matchType != null && match.map != null)
                            SizedBox(width: spacing4),
                          if (match.map != null)
                            Text(
                              match.map!,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: mapFontSize,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Match Information
                Padding(
                  padding: EdgeInsets.only(
                    left: cardPadding,
                    right: cardPadding,
                    top: cardPadding,
                    bottom:
                        cardPadding + 60, // Add extra bottom padding for button
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Match Title
                      Row(
                        children: [
                          Container(
                            width: bulletSize,
                            height: bulletSize,
                            decoration: BoxDecoration(
                              color: Colors.grey.withOpacity(0.3),
                              shape: BoxShape.circle,
                            ),
                          ),
                          SizedBox(width: spacing6),
                          Expanded(
                            child: Text(
                              match.matchName ?? 'Unknown Match',
                              style: AppTheme.bodyMedium.copyWith(
                                color: Colors.black,
                                fontWeight: FontWeight.w600,
                                fontSize: titleFontSize,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),

                      SizedBox(height: spacing4),

                      // Match Date
                      Text(
                        _formatDateTime(match.matchSchedule),
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.w500,
                          fontSize: dateFontSize,
                        ),
                      ),

                      SizedBox(height: spacing8),

                      // Match Statistics
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'ENTRY FEE',
                                  style: AppTheme.bodySmall.copyWith(
                                    color: Colors.grey,
                                    fontSize: labelFontSize,
                                  ),
                                ),
                                SizedBox(height: spacing2),
                                Row(
                                  children: [
                                    Image.asset(
                                      'assets/images/currency.webp',
                                      width: currencyIconSize,
                                      height: currencyIconSize,
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                            return const SizedBox.shrink();
                                          },
                                    ),
                                    SizedBox(width: spacing2),
                                    Text(
                                      (match.entryFee ?? 0.0).toStringAsFixed(
                                        0,
                                      ),
                                      style: AppTheme.bodySmall.copyWith(
                                        color: Colors.black,
                                        fontWeight: FontWeight.w600,
                                        fontSize: valueFontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'PRIZE WON',
                                  style: AppTheme.bodySmall.copyWith(
                                    color: match.matchStatus == 'win'
                                        ? Colors.green
                                        : Colors.grey,
                                    fontSize: labelFontSize,
                                  ),
                                ),
                                SizedBox(height: spacing2),
                                Row(
                                  children: [
                                    Image.asset(
                                      'assets/images/currency.webp',
                                      width: currencyIconSize,
                                      height: currencyIconSize,
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                            return const SizedBox.shrink();
                                          },
                                    ),
                                    SizedBox(width: spacing2),
                                    Text(
                                      match.matchStatus == 'win'
                                          ? match.prizeWon.toStringAsFixed(2)
                                          : '-',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: match.matchStatus == 'win'
                                            ? Colors.green
                                            : Colors.grey,
                                        fontWeight: FontWeight.w600,
                                        fontSize: valueFontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      if (match.kills != null || match.rank != null) ...[
                        SizedBox(height: spacing8),
                        Row(
                          children: [
                            if (match.kills != null)
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'KILLS',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: Colors.grey,
                                        fontSize: labelFontSize,
                                      ),
                                    ),
                                    SizedBox(height: spacing2),
                                    Text(
                                      match.kills.toString(),
                                      style: AppTheme.bodySmall.copyWith(
                                        color: Colors.black,
                                        fontWeight: FontWeight.w600,
                                        fontSize: valueFontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            if (match.rank != null)
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'RANK',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: Colors.grey,
                                        fontSize: labelFontSize,
                                      ),
                                    ),
                                    SizedBox(height: spacing2),
                                    Text(
                                      '#${match.rank}',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: Colors.black,
                                        fontWeight: FontWeight.w600,
                                        fontSize: valueFontSize,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            // View Details Button - Positioned absolutely at bottom
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: EdgeInsets.all(cardPadding),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceColor,
                  borderRadius: BorderRadius.vertical(
                    bottom: Radius.circular(borderRadius),
                  ),
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: onViewDetails,
                    icon: Icon(Icons.remove_red_eye, size: buttonIconSize),
                    label: Text(
                      'View Details',
                      style: TextStyle(fontSize: buttonFontSize),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF6B7A),
                      foregroundColor: Colors.black,
                      padding: EdgeInsets.symmetric(vertical: buttonPadding),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yyyy hh:mm a').format(date);
    } catch (e) {
      return 'N/A';
    }
  }
}
