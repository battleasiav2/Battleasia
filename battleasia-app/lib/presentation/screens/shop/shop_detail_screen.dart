import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/shop_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';

// Badge colour map — mirrors BADGE_COLOR_MAP in the web shop frontend.
const Map<String, Color> _kBadgeBgColor = {
  'Popular': Color(0xFF22c55e),
  'New': Color(0xFF3b82f6),
  'Hot': Color(0xFFf59e0b),
  'Best': Color(0xFF8b5cf6),
};

// ─────────────────────────────────────────────────────────────────────────────
// Data classes
// ─────────────────────────────────────────────────────────────────────────────

class _PaymentChannel {
  final String id;
  final String name;
  final String icon;
  final bool enabled;
  final String? description;

  const _PaymentChannel({
    required this.id,
    required this.name,
    required this.icon,
    required this.enabled,
    this.description,
  });

  factory _PaymentChannel.fromJson(Map<String, dynamic> j) => _PaymentChannel(
        id: j['_id']?.toString() ?? j['id']?.toString() ?? '',
        name: j['channel_name']?.toString() ?? '',
        icon: j['icon']?.toString() ?? '',
        enabled: j['enabled'] == true,
        description: j['description']?.toString(),
      );
}

class _CurrencyRate {
  final String currency;
  final String region;
  final double rate;

  const _CurrencyRate(
      {required this.currency, required this.region, required this.rate});

  factory _CurrencyRate.fromJson(Map<String, dynamic> j) => _CurrencyRate(
        currency: j['currency']?.toString() ?? '',
        region: j['region']?.toString() ?? '',
        rate: (j['rate'] is num) ? (j['rate'] as num).toDouble() : 0.0,
      );

  bool matchesCode(String code) =>
      currency.toLowerCase() == code.toLowerCase() ||
      region.toLowerCase() == code.toLowerCase();
}

class _BusinessWallet {
  final String id;
  final String address;
  final String currency;

  const _BusinessWallet(
      {required this.id, required this.address, required this.currency});

  factory _BusinessWallet.fromJson(Map<String, dynamic> j) => _BusinessWallet(
        id: j['_id']?.toString() ?? j['id']?.toString() ?? '',
        address: j['wallet_address']?.toString() ?? '',
        currency: j['currency']?.toString() ?? '',
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

class ShopDetailScreen extends StatefulWidget {
  final String itemId;

  const ShopDetailScreen({super.key, required this.itemId});

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen> {
  final ScrollController _scrollController = ScrollController();
  final ShopService _shopService = ShopService();

  // Item
  ShopItemModel? _item;
  bool _loadingItem = true;

  // Shop support data
  List<_CurrencyRate> _rates = [];
  List<_PaymentChannel> _channels = [];
  bool _loadingSupport = true;

  // Purchase dialog state
  String _selectedChannelId = '';
  String _selectedCurrency = 'bdt'; // default BDT like web frontend

  // Payment details state (second step — like web frontend)
  bool _showPaymentDetails = false;
  _BusinessWallet? _selectedWallet;
  _PaymentChannel? _selectedChannelObj;
  double _paymentAmount = 0;

  final TextEditingController _fromAddressCtrl = TextEditingController();
  final TextEditingController _transactionIdCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _fromAddressCtrl.dispose();
    _transactionIdCtrl.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  Future<void> _loadAll() async {
    await Future.wait([_fetchItem(), _fetchSupportData()]);
  }

  Future<void> _fetchItem() async {
    try {
      final result = await _shopService.getShopItemById(widget.itemId);
      if (result['success'] == true && result['data'] != null) {
        final item =
            ShopItemModel.fromJson(result['data'] as Map<String, dynamic>);
        if (mounted) setState(() => _item = item);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content:
                Text(result['message'] as String? ?? 'Failed to load item'),
            backgroundColor: Colors.red,
          ));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Failed to load item: ${e.toString()}'),
          backgroundColor: Colors.red,
        ));
      }
    } finally {
      if (mounted) setState(() => _loadingItem = false);
    }
  }

  Future<void> _fetchSupportData() async {
    try {
      final results = await Future.wait([
        _shopService.getCurrencyRates(),
        _shopService.getPaymentChannels(),
      ]);

      final ratesResult = results[0];
      final channelsResult = results[1];

      final ratesRaw = ratesResult['data'];
      final List<_CurrencyRate> rates = [];
      if (ratesRaw is List) {
        for (final r in ratesRaw) {
          if (r is Map<String, dynamic>) rates.add(_CurrencyRate.fromJson(r));
        }
      }

      final channelsRaw =
          (channelsResult['data'] as Map<String, dynamic>?)?['results'];
      final List<_PaymentChannel> channels = [];
      if (channelsRaw is List) {
        for (final c in channelsRaw) {
          if (c is Map<String, dynamic>) {
            final ch = _PaymentChannel.fromJson(c);
            if (ch.enabled) channels.add(ch);
          }
        }
      }

      if (mounted) {
        setState(() {
          _rates = rates;
          _channels = channels;
          if (channels.isNotEmpty) _selectedChannelId = channels.first.id;
        });
      }
    } catch (_) {
      // Non-critical — payment flow will surface an error at confirmation time.
    } finally {
      if (mounted) setState(() => _loadingSupport = false);
    }
  }

  // ---------------------------------------------------------------------------
  // Purchase flow
  // ---------------------------------------------------------------------------

  /// Returns the rate for a given currency/region code.
  double _rateFor(String code) =>
      _rates
          .firstWhere((r) => r.matchesCode(code),
              orElse: () => _CurrencyRate(currency: '', region: '', rate: 0))
          .rate;

  /// Whether the selected channel is crypto-based.
  bool get _isCrypto {
    final ch = _channels.firstWhere((c) => c.id == _selectedChannelId,
        orElse: () =>
            _PaymentChannel(id: '', name: '', icon: '', enabled: false));
    return ch.name.toLowerCase().contains('crypto');
  }

  double _totalForCurrency(String code) {
    if (_item == null) return 0;
    final rate = _rateFor(code);
    if (rate == 0) return 0;
    double total = rate * _item!.amount;

    // Apply premium discount if user is premium and item has discountPercent.
    if (_item!.isPremiumUser && _item!.discountPercent > 0) {
      total = total * (1 - _item!.discountPercent / 100);
    }
    return total;
  }

  Future<void> _handleConfirmPurchase() async {
    if (_item == null || _selectedChannelId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please select a payment channel'),
        backgroundColor: Colors.red,
      ));
      return;
    }

    final channel = _channels.firstWhere((c) => c.id == _selectedChannelId,
        orElse: () =>
            _PaymentChannel(id: '', name: '', icon: '', enabled: false));
    if (channel.id.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Payment channel not found'),
        backgroundColor: Colors.red,
      ));
      return;
    }

    setState(() => _submitting = true);
    try {
      final currency = _isCrypto ? 'usd' : _selectedCurrency;
      final result = await _shopService.getBusinessWallets(
        channelId: _selectedChannelId,
        currency: currency,
      );

      final walletsRaw =
          (result['data'] as Map<String, dynamic>?)?['results'] as List?;
      if (walletsRaw == null || walletsRaw.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
                'No ${currency.toUpperCase()} wallet available for ${channel.name}'),
            backgroundColor: Colors.red,
          ));
        }
        return;
      }

      final random = walletsRaw[Random().nextInt(walletsRaw.length)];
      final wallet = _BusinessWallet.fromJson(random as Map<String, dynamic>);
      final total = _totalForCurrency(currency);

      if (mounted) {
        setState(() {
          _selectedWallet = wallet;
          _selectedChannelObj = channel;
          _paymentAmount = total;
          _showPaymentDetails = true;
          _fromAddressCtrl.clear();
          _transactionIdCtrl.clear();
        });
        Navigator.of(context).pop(); // close first dialog
        _openPaymentDetailsDialog();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Failed to get payment details: ${e.toString()}'),
          backgroundColor: Colors.red,
        ));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _handleTransactionSubmit() async {
    if (_fromAddressCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please enter the address you sent from'),
        backgroundColor: Colors.red,
      ));
      return;
    }
    if (_transactionIdCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please enter the transaction ID'),
        backgroundColor: Colors.red,
      ));
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please log in to make a purchase'),
        backgroundColor: Colors.red,
      ));
      return;
    }

    setState(() => _submitting = true);
    try {
      final currency = _isCrypto ? 'usd' : _selectedCurrency;
      final result = await _shopService.submitDeposit(
        userEmail: user.email,
        username: user.username,
        transactionId: _transactionIdCtrl.text.trim(),
        coinAmount: _item!.amount,
        paymentCurrency: currency,
        paymentAmount: _paymentAmount,
        fromAddress: _fromAddressCtrl.text.trim(),
        paymentChannelId: _selectedChannelObj!.id,
        toWalletAddress: _selectedWallet!.address,
      );

      if (result['success'] == true) {
        if (mounted) {
          Navigator.of(context).pop(); // close payment details dialog
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text(
                'Deposit submitted successfully! Waiting for admin approval...'),
            backgroundColor: Colors.green,
          ));
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(result['message'] as String? ?? 'Failed to submit'),
            backgroundColor: Colors.red,
          ));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  // ---------------------------------------------------------------------------
  // Dialogs
  // ---------------------------------------------------------------------------

  void _handleBuy() {
    if (_loadingSupport) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Loading payment options...'),
      ));
      return;
    }
    if (_channels.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('No payment channels available'),
        backgroundColor: Colors.orange,
      ));
      return;
    }
    showDialog(
      context: context,
      builder: (_) => _buildPurchaseDialog(),
    );
  }

  void _openPaymentDetailsDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => _buildPaymentDetailsDialog(),
    );
  }

  // ── Dialog 1: select channel + order summary ──────────────────────────────

  Widget _buildPurchaseDialog() {
    return StatefulBuilder(builder: (ctx, setDialogState) {
      final item = _item!;
      final isCrypto = _channels
          .firstWhere((c) => c.id == _selectedChannelId,
              orElse: () =>
                  _PaymentChannel(id: '', name: '', icon: '', enabled: false))
          .name
          .toLowerCase()
          .contains('crypto');

      final currency = isCrypto ? 'usd' : _selectedCurrency;
      final subtotal = _totalForCurrency(currency);

      String totalLabel() {
        if (isCrypto) return 'USD';
        return _selectedCurrency.toUpperCase();
      }

      return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: AppTheme.primaryColor.withOpacity(0.35),
            width: 1.5,
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              const Text('Security Payment',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primaryColor)),
              const SizedBox(height: 16),

              // Order summary card
              _dialogSummaryCard(item, currency, subtotal, totalLabel),

              const SizedBox(height: 16),

              // Payment channel selection
              const Text('Select Payment Channel',
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87)),
              const SizedBox(height: 8),
              ..._channels.map((ch) {
                final selected = _selectedChannelId == ch.id;
                return GestureDetector(
                  onTap: () => setDialogState(() {
                    _selectedChannelId = ch.id;
                  }),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: selected
                            ? AppTheme.primaryColor
                            : Colors.grey.shade300,
                        width: selected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                      color: selected
                          ? AppTheme.primaryColor.withOpacity(0.05)
                          : Colors.white,
                    ),
                    child: Row(
                      children: [
                        if (ch.name.toLowerCase().contains('bkash'))
                          Image.asset(
                            'assets/images/bkash.webp',
                            width: 48,
                            height: 32,
                            fit: BoxFit.contain,
                          )
                        else if (ch.icon.isNotEmpty)
                          Image.network(ch.icon,
                              width: 48,
                              height: 32,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.payment, size: 32)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(ch.name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: Colors.black87)),
                              if (ch.description != null &&
                                  ch.description!.isNotEmpty)
                                Text(ch.description!,
                                    style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade600)),
                            ],
                          ),
                        ),
                        if (selected)
                          Icon(Icons.check_circle,
                              color: AppTheme.primaryColor),
                      ],
                    ),
                  ),
                );
              }),

              // Currency selector (non-crypto only)
              if (!isCrypto) ...[
                const SizedBox(height: 12),
                const Text('Select Currency',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedCurrency,
                  dropdownColor: Colors.white,
                  style: const TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                      fontSize: 14),
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            BorderSide(color: Colors.grey.shade300)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            BorderSide(color: Colors.grey.shade300)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(
                            color: AppTheme.primaryColor, width: 1.5)),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                  ),
                  items: ['bdt', 'inr', 'pkr']
                      .where((code) => _rateFor(code) > 0)
                      .map((code) => DropdownMenuItem(
                            value: code,
                            child: Text(code.toUpperCase(),
                                style: const TextStyle(
                                    color: Colors.black87)),
                          ))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) {
                      setDialogState(() => _selectedCurrency = v);
                    }
                  },
                ),
              ],

              const SizedBox(height: 20),

              // Dialog actions
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: TextButton.styleFrom(
                        foregroundColor: Colors.grey.shade700),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _submitting
                        ? null
                        : () => _handleConfirmPurchase(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                    child: _submitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Confirm & Pay'),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _dialogSummaryCard(ShopItemModel item, String currency,
      double subtotal, String Function() totalLabel) {
    final hasDiscount = item.discountPercent > 0 && item.isPremiumUser;
    final originalSubtotal = _rateFor(currency) * item.amount;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.25)),
        borderRadius: BorderRadius.circular(8),
        color: const Color(0xFFFFFBF2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Order Summary',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87)),
          const Divider(),
          Row(
            children: [
              // Coin image thumb
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: SizedBox(
                  width: 56,
                  height: 56,
                  child: _buildCoinImage(item.image),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${item.amount} ${item.symbol}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: Colors.black87)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(),
          // Total row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total',
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: Colors.black87)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (hasDiscount && originalSubtotal > 0) ...[
                    Text(
                      '${totalLabel()} ${originalSubtotal.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                    Text(
                      '${totalLabel()} ${subtotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: Color(0xFF22c55e)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF22c55e).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '-${item.discountPercent.toInt()}% Premium Discount',
                        style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF22c55e),
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ] else
                    Text(
                      subtotal > 0
                          ? '${totalLabel()} ${subtotal.toStringAsFixed(2)}'
                          : '\$${item.price.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: AppTheme.primaryColor),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Dialog 2: payment details + transaction submission ────────────────────

  Widget _buildPaymentDetailsDialog() {
    final wallet = _selectedWallet;
    final channel = _selectedChannelObj;
    if (wallet == null || channel == null) return const SizedBox.shrink();

    final currency = _isCrypto ? 'usd' : _selectedCurrency;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppTheme.primaryColor.withOpacity(0.35),
          width: 1.5,
        ),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Payment Details',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primaryColor)),
            const SizedBox(height: 16),

            // Channel icon + name (compact inline row)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (channel.name.toLowerCase().contains('bkash'))
                  Image.asset(
                    'assets/images/bkash.webp',
                    width: 40,
                    height: 28,
                    fit: BoxFit.contain,
                  )
                else if (channel.icon.isNotEmpty)
                  Image.network(
                    channel.icon,
                    width: 40,
                    height: 28,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) =>
                        const Icon(Icons.payment, size: 28,
                            color: AppTheme.primaryColor),
                  ),
                const SizedBox(width: 8),
                Text('Deposit via ${channel.name}',
                    style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryColor)),
              ],
            ),
            const SizedBox(height: 16),

            // Amount card
            _infoCard(
              label: 'Amount',
              value:
                  '${_paymentAmount.toStringAsFixed(2)} ${currency.toUpperCase()}',
            ),

            const SizedBox(height: 8),

            // Wallet address card
            _infoCard(
              label: 'Wallet Address',
              value: wallet.address,
              copyable: true,
            ),

            const SizedBox(height: 8),

            // Instruction card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFeff6ff),
                border: Border.all(color: const Color(0xFF93c5fd)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Please send the specified amount to the wallet address above. '
                'After completing the payment, enter the transaction ID below '
                'and tap Confirm to complete your purchase.',
                style: TextStyle(fontSize: 13, color: Color(0xFF1d4ed8)),
              ),
            ),

            const SizedBox(height: 12),

            // From address input
            TextField(
              controller: _fromAddressCtrl,
              style: const TextStyle(color: Colors.black87),
              decoration: InputDecoration(
                labelText: 'From Address',
                labelStyle: TextStyle(color: Colors.grey.shade700),
                hintText: 'Address you sent from',
                hintStyle: TextStyle(color: Colors.grey.shade400),
                helperText: 'Enter the wallet address you used to send',
                helperStyle: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey.shade300)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppTheme.primaryColor, width: 1.5)),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 12),
              ),
            ),

            const SizedBox(height: 12),

            // Transaction ID input
            TextField(
              controller: _transactionIdCtrl,
              style: const TextStyle(color: Colors.black87),
              decoration: InputDecoration(
                labelText: 'Transaction ID',
                labelStyle: TextStyle(color: Colors.grey.shade700),
                hintText: 'Your transaction ID / hash',
                hintStyle: TextStyle(color: Colors.grey.shade400),
                helperText: 'Enter the transaction ID from your payment',
                helperStyle: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey.shade300)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                        color: AppTheme.primaryColor, width: 1.5)),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 12),
              ),
            ),

            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _submitting
                      ? null
                      : () {
                          setState(() => _showPaymentDetails = false);
                          Navigator.of(context).pop();
                        },
                  style: TextButton.styleFrom(
                      foregroundColor: Colors.grey.shade700),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _submitting
                      ? null
                      : _handleTransactionSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: _submitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Confirm'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoCard(
      {required String label,
      required String value,
      bool copyable = false}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF2),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.25)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(
                  fontSize: 12, color: Colors.grey.shade600)),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: Text(value,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: AppTheme.primaryColor)),
              ),
              if (copyable)
                IconButton(
                  icon: const Icon(Icons.copy, size: 18),
                  tooltip: 'Copy',
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: value));
                    ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Copied!')));
                  },
                ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth < 600
        ? 12.0
        : screenWidth < 900
            ? 16.0
            : 24.0;

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

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
          if (_loadingItem)
            const Center(child: CircularProgressIndicator())
          else if (_item == null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_bag_outlined,
                      size: 64, color: Colors.grey[400]),
                  SizedBox(height: spacing16),
                  Text('Item not found',
                      style: AppTheme.heading3.copyWith(color: Colors.grey)),
                ],
              ),
            )
          else
            CustomScrollView(
              controller: _scrollController,
              slivers: [
                SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding:
                        EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: spacing16),
                        _buildBackButton(context),
                        SizedBox(height: spacing24),
                        _buildItemContent(context),
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

  Widget _buildBackButton(BuildContext context) {
    return Material(
      color: AppTheme.surfaceColor,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: () => Navigator.pop(context),
        borderRadius: BorderRadius.circular(8),
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_back, size: 22, color: Colors.black),
              SizedBox(width: 8),
              Text('Back',
                  style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w500,
                      fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItemContent(BuildContext context) {
    final item = _item!;
    final screenWidth = MediaQuery.of(context).size.width;

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final showBadge =
        item.badge.isNotEmpty && item.badge.toLowerCase() != 'none';

    final imageWidget = ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: screenWidth < 600 ? screenWidth * 0.6 : 280,
        width: double.infinity,
        color: const Color(0xFF1A1A1A),
        child: _buildCoinImage(item.image),
      ),
    );

    final summaryWidget = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Badge
        if (showBadge)
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _kBadgeBgColor[item.badge] ?? AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              item.badge,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 12),
            ),
          ),
        if (showBadge) SizedBox(height: spacing16),

        // Amount + symbol
        Text(
          '${item.amount} ${item.symbol}',
          style: AppTheme.heading2.copyWith(
            fontSize: 28,
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.w800,
          ),
        ),

        SizedBox(height: spacing16),

        // Price card
        Card(
          color: const Color(0xFF1E1E1E),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          child: Padding(
            padding: EdgeInsets.all(spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Price row
                Row(
                  children: [
                    Text(
                      '\$${item.price.toStringAsFixed(0)}',
                      style: AppTheme.heading3.copyWith(
                        fontSize: 24,
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (item.discountPercent > 0) ...[
                      const SizedBox(width: 10),
                      Text(
                        '\$${item.originalPrice.toStringAsFixed(0)}',
                        style: AppTheme.bodySmall.copyWith(
                          fontSize: 16,
                          color: AppTheme.textSecondary,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    ],
                  ],
                ),

                // Premium discount info
                if (item.discountPercent > 0) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFf59e0b).withOpacity(0.15),
                      border: Border.all(
                          color: const Color(0xFFf59e0b), width: 1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '-${item.discountPercent.toInt()}% for premium users',
                      style: const TextStyle(
                          color: Color(0xFFf59e0b),
                          fontWeight: FontWeight.w600,
                          fontSize: 12),
                    ),
                  ),
                  if (item.isPremiumUser) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF22c55e).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star,
                              size: 14, color: Color(0xFF22c55e)),
                          const SizedBox(width: 4),
                          Text(
                            'You get ${item.discountPercent.toInt()}% off as a Premium member!',
                            style: const TextStyle(
                                color: Color(0xFF22c55e),
                                fontWeight: FontWeight.w600,
                                fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ),

        SizedBox(height: spacing16),

        // Currency rates card
        if (_rates.isNotEmpty)
          Card(
            color: const Color(0xFF1E1E1E),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8)),
            child: Padding(
              padding: EdgeInsets.all(spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Rates',
                      style: AppTheme.bodyMedium.copyWith(
                          color: Colors.white70,
                          fontWeight: FontWeight.w600,
                          fontSize: 13)),
                  const SizedBox(height: 8),
                  ..._rates.where((r) => r.rate > 0).map((r) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              r.currency.toUpperCase(),
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 13),
                            ),
                            Text(
                              '${r.rate.toStringAsFixed(2)} per coin',
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          ),

        SizedBox(height: spacing24),

        // Buy Now button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _handleBuy,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              padding: EdgeInsets.symmetric(vertical: spacing16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text(
              'Buy Now',
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 16),
            ),
          ),
        ),
      ],
    );

    if (screenWidth < 900) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          imageWidget,
          SizedBox(height: spacing24),
          summaryWidget,
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 1, child: imageWidget),
        SizedBox(width: spacing24),
        Expanded(flex: 1, child: summaryWidget),
      ],
    );
  }

  Widget _buildCoinImage(String image) {
    if (image.isEmpty) {
      return const Center(
        child: Icon(Icons.monetization_on_outlined,
            size: 64, color: Colors.white38),
      );
    }
    final url = AppConfig.getImageUrl(image);
    if (url == null) {
      return const Center(
        child: Icon(Icons.monetization_on_outlined,
            size: 64, color: Colors.white38),
      );
    }
    return Image.network(
      url,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => const Center(
        child: Icon(Icons.monetization_on_outlined,
            size: 64, color: Colors.white38),
      ),
    );
  }
}
