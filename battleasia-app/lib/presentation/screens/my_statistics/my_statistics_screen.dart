import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/match_history_model.dart';
import 'package:battleasia_app/data/models/statistics_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:intl/intl.dart';

class MyStatisticsScreen extends StatefulWidget {
  const MyStatisticsScreen({super.key});

  @override
  State<MyStatisticsScreen> createState() => _MyStatisticsScreenState();
}

class _MyStatisticsScreenState extends State<MyStatisticsScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();

  List<StatisticsItemModel> _statistics = [];
  bool _loading = true;

  static const Color _panelBg = Color(0xD906090E);

  @override
  void initState() {
    super.initState();
    _fetchStatistics();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchStatistics() async {
    setState(() {
      _loading = true;
    });

    try {
      final result = await _gamesService.getMatchHistory();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as List<dynamic>;
        final historyItems = data
            .map(
              (item) =>
                  MatchHistoryModel.fromJson(item as Map<String, dynamic>),
            )
            .toList();

        final statisticsList = historyItems
            .map((item) => StatisticsItemModel.fromMatchHistory(item))
            .toList();

        statisticsList.sort((a, b) {
          try {
            final dateA = DateTime.parse(a.date).millisecondsSinceEpoch;
            final dateB = DateTime.parse(b.date).millisecondsSinceEpoch;
            return dateB.compareTo(dateA);
          } catch (e) {
            return 0;
          }
        });

        setState(() {
          _statistics = statisticsList;
        });
      } else {
        setState(() {
          _statistics = [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load statistics: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() {
        _statistics = [];
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Map<String, num> get _totals {
    final totalPaid = _statistics.fold<double>(
      0.0,
      (sum, stat) => sum + stat.paid,
    );
    final totalWon = _statistics.fold<double>(
      0.0,
      (sum, stat) => sum + stat.won,
    );
    final netProfit = totalWon - totalPaid;
    final wins = _statistics.where((s) => s.won > 0).length;
    final losses = _statistics.where((s) => s.won <= 0).length;
    return {
      'totalPaid': totalPaid,
      'totalWon': totalWon,
      'netProfit': netProfit,
      'wins': wins,
      'losses': losses,
      'matches': _statistics.length,
    };
  }

  String _formatDateTime(String dateStr) {
    if (dateStr.isEmpty) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yyyy hh:mm a').format(date);
    } catch (e) {
      return dateStr;
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

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 22.0,
      min: 20.0,
      max: 26.0,
    );
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);
    final horizontalPadding = isMobile ? 16.0 : 24.0;
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: spacing16),
                      Text(
                        'MY STATISTICS',
                        style: AppTheme.heading2.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w800,
                          fontSize: titleFontSize,
                          letterSpacing: 1,
                        ),
                      ),
                      SizedBox(height: spacing24),
                      if (_loading)
                        Center(
                          child: Padding(
                            padding: EdgeInsets.all(
                              ResponsiveUtils.getResponsiveSpacing(
                                context,
                                baseSize: 32.0,
                              ).clamp(24.0, 40.0),
                            ),
                            child: CircularProgressIndicator(
                              color: AppColors.gold,
                            ),
                          ),
                        )
                      else ...[
                        _buildMergedStatsPanel(),
                        SizedBox(height: spacing24),
                        if (_statistics.isEmpty)
                          _buildEmptyState()
                        else
                          _buildHistoryPanel(),
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

  Widget _buildMergedStatsPanel() {
    final totals = _totals;
    final net = totals['netProfit']!.toDouble();
    final isProfit = net >= 0;
    final display = [
      ('Matches', '${totals['matches']}', AppColors.textPrimary),
      ('Paid', totals['totalPaid']!.toDouble().toStringAsFixed(0), AppColors.gold),
      ('Won', totals['totalWon']!.toDouble().toStringAsFixed(0), AppColors.success),
      (
        'Net',
        '${isProfit && net > 0 ? '+' : ''}${net.toStringAsFixed(0)}',
        isProfit ? AppColors.success : AppColors.error,
      ),
      ('Wins', '${totals['wins']}', AppColors.success),
      ('Losses', '${totals['losses']}', AppColors.error),
    ];

    return Container(
      decoration: _panelDecoration,
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        childAspectRatio: 2.4,
        children: List.generate(display.length, (i) {
          final cell = display[i];
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              border: Border(
                right: BorderSide(
                  color: Colors.white.withValues(alpha: i.isEven ? 0.08 : 0),
                ),
                bottom: BorderSide(
                  color: Colors.white.withValues(alpha: i < 4 ? 0.08 : 0),
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

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.bar_chart_outlined,
              size: 56,
              color: AppColors.textMuted.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No statistics found',
              style: AppTheme.heading3.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            Text(
              "You haven't participated in any matches yet",
              style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryPanel() {
    return Container(
      decoration: _panelDecoration,
      child: Column(
        children: List.generate(_statistics.length, (index) {
          final stat = _statistics[index];
          final isLast = index == _statistics.length - 1;
          final isWin = stat.won > 0;
          return Container(
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
                SizedBox(
                  width: 28,
                  child: Text(
                    '${index + 1}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        stat.matchName.toUpperCase(),
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
                        _formatDateTime(stat.date),
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
                      'WON',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      stat.won.toStringAsFixed(0),
                      style: TextStyle(
                        color: isWin ? AppColors.success : AppColors.textMuted,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
