import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/match_history_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
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
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            physics: appScrollPhysics,
            slivers: [
              CupertinoSliverRefreshControl(onRefresh: _onRefresh),
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
        ],
      ),
    );
  }

  Widget _buildStatisticsSummary(BuildContext context) {
    final stats = _stats;
    final cells = [
      ('Total Matches', stats['total'].toString(), Colors.white),
      ('Wins', stats['wins'].toString(), Colors.green),
      ('Losses', stats['losses'].toString(), Colors.red),
      ('Total Prize', (stats['totalPrize'] as double).toStringAsFixed(0), AppTheme.primaryColor),
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF06090E).withValues(alpha: 0.85),
        border: Border(
          top: BorderSide(color: AppColors.gold, width: 2),
          left: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          right: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          bottom: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
        ),
      ),
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        childAspectRatio: 2.4,
        children: List.generate(cells.length, (i) {
          final cell = cells[i];
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              border: Border(
                right: BorderSide(
                  color: Colors.white.withValues(alpha: i.isEven ? 0.08 : 0),
                ),
                bottom: BorderSide(
                  color: Colors.white.withValues(alpha: i < 2 ? 0.08 : 0),
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  cell.$1.toUpperCase(),
                  style: AppTheme.bodySmall.copyWith(
                    color: Colors.white.withValues(alpha: 0.45),
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  cell.$2,
                  style: AppTheme.heading3.copyWith(
                    color: cell.$3,
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
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
    final matches = _filteredMatches;
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF06090E).withValues(alpha: 0.85),
        border: Border(
          top: BorderSide(color: AppColors.gold, width: 2),
          left: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          right: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          bottom: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
        ),
      ),
      child: Column(
        children: List.generate(matches.length, (index) {
          final match = matches[index];
          final isLast = index == matches.length - 1;
          return _MyMatchListRow(
            match: match,
            isLast: isLast,
            onViewDetails: () => _handleViewDetails(match),
          );
        }),
      ),
    );
  }
}

class _MyMatchListRow extends StatelessWidget {
  final MatchHistoryModel match;
  final VoidCallback onViewDetails;
  final bool isLast;

  const _MyMatchListRow({
    required this.match,
    required this.onViewDetails,
    this.isLast = false,
  });

  Color get _statusColor {
    final status = match.matchStatus;
    if (status == 'win') return Colors.green;
    if (status == 'loss') return Colors.red;
    return AppColors.gold;
  }

  String get _statusLabel {
    final status = match.matchStatus;
    if (status == 'win') return 'WON';
    if (status == 'loss') return 'LOST';
    return 'PENDING';
  }

  String _formatDateTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yyyy hh:mm a').format(date);
    } catch (_) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    final bannerUrl =
        ImageUtils.getImageUrl(match.banner) ?? 'assets/images/war2.webp';
    final isWin = match.matchStatus == 'win';
    final isLoss = match.matchStatus == 'loss';
    final meta = [
      _formatDateTime(match.matchSchedule),
      if (match.kills != null) 'Kills ${match.kills}',
      if (match.rank != null) 'Rank #${match.rank}',
    ].join(' · ');

    return InkWell(
      onTap: onViewDetails,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: Colors.white.withValues(alpha: isLast ? 0 : 0.08),
            ),
          ),
        ),
        child: Row(
          children: [
            ClipRRect(
              child: isLoss
                  ? ColorFiltered(
                      colorFilter: const ColorFilter.mode(
                        Colors.grey,
                        BlendMode.saturation,
                      ),
                      child: ImageUtils.networkImage(
                        bannerUrl,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        errorWidget: Image.asset(
                          'assets/images/war2.webp',
                          width: 56,
                          height: 56,
                          fit: BoxFit.cover,
                        ),
                      ),
                    )
                  : ImageUtils.networkImage(
                      bannerUrl,
                      width: 56,
                      height: 56,
                      fit: BoxFit.cover,
                      errorWidget: Image.asset(
                        'assets/images/war2.webp',
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                      ),
                    ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          match.matchName ?? 'Unknown Match',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _statusLabel,
                        style: TextStyle(
                          color: _statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
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
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  isWin ? 'PRIZE' : 'ENTRY',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.4),
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isWin
                      ? match.prizeWon.toStringAsFixed(0)
                      : (match.entryFee ?? 0).toStringAsFixed(0),
                  style: TextStyle(
                    color: isWin ? Colors.green : Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.chevron_right,
              size: 18,
              color: Colors.white.withValues(alpha: 0.35),
            ),
          ],
        ),
      ),
    );
  }
}
