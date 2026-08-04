import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/constants/withdrawal_channels.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/socket_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/balance_history_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_section_nav.dart';

class WalletScreen extends StatefulWidget {
  /// When opened from the store section tabs (Shop / Wallet / Withdraw).
  final bool fromShop;

  const WalletScreen({super.key, this.fromShop = false});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  List<BalanceHistoryModel> _transactions = [];
  bool _loading = true;
  double _withdrawableAmount = 0.0;
  bool _hasPendingWithdrawal = false;
  double _pendingWithdrawalAmount = 0.0;

  // Withdrawal modal state
  List<Map<String, dynamic>> _currencyRates = [];


  @override
  void initState() {
    super.initState();
    _fetchBalanceHistory();
    _fetchWithdrawableAmount();
    _fetchCurrencyRates();
    _subscribeToBalanceUpdates();
  }

  @override
  void dispose() {
    SocketService.instance.offBalanceUpdated(_onBalanceUpdated);
    _scrollController.dispose();
    super.dispose();
  }

  /// Called whenever the backend emits `balance-updated` for this user.
  /// Refreshes balance history + withdrawable amount so the wallet screen
  /// reflects the deduction instantly after admin approval.
  void _onBalanceUpdated({
    required double balance,
    required double added,
    required double previousBalance,
  }) {
    if (!mounted) return;

    // Update the shared AuthProvider so the header coin display also refreshes.
    Provider.of<AuthProvider>(context, listen: false)
        .updateBalance(balance, delta: added);

    // ── Optimistic UI update ──────────────────────────────────────────────
    // A negative `added` means a withdrawal was approved (coins deducted).
    // Clear the pending-withdrawal flag immediately so the "Pending withdrawal"
    // label and disabled WITHDRAW button disappear right away — before the
    // API round-trip for _fetchWithdrawableAmount completes.
    if (added < 0 && _hasPendingWithdrawal) {
      setState(() {
        _hasPendingWithdrawal = false;
        _pendingWithdrawalAmount = 0.0;
      });
    }
    // A positive `added` means a deposit/refund was approved — the pending
    // state is already false in that case, nothing to clear.

    // Re-fetch history and withdrawable amount to get accurate server values.
    _fetchBalanceHistory();
    _fetchWithdrawableAmount();

    final isGain = added >= 0;
    final absAdded = added.abs().toStringAsFixed(0);
    final message = isGain
        ? 'Coins received: +$absAdded BAC → Balance: ${balance.toStringAsFixed(2)} BAC'
        : 'Coins deducted: -$absAdded BAC → Balance: ${balance.toStringAsFixed(2)} BAC';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isGain ? Icons.arrow_upward : Icons.arrow_downward,
              color: Colors.white,
              size: 16,
            ),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: isGain ? Colors.green : Colors.red,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  void _subscribeToBalanceUpdates() {
    SocketService.instance.onBalanceUpdated(_onBalanceUpdated);
  }

  Future<void> _fetchBalanceHistory() async {
    setState(() {
      _loading = true;
    });

    try {
      final result = await _userService.getBalanceHistory(page: 1, limit: 100);
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final results = data['results'] as List<dynamic>? ?? [];

        setState(() {
          _transactions = results
              .map(
                (item) =>
                    BalanceHistoryModel.fromJson(item as Map<String, dynamic>),
              )
              .toList();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load wallet history: ${e.toString()}'),
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

  Future<void> _fetchWithdrawableAmount() async {
    try {
      final result = await _userService.getWithdrawableAmount();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        if (mounted) {
          setState(() {
            _withdrawableAmount =
                (data['withdrawableAmount'] as num?)?.toDouble() ?? 0.0;
            _hasPendingWithdrawal =
                data['hasPendingWithdrawal'] as bool? ?? false;
            _pendingWithdrawalAmount =
                (data['pendingWithdrawalAmount'] as num?)?.toDouble() ?? 0.0;
          });
        }
      }
    } catch (_) {
      // Silently fail — withdrawable amount will remain 0.0
    }
  }

  Future<void> _fetchCurrencyRates() async {
    try {
      final result = await _userService.getCurrencyRates();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'];
        if (data is List && mounted) {
          setState(() {
            _currencyRates = data
                .map<Map<String, dynamic>>(
                  (item) => {
                    'currency': item['currency']?.toString() ?? '',
                    'rate': (item['rate'] as num?)?.toDouble() ?? 0.0,
                    'region': item['region']?.toString() ?? '',
                  },
                )
                .where((item) => item['currency'].toString().isNotEmpty)
                .toList();
          });
        }
      }
    } catch (_) {
      // Silently fail
    }
  }

  static const List<WithdrawalChannel> _paymentOptions = kWithdrawalChannels;

  static const List<Map<String, String>> _currencyOptions = [
    {'value': 'BDT', 'label': 'Bangladeshi Taka (BDT)'},
    {'value': 'INR', 'label': 'Indian Rupee (INR)'},
    {'value': 'PKR', 'label': 'Pakistani Rupee (PKR)'},
    {'value': 'USD', 'label': 'US Dollar (USD)'},
  ];

  void _showWithdrawalModal(BuildContext context, double availableBalance) {
    final coinAmountController = TextEditingController();
    final walletAddressController = TextEditingController();
    // Capture parent context for SnackBar
    final parentContext = context;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        String selectedCurrency = 'BDT';
        String selectedPaymentChannel = '';
        bool isSubmitting = false;

        return StatefulBuilder(
          builder: (sbContext, setModalState) {
            final maxWithdrawable =
                _hasPendingWithdrawal ? 0.0 : _withdrawableAmount;

            double calcAmount() {
              final coins = double.tryParse(coinAmountController.text) ?? 0.0;
              final rateEntry = _currencyRates.firstWhere(
                (r) => r['currency'] == selectedCurrency,
                orElse: () => {'rate': 0.0},
              );
              return coins *
                  ((rateEntry['rate'] as num?)?.toDouble() ?? 0.0);
            }

            Future<void> handleSubmit() async {
              final coinStr = coinAmountController.text.trim();
              final coins = double.tryParse(coinStr) ?? 0.0;

              // Validation
              if (coins <= 0) {
                ScaffoldMessenger.of(parentContext).showSnackBar(
                  const SnackBar(
                    content: Text('Please enter a valid coin amount'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              if (selectedPaymentChannel.isEmpty) {
                ScaffoldMessenger.of(parentContext).showSnackBar(
                  const SnackBar(
                    content: Text('Please select a payment channel'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              if (walletAddressController.text.trim().isEmpty) {
                ScaffoldMessenger.of(parentContext).showSnackBar(
                  const SnackBar(
                    content: Text('Please enter a wallet address'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              if (coins > maxWithdrawable) {
                ScaffoldMessenger.of(parentContext).showSnackBar(
                  SnackBar(
                    content: Text(
                        'Exceeds withdrawable amount. Maximum: ${maxWithdrawable.toStringAsFixed(2)} BAC'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }

              setModalState(() => isSubmitting = true);

              try {
                final authProvider =
                    Provider.of<AuthProvider>(parentContext, listen: false);
                final user = authProvider.user;
                if (user == null) return;

                final result = await _userService.submitWithdrawal(
                  userEmail: user.email,
                  username: user.username,
                  coinAmount: coins,
                  walletType: selectedPaymentChannel,
                  walletAddress: walletAddressController.text.trim(),
                  currencyType: selectedCurrency,
                  currencyAmount: calcAmount(),
                  description:
                      'Withdrawal: ${coins.toStringAsFixed(2)} BAC to $selectedCurrency',
                );

                if (result['success'] == true) {
                  // Close modal first
                  if (sbContext.mounted) Navigator.pop(sbContext);
                  // Show success
                  if (parentContext.mounted) {
                    ScaffoldMessenger.of(parentContext).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Withdrawal request submitted successfully'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                  // Refresh wallet data
                  await Future.wait([
                    _fetchBalanceHistory(),
                    _fetchWithdrawableAmount(),
                  ]);
                } else {
                  if (sbContext.mounted) {
                    setModalState(() => isSubmitting = false);
                  }
                  if (parentContext.mounted) {
                    ScaffoldMessenger.of(parentContext).showSnackBar(
                      SnackBar(
                        content: Text(result['message']?.toString() ??
                            'Failed to submit withdrawal'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              } catch (e) {
                if (sbContext.mounted) {
                  setModalState(() => isSubmitting = false);
                }
                if (parentContext.mounted) {
                  ScaffoldMessenger.of(parentContext).showSnackBar(
                    SnackBar(
                      content: Text('Error: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            }

            return DraggableScrollableSheet(
              initialChildSize: 0.92,
              minChildSize: 0.5,
              maxChildSize: 0.95,
              builder: (_, scrollController) {
                return Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(
                    children: [
                      // Handle bar
                      Container(
                        margin: const EdgeInsets.only(top: 12),
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      // Header
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                        child: Row(
                          children: [
                            const Icon(Icons.swap_horiz,
                                color: Colors.orange, size: 22),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Request Withdrawal',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: isSubmitting
                                  ? null
                                  : () => Navigator.pop(sbContext),
                              icon: const Icon(Icons.close,
                                  color: Colors.black54),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      // Scrollable content
                      Expanded(
                        child: SingleChildScrollView(
                          controller: scrollController,
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Balance info card
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade50,
                                  borderRadius: BorderRadius.circular(12),
                                  border:
                                      Border.all(color: Colors.grey.shade200),
                                ),
                                child: Column(
                                  children: [
                                    _buildModalBalanceRow(
                                      'Available Balance',
                                      availableBalance,
                                      valueColor: Colors.orange.shade700,
                                    ),
                                    const SizedBox(height: 12),
                                    const Divider(height: 1),
                                    const SizedBox(height: 12),
                                    _buildModalBalanceRow(
                                      'Withdrawable Amount',
                                      maxWithdrawable,
                                      valueColor: _hasPendingWithdrawal
                                          ? Colors.black38
                                          : Colors.orange.shade700,
                                    ),
                                    if (_hasPendingWithdrawal) ...[
                                      const SizedBox(height: 6),
                                      Text(
                                        'Pending withdrawal: ${_pendingWithdrawalAmount.toStringAsFixed(2)} BAC',
                                        style: const TextStyle(
                                          color: Colors.red,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Select Currency
                              const Text(
                                'Select Currency',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black54,
                                ),
                              ),
                              const SizedBox(height: 8),
                              DropdownButtonFormField<String>(
                                value: selectedCurrency,
                                isExpanded: true,
                                decoration: InputDecoration(
                                  contentPadding:
                                      const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  hintText:
                                      'Choose the currency for withdrawal',
                                  hintStyle: const TextStyle(
                                      color: Colors.black38, fontSize: 13),
                                ),
                                items: _currencyOptions
                                    .map(
                                      (c) => DropdownMenuItem<String>(
                                        value: c['value'],
                                        child: Text(c['label']!),
                                      ),
                                    )
                                    .toList(),
                                onChanged: isSubmitting
                                    ? null
                                    : (v) {
                                        if (v != null) {
                                          setModalState(
                                              () => selectedCurrency = v);
                                        }
                                      },
                              ),
                              const SizedBox(height: 20),

                              // Coin Amount
                              const Text(
                                'Coin Amount (BAC)',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black54,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: coinAmountController,
                                enabled: !isSubmitting,
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                        decimal: true),
                                onChanged: (_) => setModalState(() {}),
                                decoration: InputDecoration(
                                  hintText: 'Enter amount in BAC',
                                  hintStyle: const TextStyle(
                                      color: Colors.black38, fontSize: 13),
                                  prefixIcon: Padding(
                                    padding: const EdgeInsets.all(10),
                                    child: Image.asset(
                                      'assets/images/currency.webp',
                                      width: 20,
                                      height: 20,
                                      errorBuilder: (_, __, ___) =>
                                          const Icon(
                                        Icons.monetization_on,
                                        color: Colors.orange,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                  helperText:
                                      'Maximum: ${maxWithdrawable.toStringAsFixed(2)} BAC',
                                  helperStyle: const TextStyle(
                                      color: Colors.black38, fontSize: 11),
                                  errorText: () {
                                    final v = double.tryParse(
                                        coinAmountController.text);
                                    if (v != null && v > maxWithdrawable) {
                                      return 'Exceeds withdrawable amount';
                                    }
                                    return null;
                                  }(),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: AppTheme.primaryColor,
                                        width: 1.5),
                                  ),
                                ),
                              ),

                              // Converted amount display
                              if ((double.tryParse(
                                              coinAmountController.text) ??
                                          0.0) >
                                      0 &&
                                  calcAmount() > 0) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                        color: Colors.green.shade200),
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Estimated $selectedCurrency',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: Colors.black54,
                                        ),
                                      ),
                                      Text(
                                        '${calcAmount().toStringAsFixed(2)} $selectedCurrency',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.green.shade700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              const SizedBox(height: 20),

                              // Payment Channel
                              const Text(
                                'Payment Channel',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black54,
                                ),
                              ),
                              const SizedBox(height: 8),
                              DropdownButtonFormField<String>(
                                value: selectedPaymentChannel.isEmpty
                                    ? null
                                    : selectedPaymentChannel,
                                isExpanded: true,
                                decoration: InputDecoration(
                                  contentPadding:
                                      const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  hintText:
                                      'Select your preferred payment method',
                                  hintStyle: const TextStyle(
                                      color: Colors.black38, fontSize: 13),
                                ),
                                items: _paymentOptions
                                    .map(
                                      (p) => DropdownMenuItem<String>(
                                        value: p.value,
                                        child: Text('${p.label} (${p.currency})'),
                                      ),
                                    )
                                    .toList(),
                                onChanged: isSubmitting
                                    ? null
                                    : (v) {
                                        if (v != null) {
                                          final channel =
                                              _paymentOptions.firstWhere(
                                            (c) => c.value == v,
                                          );
                                          setModalState(() {
                                            selectedPaymentChannel = v;
                                            selectedCurrency = channel.currency;
                                          });
                                        }
                                      },
                              ),
                              const SizedBox(height: 20),

                              // Wallet Address
                              const Text(
                                'Wallet Address',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black54,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: walletAddressController,
                                enabled: !isSubmitting,
                                onChanged: (_) => setModalState(() {}),
                                decoration: InputDecoration(
                                  hintText:
                                      'Enter the destination address for receiving funds',
                                  hintStyle: const TextStyle(
                                      color: Colors.black38, fontSize: 13),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: Colors.grey.shade300),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    borderSide: BorderSide(
                                        color: AppTheme.primaryColor,
                                        width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 32),
                            ],
                          ),
                        ),
                      ),
                      // Action buttons
                      SafeArea(
                        top: false,
                        child: Padding(
                          padding:
                              const EdgeInsets.fromLTRB(20, 8, 20, 16),
                          child: Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: isSubmitting
                                      ? null
                                      : () => Navigator.pop(sbContext),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 14),
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: const Text('Cancel'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed:
                                      isSubmitting ? null : handleSubmit,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primaryColor,
                                    foregroundColor: Colors.white,
                                    disabledBackgroundColor:
                                        Colors.grey.shade300,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 14),
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: isSubmitting
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      : const Text(
                                          'Continue',
                                          style: TextStyle(
                                              fontWeight: FontWeight.w700),
                                        ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    ).whenComplete(() {
      coinAmountController.dispose();
      walletAddressController.dispose();
    });
  }

  Widget _buildModalBalanceRow(String label, double amount,
      {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: Colors.black54),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/currency.webp',
              width: 18,
              height: 18,
              errorBuilder: (_, __, ___) => Icon(
                Icons.monetization_on,
                color: AppTheme.primaryColor,
                size: 18,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              '${amount.toStringAsFixed(2)} BAC',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: valueColor ?? AppTheme.primaryColor,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Map<String, dynamic> _calculateWalletData(
    List<BalanceHistoryModel> transactions,
    double? balance,
  ) {
    final deposits = transactions.where((t) => t.type == 'deposit' || t.type == 'earning').toList();
    final withdraws = transactions.where((t) => t.type == 'withdraw').toList();

    // Total deposit: sum of all deposit/earning transactions
    final totalDeposit = deposits.fold<double>(
      0.0,
      (sum, t) => sum + t.amount,
    );

    // Total join: withdraws for match entry fees
    final totalJoin = withdraws
        .where(
          (t) =>
              t.detail['reason'] == 'match_entry_fee' ||
              (t.detail['matchId'] != null &&
                  t.detail['reason'] != 'withdrawal_approved'),
        )
        .fold<double>(0.0, (sum, t) => sum + t.amount);

    // Total withdrawal: approved withdrawal transactions
    final totalWithdrawal = withdraws
        .where((t) => t.detail['reason'] == 'withdrawal_approved')
        .fold<double>(0.0, (sum, t) => sum + t.amount);

    return {
      'totalBalance': balance ?? 0.0,
      'totalDeposit': totalDeposit,
      'totalJoin': totalJoin,
      'totalWithdrawal': totalWithdrawal,
    };
  }

  String _getTransactionTitle(BalanceHistoryModel transaction) {
    final detail = transaction.detail;
    final reason = detail['reason']?.toString();
    final matchName = detail['matchName']?.toString();

    if (reason == 'match_entry_fee') {
      return matchName != null ? 'Match Joined - $matchName' : 'Match Entry Fee';
    }
    if (reason == 'match_result_update') {
      return matchName != null ? 'Match Earning - $matchName' : 'Match Earning';
    }
    if (reason == 'match_winnings') {
      return matchName != null ? 'Match Winning - $matchName' : 'Match Winning';
    }
    if (reason == 'match_reward') {
      return matchName != null ? 'Match Reward - $matchName' : 'Match Reward';
    }
    if (reason == 'match_cancelled_refund') {
      return matchName != null ? 'Match Refund - $matchName' : 'Match Refund';
    }
    if (reason == 'withdrawal_approved') {
      return 'Withdrawal';
    }
    if (reason == 'withdrawal_rejected_refund') {
      return 'Withdrawal Refund';
    }
    if (reason == 'referral_bonus') {
      return 'Referral Bonus';
    }
    if (detail['note'] != null) {
      return detail['note'].toString();
    }
    if (transaction.type == 'earning') return 'Earning';
    return transaction.type == 'deposit' ? 'Deposit' : 'Withdrawal';
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    try {
      final months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return '${months[date.month - 1]} ${date.day}, ${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'N/A';
    }
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

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      final user = authProvider.user;

                      if (user == null) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final walletData = _calculateWalletData(
                        _transactions,
                        user.balance,
                      );

                      return Column(
                        children: [
                          SizedBox(height: spacing16),
                          if (widget.fromShop) ...[
                            const ShopSectionNav(
                              current: ShopSectionTab.wallet,
                            ),
                            SizedBox(height: spacing16),
                          ],
                          // Main Balance Card
                          _buildBalanceCard(context, walletData),
                          SizedBox(height: spacing24),

                          // Transaction History
                          _buildTransactionHistory(context),
                          SizedBox(height: spacing24),
                        ],
                      );
                    },
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

  Widget _buildBalanceCard(
    BuildContext context,
    Map<String, dynamic> walletData,
  ) {
    // Responsive sizes
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 24.0);

    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(28.0, 32.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 16.0,
      max: 24.0,
    );

    final balanceFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 32.0,
      min: 24.0,
      max: 36.0,
    );

    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final buttonPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    return Card(
      color: AppTheme.surfaceColor,
      child: Padding(
        padding: EdgeInsets.all(cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Total Balance
            Row(
              children: [
                Icon(
                  Icons.account_balance_wallet,
                  color: AppTheme.primaryColor,
                  size: iconSize,
                ),
                SizedBox(width: spacing8),
                Text(
                  'Total Balance',
                  style: AppTheme.heading3.copyWith(
                    color: Colors.black,
                    fontWeight: FontWeight.w500,
                    fontSize: titleFontSize,
                  ),
                ),
              ],
            ),
            SizedBox(height: spacing16),
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
                SizedBox(width: spacing8),
                Flexible(
                  child: Text(
                    walletData['totalBalance'].toStringAsFixed(2),
                    style: AppTheme.heading2.copyWith(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w700,
                      fontSize: balanceFontSize,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            SizedBox(height: spacing24),

            // Balance Breakdown
            Row(
              children: [
                Expanded(
                  child: _buildBreakdownItem(
                    context,
                    'Total Deposit',
                    walletData['totalDeposit'].toStringAsFixed(2),
                  ),
                ),
                SizedBox(width: spacing8),
                Expanded(
                  child: _buildBreakdownItem(
                    context,
                    'Total Join',
                    walletData['totalJoin'].toStringAsFixed(2),
                  ),
                ),
              ],
            ),
            SizedBox(height: spacing12),
            Row(
              children: [
                Expanded(
                  child: _buildBreakdownItem(
                    context,
                    'Total Withdrawal',
                    walletData['totalWithdrawal'].toStringAsFixed(2),
                  ),
                ),
                SizedBox(width: spacing8),
                Expanded(
                  child: _buildBreakdownItem(
                    context,
                    'Withdrawable',
                    _hasPendingWithdrawal
                        ? '0.00'
                        : _withdrawableAmount.toStringAsFixed(2),
                    valueColor: _hasPendingWithdrawal
                        ? Colors.black38
                        : Colors.orange.shade700,
                  ),
                ),
              ],
            ),
            if (_hasPendingWithdrawal) ...[
              SizedBox(height: spacing8),
              Text(
                'Pending withdrawal: ${_pendingWithdrawalAmount.toStringAsFixed(2)} BAC',
                style: AppTheme.bodySmall.copyWith(
                  color: Colors.red,
                  fontSize: 11.0,
                ),
              ),
            ] else ...[
              SizedBox(height: spacing8),
              Text(
                '* Min(Total match bets × 70% - Already withdrawn, Current balance)',
                style: AppTheme.bodySmall.copyWith(
                  color: Colors.black38,
                  fontSize: 10.0,
                ),
              ),
            ],
            SizedBox(height: spacing24),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _hasPendingWithdrawal
                        ? null
                        : () => _showWithdrawalModal(
                              context,
                              walletData['totalBalance'] as double,
                            ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey.shade300,
                      padding: EdgeInsets.symmetric(vertical: buttonPadding),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                    ),
                    child: Text(
                      'WITHDRAW',
                      style: TextStyle(
                          fontSize: buttonFontSize,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBreakdownItem(BuildContext context, String label, String value, {Color? valueColor}) {
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(14.0, 16.0);

    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTheme.bodySmall.copyWith(
            color: Colors.black54,
            fontSize: labelFontSize,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        SizedBox(height: spacing4),
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
            Flexible(
              child: Text(
                value,
                style: AppTheme.bodyMedium.copyWith(
                  color: valueColor ?? Colors.black,
                  fontWeight: FontWeight.w600,
                  fontSize: valueFontSize,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTransactionHistory(BuildContext context) {
    // Responsive sizes
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final emptyStatePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 32.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 28.0,
    );

    final emptyStateFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Wallet History',
          style: AppTheme.heading2.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.w700,
            fontSize: titleFontSize,
          ),
        ),
        SizedBox(height: spacing16),
        if (_loading)
          Center(
            child: Padding(
              padding: EdgeInsets.all(emptyStatePadding),
              child: const CircularProgressIndicator(),
            ),
          )
        else if (_transactions.isEmpty)
          Center(
            child: Padding(
              padding: EdgeInsets.all(emptyStatePadding),
              child: Text(
                'No transaction history found',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.grey,
                  fontSize: emptyStateFontSize,
                ),
              ),
            ),
          )
        else
          ..._transactions.map(
            (transaction) => _buildTransactionCard(context, transaction),
          ),
      ],
    );
  }

  /// Returns label + color for the Type badge (matches shop frontend logic)
  Map<String, dynamic> _getTransactionTypeBadge(BalanceHistoryModel transaction) {
    final detail = transaction.detail;
    final reason = detail['reason']?.toString();

    // Default
    String label = transaction.type == 'withdraw' ? 'Betting' : 'Earning';
    Color color = transaction.type == 'withdraw' ? Colors.blue : Colors.green;

    if (reason == 'match_entry_fee') {
      label = 'Betting';
      color = Colors.blue;
    } else if (reason == 'match_winnings' ||
        reason == 'match_result_update' ||
        reason == 'match_winner_refund_return' ||
        reason == 'match_reward') {
      label = 'Earning';
      color = Colors.red;
    } else if (reason == 'withdrawal_approved') {
      label = 'Withdrawal';
      color = Colors.orange;
    } else if (reason == 'withdrawal_rejected_refund') {
      label = 'Refund';
      color = Colors.blue;
    } else if (detail['deposit_id'] != null) {
      label = 'Deposit';
      color = Colors.green;
    } else if (reason == 'referral_bonus') {
      label = 'Referral';
      color = Colors.green;
    }

    return {'label': label, 'color': color};
  }

  /// Returns label + color for the Status badge
  Map<String, dynamic> _getTransactionStatusBadge(BalanceHistoryModel transaction) {
    final status = transaction.status.isEmpty ? 'completed' : transaction.status;

    switch (status) {
      case 'pending':
        return {'label': 'Pending', 'color': Colors.orange};
      case 'processing':
        return {'label': 'Processing', 'color': Colors.blue};
      case 'rejected':
      case 'failed':
        return {'label': 'Failed', 'color': Colors.red};
      default:
        return {'label': 'Completed', 'color': Colors.green};
    }
  }

  Widget _buildTransactionCard(
    BuildContext context,
    BalanceHistoryModel transaction,
  ) {
    final isWithdraw = transaction.type == 'withdraw';
    final amountColor = isWithdraw ? Colors.red : Colors.green;

    final typeBadge = _getTransactionTypeBadge(transaction);
    final statusBadge = _getTransactionStatusBadge(transaction);

    // Responsive sizes
    final cardMargin = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

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

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final dateFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final chipFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 10.0,
      max: 12.0,
    );

    final chipPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final chipPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 3.0,
    ).clamp(2.0, 3.0);

    final amountFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final balanceFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(14.0, 16.0);

    return Card(
      color: AppTheme.surfaceColor,
      margin: EdgeInsets.only(bottom: cardMargin),
      child: Padding(
        padding: EdgeInsets.all(cardPadding),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getTransactionTitle(transaction),
                    style: AppTheme.bodyMedium.copyWith(
                      color: Colors.black,
                      fontWeight: FontWeight.w600,
                      fontSize: titleFontSize,
                    ),
                  ),
                  SizedBox(height: spacing4),
                  Text(
                    _formatDate(transaction.createdAt),
                    style: AppTheme.bodySmall.copyWith(
                      color: Colors.grey,
                      fontSize: dateFontSize,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Type badge + Status badge in a row
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Type badge (Withdrawal / Deposit / Betting / Earning / Refund / Referral)
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: chipPaddingH,
                        vertical: chipPaddingV,
                      ),
                      decoration: BoxDecoration(
                        color: typeBadge['color'] as Color,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        typeBadge['label'] as String,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: chipFontSize,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    SizedBox(width: spacing6),
                    // Status badge (Completed / Pending / Processing / Failed) - outlined style
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: chipPaddingH,
                        vertical: chipPaddingV,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: statusBadge['color'] as Color,
                          width: 1.0,
                        ),
                      ),
                      child: Text(
                        statusBadge['label'] as String,
                        style: TextStyle(
                          color: statusBadge['color'] as Color,
                          fontSize: chipFontSize,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: spacing8),
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
                          color: AppTheme.primaryColor,
                          size: currencyIconSize,
                        );
                      },
                    ),
                    SizedBox(width: spacing4),
                    Text(
                      '${isWithdraw ? '-' : '+'} ${transaction.amount.toStringAsFixed(2)}',
                      style: AppTheme.bodyMedium.copyWith(
                        color: amountColor,
                        fontWeight: FontWeight.w600,
                        fontSize: amountFontSize,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: spacing4),
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
                          color: AppTheme.primaryColor,
                          size: currencyIconSize,
                        );
                      },
                    ),
                    SizedBox(width: spacing4),
                    Text(
                      transaction.balanceAfter.toStringAsFixed(2),
                      style: AppTheme.bodySmall.copyWith(
                        color: Colors.grey,
                        fontSize: balanceFontSize,
                      ),
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
}
