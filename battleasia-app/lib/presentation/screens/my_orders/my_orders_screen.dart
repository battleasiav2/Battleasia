import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/deposit_model.dart';
import 'package:battleasia_app/data/models/withdrawal_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:intl/intl.dart';

// Unified transaction entry that holds either a deposit or a withdrawal.
class _TxEntry {
  final bool isDeposit;
  final DepositModel? deposit;
  final WithdrawalModel? withdrawal;

  _TxEntry.fromDeposit(DepositModel d)
      : isDeposit = true,
        deposit = d,
        withdrawal = null;

  _TxEntry.fromWithdrawal(WithdrawalModel w)
      : isDeposit = false,
        deposit = null,
        withdrawal = w;

  String get id => isDeposit ? deposit!.id : withdrawal!.id;
  String get status => isDeposit ? deposit!.status : withdrawal!.status;
  DateTime? get createdAt => isDeposit ? deposit!.createdAt : withdrawal!.createdAt;
  double get coinAmount => isDeposit ? deposit!.coinAmount : withdrawal!.coinAmount;
}

class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  bool _loading = false;
  String? _errorMessage;

  List<_TxEntry> _allEntries = [];

  // Type filter: 'all' | 'deposit' | 'withdrawal'
  String _typeFilter = 'all';

  // Status filter: 'all' | 'pending' | 'processing' | 'completed' | 'rejected'
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      // Fetch both histories in parallel
      final results = await Future.wait([
        _userService.getMyDepositHistory(),
        _userService.getMyWithdrawalHistory(),
      ]);

      final depositResult = results[0];
      final withdrawalResult = results[1];

      final List<_TxEntry> entries = [];

      if (depositResult['success'] == true && depositResult['data'] != null) {
        final rawList = depositResult['data'] as List<dynamic>;
        for (final item in rawList) {
          if (item is Map<String, dynamic>) {
            entries.add(_TxEntry.fromDeposit(DepositModel.fromJson(item)));
          }
        }
      }

      if (withdrawalResult['success'] == true && withdrawalResult['data'] != null) {
        final rawList = withdrawalResult['data'] as List<dynamic>;
        for (final item in rawList) {
          if (item is Map<String, dynamic>) {
            entries.add(_TxEntry.fromWithdrawal(WithdrawalModel.fromJson(item)));
          }
        }
      }

      // Sort by createdAt descending (newest first)
      entries.sort((a, b) {
        final aDate = a.createdAt;
        final bDate = b.createdAt;
        if (aDate == null && bDate == null) return 0;
        if (aDate == null) return 1;
        if (bDate == null) return -1;
        return bDate.compareTo(aDate);
      });

      if (!mounted) return;
      setState(() {
        _allEntries = entries;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  List<_TxEntry> get _filteredEntries {
    return _allEntries.where((e) {
      final matchType = _typeFilter == 'all' ||
          (_typeFilter == 'deposit' && e.isDeposit) ||
          (_typeFilter == 'withdrawal' && !e.isDeposit);
      final matchStatus =
          _statusFilter == 'all' || e.status == _statusFilter;
      return matchType && matchStatus;
    }).toList();
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'processing':
        return Colors.blue;
      case 'pending':
        return const Color(0xFFF59E0B); // amber
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(String status) =>
      status[0].toUpperCase() + status.substring(1);

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'N/A';
    return DateFormat('dd/MM/yyyy HH:mm').format(dt.toLocal());
  }

  String _shortAddress(String address) {
    if (address.length <= 16) return address;
    return '${address.substring(0, 8)}…${address.substring(address.length - 8)}';
  }

  // ─────────────────────────────────────────────────────────
  // View Details bottom sheet
  // ─────────────────────────────────────────────────────────

  void _showDetails(_TxEntry entry) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, controller) {
          return ListView(
            controller: controller,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Title row
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: (entry.isDeposit ? Colors.green : Colors.red)
                          .withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      entry.isDeposit
                          ? Icons.arrow_downward_rounded
                          : Icons.arrow_upward_rounded,
                      color: entry.isDeposit ? Colors.green : Colors.red,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          entry.isDeposit ? 'Deposit Details' : 'Withdrawal Details',
                          style: AppTheme.heading3.copyWith(
                            color: Colors.black,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          'ID: ${entry.id}',
                          style: AppTheme.bodySmall
                              .copyWith(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor(entry.status),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _statusLabel(entry.status),
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              if (entry.isDeposit) ..._depositDetailRows(entry.deposit!)
              else ..._withdrawalDetailRows(entry.withdrawal!),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _depositDetailRows(DepositModel d) => [
        _detailRow('Transaction ID', d.transactionId),
        _detailRow('Coin Amount', '${d.coinAmount.toStringAsFixed(0)} BAC'),
        _detailRow('Currency', d.paymentCurrency),
        _detailRow('Paid Amount', d.paymentAmount.toStringAsFixed(2)),
        _detailRow('Channel', d.channelName),
        _detailRow('To Address', d.toWalletAddress),
        _detailRow('From Address', d.fromAddress),
        _detailRow('Date', _formatDate(d.createdAt)),
        if (d.processedAt != null)
          _detailRow('Processed At', _formatDate(d.processedAt)),
        if (d.processedBy != null)
          _detailRow('Processed By', d.processedBy!),
        if (d.rejectionReason != null)
          _detailRow('Rejection Reason', d.rejectionReason!, valueColor: Colors.red),
        if (d.notes != null && d.notes!.isNotEmpty)
          _detailRow('Notes', d.notes!),
      ];

  List<Widget> _withdrawalDetailRows(WithdrawalModel w) => [
        _detailRow('Coin Amount', '${w.coinAmount.toStringAsFixed(0)} BAC'),
        _detailRow('Wallet Type', w.walletType),
        _detailRow('Wallet Address', w.walletAddress),
        _detailRow('Currency', w.currencyType),
        _detailRow('Payout Amount', w.currencyAmount.toStringAsFixed(2)),
        if (w.description != null && w.description!.isNotEmpty)
          _detailRow('Description', w.description!),
        _detailRow('Date', _formatDate(w.createdAt)),
        if (w.processedAt != null)
          _detailRow('Processed At', _formatDate(w.processedAt)),
        if (w.processedBy != null)
          _detailRow('Processed By', w.processedBy!),
        if (w.transactionHash != null && w.transactionHash!.isNotEmpty)
          _detailRow('Tx Hash', w.transactionHash!),
        if (w.rejectionReason != null)
          _detailRow('Rejection Reason', w.rejectionReason!, valueColor: Colors.red),
        if (w.notes != null && w.notes!.isNotEmpty)
          _detailRow('Notes', w.notes!),
      ];

  Widget _detailRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTheme.bodySmall.copyWith(color: Colors.grey[600]),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: AppTheme.bodyMedium.copyWith(
                color: valueColor ?? Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // Build
  // ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final horizontalPadding = isMobile ? 16.0 : 24.0;
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );
    final spacing16 =
        ResponsiveUtils.getResponsiveSpacing(context, baseSize: 16.0)
            .clamp(12.0, 20.0);
    final spacing24 =
        ResponsiveUtils.getResponsiveSpacing(context, baseSize: 24.0)
            .clamp(20.0, 32.0);

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
                  padding:
                      EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: spacing16),

                      // ── Page title + refresh ─────────────────────────────
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'My Orders',
                            style: AppTheme.heading2.copyWith(
                              color: Colors.black,
                              fontWeight: FontWeight.w700,
                              fontSize: titleFontSize,
                            ),
                          ),
                          IconButton(
                            onPressed: _loading ? null : _loadTransactions,
                            icon: _loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Icon(Icons.refresh),
                            color: AppTheme.primaryColor,
                            tooltip: 'Refresh',
                          ),
                        ],
                      ),
                      SizedBox(height: spacing16),

                      // ── Type filter tabs ─────────────────────────────────
                      _buildTypeTabs(),
                      SizedBox(height: spacing16),

                      // ── Status filter tabs ───────────────────────────────
                      _buildStatusTabs(),
                      SizedBox(height: spacing24),

                      // ── Content ───────────────────────────────────────────────────
                      if (_loading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 48),
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (_errorMessage != null)
                        _buildErrorState()
                      else if (_filteredEntries.isEmpty)
                        _buildEmptyState()
                      else
                        ..._filteredEntries.map(_buildTxCard),

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

          // Bottom menu
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  // ── Type filter tabs ──────────────────────────────────────────────────────────────

  Widget _buildTypeTabs() {
    final tabs = [
      {'label': 'All', 'value': 'all'},
      {'label': 'Deposit', 'value': 'deposit'},
      {'label': 'Withdrawal', 'value': 'withdrawal'},
    ];
    final counts = {
      'all': _allEntries.length,
      'deposit': _allEntries.where((e) => e.isDeposit).length,
      'withdrawal': _allEntries.where((e) => !e.isDeposit).length,
    };
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isActive = _typeFilter == tab['value'];
          final count = counts[tab['value']] ?? 0;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _typeFilter = tab['value']!),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.surfaceColor : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: isActive
                      ? [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          )
                        ]
                      : [],
                ),
                child: Column(
                  children: [
                    Icon(
                      tab['value'] == 'deposit'
                          ? Icons.arrow_downward_rounded
                          : tab['value'] == 'withdrawal'
                              ? Icons.arrow_upward_rounded
                              : Icons.swap_vert_rounded,
                      size: 18,
                      color: isActive
                          ? (tab['value'] == 'deposit'
                              ? Colors.green
                              : tab['value'] == 'withdrawal'
                                  ? Colors.red
                                  : AppTheme.primaryColor)
                          : Colors.grey,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tab['label']!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight:
                            isActive ? FontWeight.bold : FontWeight.normal,
                        color: isActive
                            ? AppTheme.textPrimary
                            : AppTheme.textSecondary,
                      ),
                    ),
                    if (count > 0)
                      Text(
                        '$count',
                        style: TextStyle(
                          fontSize: 10,
                          color: isActive ? AppTheme.primaryColor : Colors.grey,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Status filter scrollable ────────────────────────────────────────────────────

  Widget _buildStatusTabs() {
    final List<Map<String, String>> statusTabs = [
      {'label': 'All', 'value': 'all'},
      {'label': 'Pending', 'value': 'pending'},
      {'label': 'Processing', 'value': 'processing'},
      {'label': 'Completed', 'value': 'completed'},
      {'label': 'Rejected', 'value': 'rejected'},
    ];
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: AppTheme.textSecondary.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: statusTabs.map((tab) {
            final isActive = _statusFilter == tab['value'];
            final count = _allEntries.where((e) {
              final matchType = _typeFilter == 'all' ||
                  (_typeFilter == 'deposit' && e.isDeposit) ||
                  (_typeFilter == 'withdrawal' && !e.isDeposit);
              return matchType &&
                  (tab['value'] == 'all' || e.status == tab['value']);
            }).length;
            return InkWell(
              onTap: () => setState(() => _statusFilter = tab['value']!),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isActive
                      ? AppTheme.surfaceColor
                      : Colors.transparent,
                  border: isActive
                      ? const Border(
                          bottom: BorderSide(
                            color: AppTheme.accentColor,
                            width: 2,
                          ),
                        )
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      tab['label']!,
                      style: AppTheme.bodyLarge.copyWith(
                        color: isActive
                            ? AppTheme.textPrimary
                            : AppTheme.textSecondary,
                        fontWeight:
                            isActive ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    if (count > 0) ...[  
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppTheme.primaryColor.withOpacity(0.15)
                              : Colors.grey[200],
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$count',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isActive
                                ? AppTheme.primaryColor
                                : Colors.grey[600],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── Transaction card ──────────────────────────────────────────────────────────────

  Widget _buildTxCard(_TxEntry entry) {
    final bool isDeposit = entry.isDeposit;
    final Color typeColor = isDeposit ? Colors.green : Colors.red;
    final IconData typeIcon = isDeposit
        ? Icons.arrow_downward_rounded
        : Icons.arrow_upward_rounded;
    final String typeLabel = isDeposit ? 'Deposit' : 'Withdrawal';
    final String subtitle = isDeposit
        ? entry.deposit!.channelName
        : entry.withdrawal!.walletType;
    final String amountDetail = isDeposit
        ? '${entry.deposit!.paymentCurrency} ${entry.deposit!.paymentAmount.toStringAsFixed(2)}'
        : '${entry.withdrawal!.currencyType} ${entry.withdrawal!.currencyAmount.toStringAsFixed(2)}';
    final String reference = isDeposit
        ? 'TX: ${_shortAddress(entry.deposit!.transactionId)}'
        : 'Wallet: ${_shortAddress(entry.withdrawal!.walletAddress)}';
    final statusColor = _statusColor(entry.status);

    return Card(
      color: AppTheme.surfaceColor,
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: typeColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(typeIcon, color: typeColor, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        typeLabel,
                        style: AppTheme.heading3.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style:
                            AppTheme.bodySmall.copyWith(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _formatDate(entry.createdAt),
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.grey[500],
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: statusColor,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    _statusLabel(entry.status),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Divider(color: Colors.grey[200], height: 1),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Image.asset(
                            'assets/images/currency.webp',
                            width: 20,
                            height: 20,
                            errorBuilder: (_, __, ___) =>
                                const SizedBox.shrink(),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${entry.coinAmount.toStringAsFixed(0)} BAC',
                            style: AppTheme.heading3.copyWith(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 20,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        amountDetail,
                        style: AppTheme.bodySmall.copyWith(
                            color: Colors.grey[600], fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        reference,
                        style: AppTheme.bodySmall.copyWith(
                            color: Colors.grey[500], fontSize: 11),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: () => _showDetails(entry),
                  icon: const Icon(Icons.remove_red_eye, size: 16),
                  label: const Text('View Details',
                      style: TextStyle(fontSize: 13)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryColor,
                    side: BorderSide(color: AppTheme.primaryColor),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Empty / error states ──────────────────────────────────────────────────────

  Widget _buildEmptyState() {
    final String message;
    final IconData icon;
    if (_typeFilter == 'deposit') {
      icon = Icons.arrow_downward_rounded;
      message = _statusFilter == 'all'
          ? 'No deposit history found.'
          : 'No $_statusFilter deposits found.';
    } else if (_typeFilter == 'withdrawal') {
      icon = Icons.arrow_upward_rounded;
      message = _statusFilter == 'all'
          ? 'No withdrawal history found.'
          : 'No $_statusFilter withdrawals found.';
    } else {
      icon = Icons.swap_vert_rounded;
      message = _statusFilter == 'all'
          ? 'No transaction history found.'
          : 'No $_statusFilter transactions found.';
    }
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(icon, size: 60, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'No transactions found',
              style: AppTheme.heading3
                  .copyWith(fontSize: 18, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: AppTheme.bodyMedium
                  .copyWith(fontSize: 14, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(Icons.error_outline, size: 60, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Failed to load data',
              style: AppTheme.heading3
                  .copyWith(fontSize: 18, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Unknown error',
              style: AppTheme.bodyMedium
                  .copyWith(fontSize: 13, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _loadTransactions,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
