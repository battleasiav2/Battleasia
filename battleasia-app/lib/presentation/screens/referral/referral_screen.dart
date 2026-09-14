import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/referral_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';

/// Earn / referral hub aligned with battleasia.gg referral dashboard.
class ReferralScreen extends StatefulWidget {
  final bool showInviteSection;

  const ReferralScreen({super.key, this.showInviteSection = true});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  String _activeTab = 'network';
  bool _loading = true;
  bool _copiedCode = false;
  bool _copiedLink = false;

  int _commissionRate = 10;
  int _totalReferrals = 0;
  int _activeReferrals = 0;
  double _totalEarnings = 0;
  double _totalDeposits = 0;
  int _commissionEvents = 0;

  List<ReferralItemModel> _network = [];
  List<_CommissionItem> _commissions = [];

  static const Color _panelBg = Color(0xD906090E);

  @override
  void initState() {
    super.initState();
    _fetchAll();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchAll() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _userService.getReferralSettings(),
        _userService.getReferralStats(),
        _userService.getReferrals(),
        _userService.getReferralCommissions(limit: 100),
      ]);

      final settings = results[0];
      if (settings['success'] == true) {
        _commissionRate = (settings['commissionRate'] as num?)?.toInt() ?? 10;
      }

      final stats = results[1];
      if (stats['success'] == true && stats['data'] is Map) {
        final d = stats['data'] as Map<String, dynamic>;
        _totalReferrals = (d['totalReferrals'] as num?)?.toInt() ?? 0;
        _activeReferrals = (d['activeReferrals'] as num?)?.toInt() ?? 0;
        _totalEarnings = (d['totalEarnings'] as num?)?.toDouble() ?? 0;
        _totalDeposits =
            (d['totalDepositsFromReferrals'] as num?)?.toDouble() ?? 0;
        _commissionEvents =
            (d['totalCommissionEvents'] as num?)?.toInt() ?? 0;
        _commissionRate =
            (d['commissionRate'] as num?)?.toInt() ?? _commissionRate;
      }

      final network = results[2];
      if (network['success'] == true && network['data'] is List) {
        _network = (network['data'] as List)
            .map((e) => ReferralItemModel.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        _network = [];
      }

      final commissions = results[3];
      if (commissions['success'] == true) {
        final data = commissions['data'];
        final rows = data is Map
            ? (data['results'] as List? ?? [])
            : (data is List ? data : []);
        _commissions = rows
            .map((e) => _CommissionItem.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        _commissions = [];
      }

      // Fallback stats from network if API stats empty
      if (_totalReferrals == 0 && _network.isNotEmpty) {
        _totalReferrals = _network.length;
        _activeReferrals =
            _network.where((n) => n.status == 'active').length;
        _totalEarnings = _network.fold<double>(
          0,
          (sum, n) => sum + (n.earnings ?? 0),
        );
      }
      if (_commissionEvents == 0) {
        _commissionEvents = _commissions.length;
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _copy(String value, {required bool isCode}) {
    if (value.isEmpty) return;
    Clipboard.setData(ClipboardData(text: value));
    setState(() {
      if (isCode) {
        _copiedCode = true;
      } else {
        _copiedLink = true;
      }
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        if (isCode) {
          _copiedCode = false;
        } else {
          _copiedLink = false;
        }
      });
    });
  }

  String _formatDate(String raw) {
    if (raw.isEmpty) return 'N/A';
    try {
      return DateFormat('dd/MM/yyyy hh:mm a').format(DateTime.parse(raw));
    } catch (_) {
      return raw;
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
    final user = context.watch<AuthProvider>().user;
    final code = user?.referralCode?.trim() ?? '';
    final referralUrl = code.isNotEmpty
        ? '${AppConfig.siteUrl}/auth/sign-up?ref=${Uri.encodeComponent(code)}'
        : '';
    final pad = ResponsiveUtils.isMobile(context) ? 16.0 : 24.0;
    final bottom = 80.0 + MediaQuery.of(context).padding.bottom;
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 22.0,
      min: 20.0,
      max: 26.0,
    );

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          RefreshIndicator(
            color: AppColors.gold,
            onRefresh: _fetchAll,
            child: CustomScrollView(
              controller: _scrollController,
              physics: appScrollPhysics,
              slivers: [
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: pad),
                    child: _loading
                        ? Padding(
                            padding: const EdgeInsets.all(40),
                            child: Center(
                              child: CircularProgressIndicator(
                                color: AppColors.gold,
                              ),
                            ),
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 8),
                              Text(
                                widget.showInviteSection
                                    ? 'REFER & EARN'
                                    : 'MY REFERRALS',
                                style: AppTheme.heading2.copyWith(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.w800,
                                  fontSize: titleFontSize,
                                  letterSpacing: 1,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Invite friends and earn $_commissionRate% on their deposits',
                                style: AppTheme.bodyMedium.copyWith(
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 16),
                              _buildStatsGrid(),
                              if (widget.showInviteSection) ...[
                                const SizedBox(height: 16),
                                _buildInviteCard(code, referralUrl),
                                const SizedBox(height: 16),
                                _buildHowItWorks(),
                              ],
                              const SizedBox(height: 16),
                              PlayTabs(
                                tabs: const [
                                  {'label': 'NETWORK', 'value': 'network'},
                                  {'label': 'HISTORY', 'value': 'history'},
                                ],
                                activeTab: _activeTab,
                                onTabChanged: (tab) {
                                  setState(() => _activeTab = tab);
                                },
                                fontSize: 14,
                              ),
                              const SizedBox(height: 12),
                              if (_activeTab == 'network')
                                _buildNetworkList()
                              else
                                _buildCommissionList(),
                              SizedBox(height: bottom),
                            ],
                          ),
                  ),
                ),
              ],
            ),
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

  Widget _buildStatsGrid() {
    final items = [
      _StatData('Referrals', '$_totalReferrals', Icons.groups_outlined),
      _StatData('Active', '$_activeReferrals', Icons.verified_user_outlined),
      _StatData(
        'Earnings',
        _totalEarnings.toStringAsFixed(0),
        Icons.account_balance_wallet_outlined,
      ),
      _StatData('Rate', '$_commissionRate%', Icons.percent),
      _StatData(
        'Deposits',
        _totalDeposits.toStringAsFixed(0),
        Icons.savings_outlined,
      ),
      _StatData('Events', '$_commissionEvents', Icons.receipt_long_outlined),
    ];

    return Container(
      decoration: _panelDecoration,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        padding: EdgeInsets.zero,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 0,
          crossAxisSpacing: 0,
          childAspectRatio: 2.35,
        ),
        itemBuilder: (_, i) {
          final item = items[i];
          final isRightCol = i.isOdd;
          final isBottomRow = i >= 4;
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              border: Border(
                right: !isRightCol
                    ? BorderSide(color: Colors.white.withValues(alpha: 0.08))
                    : BorderSide.none,
                bottom: !isBottomRow
                    ? BorderSide(color: Colors.white.withValues(alpha: 0.08))
                    : BorderSide.none,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    Icon(item.icon, size: 14, color: AppColors.gold),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        item.label.toUpperCase(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.white.withValues(alpha: 0.45),
                          fontWeight: FontWeight.w700,
                          fontSize: 10,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTheme.heading3.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInviteCard(String code, String link) {
    return Container(
      decoration: _panelDecoration,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'YOUR REFERRAL CODE',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.gold,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          _copyRow(
            value: code.isEmpty ? '—' : code,
            copied: _copiedCode,
            onCopy: () => _copy(code, isCode: true),
            large: true,
          ),
          const SizedBox(height: 12),
          Text(
            'YOUR REFERRAL LINK',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.gold,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          _copyRow(
            value: link.isEmpty ? 'Loading...' : link,
            copied: _copiedLink,
            onCopy: () => _copy(link, isCode: false),
          ),
        ],
      ),
    );
  }

  Widget _copyRow({
    required String value,
    required bool copied,
    required VoidCallback onCopy,
    bool large = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border(0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              value,
              style: AppTheme.bodyMedium.copyWith(
                color: AppColors.textPrimary,
                fontWeight: large ? FontWeight.w800 : FontWeight.w500,
                fontSize: large ? 20 : 12,
              ),
            ),
          ),
          IconButton(
            onPressed: onCopy,
            icon: Icon(
              copied ? Icons.check_circle : Icons.copy,
              color: AppColors.gold,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHowItWorks() {
    final steps = [
      (Icons.share_outlined, 'Share your code'),
      (Icons.person_add_alt_1_outlined, 'Friend signs up'),
      (Icons.payments_outlined, 'Earn on deposits'),
    ];

    return Container(
      decoration: _panelDecoration,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'HOW IT WORKS',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.gold,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              for (var i = 0; i < steps.length; i++) ...[
                if (i > 0)
                  Container(
                    width: 1,
                    height: 40,
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                    color: Colors.white.withValues(alpha: 0.08),
                  ),
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.12),
                          border: Border.all(
                            color: AppColors.gold.withValues(alpha: 0.45),
                          ),
                        ),
                        child: Icon(steps[i].$1, color: AppColors.gold, size: 16),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          steps[i].$2,
                          style: AppTheme.bodySmall.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkList() {
    if (_network.isEmpty) {
      return _empty('No referrals yet', 'Share your code to grow your network');
    }

    return Container(
      decoration: _panelDecoration,
      child: Column(
        children: List.generate(_network.length, (i) {
          final item = _network[i];
          final active = item.status == 'active';
          final isLast = i == _network.length - 1;
          final meta =
              'Joined ${_formatDate(item.date)} · Deposits ${item.depositCount} (${item.totalDeposits.toStringAsFixed(0)} BAC)';

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
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0A0A),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  child: Icon(Icons.person, size: 18, color: AppColors.gold),
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
                              item.playerName.toUpperCase(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTheme.bodyMedium.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            active ? 'ACTIVE' : 'INACTIVE',
                            style: TextStyle(
                              color: active
                                  ? AppColors.success
                                  : AppColors.error,
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
                      'EARNINGS',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      (item.earnings ?? 0).toStringAsFixed(0),
                      style: TextStyle(
                        color: Colors.white,
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

  Widget _buildCommissionList() {
    if (_commissions.isEmpty) {
      return _empty(
        'No commission history',
        'Earnings appear after referred deposits',
      );
    }

    return Container(
      decoration: _panelDecoration,
      child: Column(
        children: List.generate(_commissions.length, (i) {
          final item = _commissions[i];
          final isLast = i == _commissions.length - 1;
          final meta =
              '${_formatDate(item.createdAt)} · ${item.sourceLabel} · ${item.commissionRate}% · Deposit ${item.depositAmount.toStringAsFixed(0)} BAC';

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
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0A0A),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  child: Icon(
                    Icons.payments_outlined,
                    size: 18,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.playerName.toUpperCase(),
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
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '+${item.commissionAmount.toStringAsFixed(0)}',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _empty(String title, String subtitle) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 48,
              color: AppColors.textMuted.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppTheme.heading3.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatData {
  final String label;
  final String value;
  final IconData icon;

  const _StatData(this.label, this.value, this.icon);
}

class _CommissionItem {
  final String playerName;
  final double depositAmount;
  final double commissionRate;
  final double commissionAmount;
  final String depositSource;
  final String createdAt;

  const _CommissionItem({
    required this.playerName,
    required this.depositAmount,
    required this.commissionRate,
    required this.commissionAmount,
    required this.depositSource,
    required this.createdAt,
  });

  String get sourceLabel {
    if (depositSource == 'admin') return 'Admin';
    if (depositSource == 'coingo') return 'Auto';
    return 'Manual';
  }

  factory _CommissionItem.fromJson(Map<String, dynamic> json) {
    return _CommissionItem(
      playerName: json['referredUsername']?.toString() ??
          json['referredEmail']?.toString() ??
          'Unknown Player',
      depositAmount: (json['depositAmount'] as num?)?.toDouble() ?? 0,
      commissionRate: (json['commissionRate'] as num?)?.toDouble() ?? 0,
      commissionAmount: (json['commissionAmount'] as num?)?.toDouble() ?? 0,
      depositSource: json['depositSource']?.toString() ?? 'manual',
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}
