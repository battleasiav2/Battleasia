import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/referral_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:intl/intl.dart';

class MyReferralsScreen extends StatefulWidget {
  const MyReferralsScreen({super.key});

  @override
  State<MyReferralsScreen> createState() => _MyReferralsScreenState();
}

class _MyReferralsScreenState extends State<MyReferralsScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  List<ReferralItemModel> _referrals = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchReferrals();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchReferrals() async {
    setState(() {
      _loading = true;
    });

    try {
      final result = await _userService.getReferrals();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as List<dynamic>;
        final referralsList = data
            .map((item) => ReferralItemModel.fromJson(
                item as Map<String, dynamic>))
            .toList();

        // Sort by date descending (most recent first)
        referralsList.sort((a, b) {
          try {
            final dateA = DateTime.parse(a.date).millisecondsSinceEpoch;
            final dateB = DateTime.parse(b.date).millisecondsSinceEpoch;
            return dateB.compareTo(dateA);
          } catch (e) {
            return 0;
          }
        });

        setState(() {
          _referrals = referralsList;
        });
      } else {
        setState(() {
          _referrals = [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load referrals: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() {
        _referrals = [];
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Map<String, dynamic> get _summary {
    final totalReferrals = _referrals.length;
    final activeReferrals =
        _referrals.where((r) => r.status == 'active').length;
    final totalEarnings = _referrals.fold<double>(
        0.0, (sum, r) => sum + (r.earnings ?? 0.0));
    return {
      'totalReferrals': totalReferrals,
      'activeReferrals': activeReferrals,
      'totalEarnings': totalEarnings,
    };
  }

  Color _getStatusColor(String status) {
    return status == 'active' ? Colors.green : Colors.red;
  }

  String _getStatusLabel(String status) {
    return status == 'active' ? 'Active' : 'Inactive';
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
                        'MY REFERRALS',
                        style: AppTheme.heading2.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.w700,
                          fontSize: titleFontSize,
                          letterSpacing: 1,
                        ),
                      ),
                      SizedBox(height: spacing24),

                      // Summary Card
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
                        _buildSummaryCard(),
                        SizedBox(height: spacing24),

                        // Referrals Table
                        _buildReferralsTable(),
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

  Widget _buildSummaryCard() {
    final summary = _summary;
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 6.0);
    final summaryTitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 18.0,
      max: 24.0,
    );
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 32.0,
      min: 28.0,
      max: 40.0,
    );
    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    return Card(
      color: AppTheme.surfaceColor,
      child: Padding(
        padding: EdgeInsets.all(cardPadding),
        child: Column(
          children: [
            Text(
              'MY REFERRALS SUMMARY',
              style: AppTheme.heading3.copyWith(
                color: Colors.black,
                fontWeight: FontWeight.w700,
                fontSize: summaryTitleFontSize,
                letterSpacing: 1,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: spacing24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // Referrals Count
                Column(
                  children: [
                    Text(
                      'Referrals',
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.grey,
                        fontSize: labelFontSize,
                      ),
                    ),
                    SizedBox(height: spacing8),
                    Text(
                      summary['totalReferrals'].toString(),
                      style: AppTheme.heading2.copyWith(
                        color: Colors.black,
                        fontWeight: FontWeight.w700,
                        fontSize: valueFontSize,
                      ),
                    ),
                  ],
                ),
                // Earnings
                Column(
                  children: [
                    Text(
                      'Earnings',
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.grey,
                        fontSize: labelFontSize,
                      ),
                    ),
                    SizedBox(height: spacing8),
                    Row(
                      children: [
                        Image.asset(
                          'assets/images/currency.webp',
                          width: currencyIconSize,
                          height: currencyIconSize,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              Icons.account_balance_wallet,
                              color: AppTheme.primaryColor,
                              size: currencyIconSize,
                            );
                          },
                        ),
                        SizedBox(width: spacing4),
                        Text(
                          summary['totalEarnings'].toStringAsFixed(2),
                          style: AppTheme.heading2.copyWith(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w700,
                            fontSize: valueFontSize,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReferralsTable() {
    final tableHeaderPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final tableTitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 22.0,
    );
    final tableRowPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final tableRowPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);
    final headerFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 11.0,
      max: 14.0,
    );
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final statusFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 10.0,
      max: 12.0,
    );
    final statusPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 16.0);
    final statusPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 6.0,
    ).clamp(4.0, 8.0);

    return Card(
      color: AppTheme.surfaceColor,
      child: Column(
        children: [
          // Table Header
          Container(
            padding: EdgeInsets.all(tableHeaderPadding),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              border: Border(
                bottom: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            child: Text(
              'MY REFERRAL LIST',
              style: AppTheme.heading3.copyWith(
                color: Colors.black,
                fontWeight: FontWeight.w700,
                fontSize: tableTitleFontSize,
                letterSpacing: 1,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          // Table Content
          if (_referrals.isEmpty)
            _buildEmptyState()
          else
            Column(
              children: [
                // Table Header Row
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: tableRowPaddingH,
                    vertical: tableRowPaddingV,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    border: Border(
                      bottom: BorderSide(color: Colors.grey[300]!),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Date',
                          style: AppTheme.bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: headerFontSize,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          'Player Name',
                          style: AppTheme.bodyMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: headerFontSize,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Status',
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
                ..._referrals.map((referral) {
                  final statusColor = _getStatusColor(referral.status);
                  return Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: tableRowPaddingH,
                      vertical: tableRowPaddingV,
                    ),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.grey[200]!,
                          width: 1,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: Text(
                            _formatDateTime(referral.date),
                            style: AppTheme.bodyMedium.copyWith(
                              color: Colors.black,
                              fontSize: bodyFontSize,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Text(
                            referral.playerName,
                            style: AppTheme.bodyMedium.copyWith(
                              color: Colors.black,
                              fontWeight: FontWeight.w500,
                              fontSize: bodyFontSize,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Align(
                            alignment: Alignment.centerRight,
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: statusPaddingH,
                                vertical: statusPaddingV,
                              ),
                              decoration: BoxDecoration(
                                color: statusColor,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                _getStatusLabel(referral.status).toUpperCase(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: statusFontSize,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
        ],
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
            Icon(
              Icons.people_outline,
              size: iconSize,
              color: Colors.grey[400],
            ),
            SizedBox(height: spacing16),
            Text(
              'No Referrals Found',
              style: AppTheme.heading3.copyWith(
                fontSize: headingFontSize,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: spacing8),
            Text(
              "You haven't referred any players yet",
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

