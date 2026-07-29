import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/games_service.dart';
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

        // Map to statistics items
        final statisticsList = historyItems
            .map((item) => StatisticsItemModel.fromMatchHistory(item))
            .toList();

        // Sort by date descending (most recent first)
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

  Map<String, double> get _totals {
    final totalPaid = _statistics.fold<double>(
      0.0,
      (sum, stat) => sum + stat.paid,
    );
    final totalWon = _statistics.fold<double>(
      0.0,
      (sum, stat) => sum + stat.won,
    );
    final netProfit = totalWon - totalPaid;
    return {
      'totalPaid': totalPaid,
      'totalWon': totalWon,
      'netProfit': netProfit,
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

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);
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
                      // Header
                      Text(
                        'MY STATISTICS',
                        style: AppTheme.heading2.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.w700,
                          fontSize: titleFontSize,
                          letterSpacing: 1,
                        ),
                      ),
                      SizedBox(height: spacing24),

                      // Summary Cards
                      if (_loading)
                        Center(
                          child: Padding(
                            padding: EdgeInsets.all(
                              ResponsiveUtils.getResponsiveSpacing(
                                context,
                                baseSize: 32.0,
                              ).clamp(24.0, 40.0),
                            ),
                            child: const CircularProgressIndicator(),
                          ),
                        )
                      else ...[
                        _buildSummaryCards(),
                        SizedBox(height: spacing24),

                        // Statistics Table
                        if (_statistics.isEmpty)
                          _buildEmptyState()
                        else
                          _buildStatisticsTable(),
                      ],
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
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    final totals = _totals;
    final netProfit = totals['netProfit']!;
    final isProfit = netProfit >= 0;

    return Column(
      children: [
        _buildSummaryCard(
          'Total Paid',
          totals['totalPaid']!,
          AppTheme.primaryColor,
          Colors.black,
        ),
        _buildSummaryCard(
          'Total Won',
          totals['totalWon']!,
          Colors.green,
          Colors.green,
        ),
        _buildSummaryCard(
          'Net Profit',
          netProfit,
          isProfit ? Colors.green : Colors.red,
          isProfit ? Colors.green : Colors.red,
          showSign: true,
        ),
      ],
    );
  }

  Widget _buildSummaryCard(
    String label,
    double value,
    Color iconColor,
    Color textColor, {
    bool showSign = false,
  }) {
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 12.0,
      max: 15.0,
    );
    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 22.0,
      min: 20.0,
      max: 28.0,
    );
    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 28.0,
    ).clamp(24.0, 32.0);

    return Card(
      color: AppTheme.surfaceColor,
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: cardPadding,
          vertical: cardPadding * 0.85,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label.toUpperCase(),
              style: AppTheme.bodySmall.copyWith(
                color: Colors.grey,
                fontSize: labelFontSize,
                letterSpacing: 0.5,
                fontWeight: FontWeight.w600,
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset(
                  'assets/images/currency.webp',
                  width: currencyIconSize,
                  height: currencyIconSize,
                  errorBuilder: (context, error, stackTrace) {
                    return Icon(
                      Icons.account_balance_wallet,
                      color: iconColor,
                      size: currencyIconSize,
                    );
                  },
                ),
                const SizedBox(width: 8),
                Text(
                  '${showSign && value >= 0 ? '+' : ''}${value.toStringAsFixed(2)}',
                  style: AppTheme.heading3.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w700,
                    fontSize: valueFontSize,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
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
            Icon(Icons.bar_chart_outlined, size: iconSize, color: Colors.grey[400]),
            SizedBox(height: spacing16),
            Text(
              'No statistics found',
              style: AppTheme.heading3.copyWith(
                fontSize: headingFontSize,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: spacing8),
            Text(
              "You haven't participated in any matches yet",
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

  Widget _buildStatisticsTable() {
    final tablePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final tablePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);
    final headerFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 11.0,
      max: 14.0,
    );
    final columnWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(70.0, 100.0);
    final indexWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 40.0,
    ).clamp(35.0, 50.0);

    return Card(
      color: AppTheme.surfaceColor,
      child: Column(
        children: [
          // Table Header
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: tablePaddingH,
              vertical: tablePaddingV,
            ),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              border: Border(bottom: BorderSide(color: Colors.grey[300]!)),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: indexWidth,
                  child: Text(
                    '#',
                    style: AppTheme.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: headerFontSize,
                      color: Colors.black,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    'Match Info',
                    style: AppTheme.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: headerFontSize,
                      color: Colors.black,
                    ),
                  ),
                ),
                SizedBox(
                  width: columnWidth,
                  child: Text(
                    'Paid',
                    textAlign: TextAlign.right,
                    style: AppTheme.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: headerFontSize,
                      color: Colors.black,
                    ),
                  ),
                ),
                SizedBox(
                  width: columnWidth,
                  child: Text(
                    'Won',
                    textAlign: TextAlign.right,
                    style: AppTheme.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: headerFontSize,
                      color: Colors.black,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Table Body
          ..._statistics.asMap().entries.map((entry) {
            final index = entry.key;
            final stat = entry.value;
            final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
              context,
              baseSize: 14.0,
              min: 12.0,
              max: 16.0,
            );
            final smallFontSize = ResponsiveUtils.getResponsiveFontSize(
              context,
              baseSize: 11.0,
              min: 10.0,
              max: 12.0,
            );
            final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
              context,
              baseSize: 16.0,
            ).clamp(14.0, 20.0);
            final spacing4 = ResponsiveUtils.getResponsiveSpacing(
              context,
              baseSize: 4.0,
            ).clamp(2.0, 6.0);
            final columnWidth = ResponsiveUtils.getResponsiveSpacing(
              context,
              baseSize: 80.0,
            ).clamp(70.0, 100.0);
            final indexWidth = ResponsiveUtils.getResponsiveSpacing(
              context,
              baseSize: 40.0,
            ).clamp(35.0, 50.0);

            return Container(
              padding: EdgeInsets.symmetric(
                horizontal: tablePaddingH,
                vertical: tablePaddingV,
              ),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Colors.grey[200]!, width: 1),
                ),
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: indexWidth,
                    child: Text(
                      '${index + 1}',
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.black,
                        fontSize: bodyFontSize,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          stat.matchName,
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.black,
                            fontWeight: FontWeight.w500,
                            fontSize: bodyFontSize,
                          ),
                        ),
                        SizedBox(height: spacing4),
                        Text(
                          _formatDateTime(stat.date),
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.grey,
                            fontSize: smallFontSize,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: columnWidth,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Image.asset(
                          'assets/images/currency.webp',
                          width: currencyIconSize,
                          height: currencyIconSize,
                          errorBuilder: (context, error, stackTrace) {
                            return const SizedBox.shrink();
                          },
                        ),
                        SizedBox(width: spacing4),
                        Flexible(
                          child: Text(
                            stat.paid.toStringAsFixed(2),
                            textAlign: TextAlign.right,
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                              fontSize: bodyFontSize,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: columnWidth,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Image.asset(
                          'assets/images/currency.webp',
                          width: currencyIconSize,
                          height: currencyIconSize,
                          errorBuilder: (context, error, stackTrace) {
                            return const SizedBox.shrink();
                          },
                        ),
                        SizedBox(width: spacing4),
                        Flexible(
                          child: Text(
                            stat.won.toStringAsFixed(2),
                            textAlign: TextAlign.right,
                            style: AppTheme.bodyMedium.copyWith(
                              color: stat.won > 0 ? Colors.green : Colors.grey,
                              fontWeight: FontWeight.w600,
                              fontSize: bodyFontSize,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
