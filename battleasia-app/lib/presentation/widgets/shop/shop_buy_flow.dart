import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/shop_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';

/// Opens web-parity Security Payment → Payment Details flow (dark glass).
Future<void> showShopBuyFlow(
  BuildContext context, {
  required ShopItemModel item,
  String? preferredChannelId,
  List<Map<String, dynamic>>? preloadedChannels,
  List<Map<String, dynamic>>? preloadedRates,
}) {
  return showDialog<void>(
    context: context,
    barrierColor: Colors.black.withValues(alpha: 0.72),
    builder: (_) => _ShopBuyDialog(
      item: item,
      preferredChannelId: preferredChannelId,
      preloadedChannels: preloadedChannels,
      preloadedRates: preloadedRates,
    ),
  );
}

class _Channel {
  final String id;
  final String name;
  final String icon;
  final bool enabled;

  const _Channel({
    required this.id,
    required this.name,
    required this.icon,
    required this.enabled,
  });

  factory _Channel.fromJson(Map<String, dynamic> j) => _Channel(
        id: j['_id']?.toString() ?? j['id']?.toString() ?? '',
        name: j['channel_name']?.toString() ?? '',
        icon: j['icon']?.toString() ?? '',
        enabled: j['enabled'] == true,
      );

  bool get isCrypto => name.toLowerCase().contains('crypto');
}

class _Rate {
  final String currency;
  final String region;
  final double rate;

  const _Rate({
    required this.currency,
    required this.region,
    required this.rate,
  });

  factory _Rate.fromJson(Map<String, dynamic> j) => _Rate(
        currency: j['currency']?.toString() ?? '',
        region: j['region']?.toString() ?? '',
        rate: (j['rate'] is num) ? (j['rate'] as num).toDouble() : 0,
      );

  bool matches(String code) =>
      currency.toLowerCase() == code.toLowerCase() ||
      region.toLowerCase() == code.toLowerCase();
}

class _Wallet {
  final String id;
  final String address;
  final String currency;
  final String? qrCode;

  const _Wallet({
    required this.id,
    required this.address,
    required this.currency,
    this.qrCode,
  });

  factory _Wallet.fromJson(Map<String, dynamic> j) => _Wallet(
        id: j['_id']?.toString() ?? j['id']?.toString() ?? '',
        address: j['wallet_address']?.toString() ?? '',
        currency: j['currency']?.toString() ?? '',
        qrCode: j['qr_code']?.toString(),
      );
}

class _ShopBuyDialog extends StatefulWidget {
  final ShopItemModel item;
  final String? preferredChannelId;
  final List<Map<String, dynamic>>? preloadedChannels;
  final List<Map<String, dynamic>>? preloadedRates;

  const _ShopBuyDialog({
    required this.item,
    this.preferredChannelId,
    this.preloadedChannels,
    this.preloadedRates,
  });

  @override
  State<_ShopBuyDialog> createState() => _ShopBuyDialogState();
}

class _ShopBuyDialogState extends State<_ShopBuyDialog> {
  final ShopService _shop = ShopService();
  final _fromCtrl = TextEditingController();
  final _txCtrl = TextEditingController();

  List<_Channel> _channels = [];
  List<_Rate> _rates = [];
  bool _loading = true;
  bool _submitting = false;
  bool _paymentStep = false;

  String _channelId = '';
  String _currency = 'bdt';
  _Wallet? _wallet;
  _Channel? _paidChannel;
  double _amount = 0;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _fromCtrl.dispose();
    _txCtrl.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    try {
      List<_Channel> channels = [];
      List<_Rate> rates = [];

      if (widget.preloadedChannels != null && widget.preloadedRates != null) {
        channels = widget.preloadedChannels!
            .map(_Channel.fromJson)
            .where((c) => c.enabled)
            .toList();
        rates = widget.preloadedRates!.map(_Rate.fromJson).toList();
      } else {
        final results = await Future.wait([
          _shop.getPaymentChannels(),
          _shop.getCurrencyRates(),
        ]);
        final chRaw =
            (results[0]['data'] as Map<String, dynamic>?)?['results'];
        if (chRaw is List) {
          for (final c in chRaw) {
            if (c is Map) {
              final ch = _Channel.fromJson(Map<String, dynamic>.from(c));
              if (ch.enabled) channels.add(ch);
            }
          }
        }
        final ratesRaw = results[1]['data'];
        if (ratesRaw is List) {
          for (final r in ratesRaw) {
            if (r is Map) rates.add(_Rate.fromJson(Map<String, dynamic>.from(r)));
          }
        }
      }

      if (!mounted) return;
      setState(() {
        _channels = channels;
        _rates = rates;
        if (channels.isNotEmpty) {
          final pref = widget.preferredChannelId;
          if (pref != null &&
              pref.isNotEmpty &&
              channels.any((c) => c.id == pref)) {
            _channelId = pref;
          } else {
            _channelId = channels.first.id;
          }
        }
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  _Channel? get _selectedChannel {
    try {
      return _channels.firstWhere((c) => c.id == _channelId);
    } catch (_) {
      return null;
    }
  }

  double _rateFor(String code) {
    for (final r in _rates) {
      if (r.matches(code)) return r.rate;
    }
    return 0;
  }

  double _totalFor(String code) {
    final rate = _rateFor(code);
    if (rate == 0) return 0;
    var total = rate * widget.item.amount;
    if (widget.item.isPremiumUser && widget.item.discountPercent > 0) {
      total *= (1 - widget.item.discountPercent / 100);
    }
    return total;
  }

  Future<void> _confirmPay() async {
    final channel = _selectedChannel;
    if (channel == null) {
      _toast('Please select a payment channel', Colors.red);
      return;
    }

    setState(() => _submitting = true);
    try {
      final currency = channel.isCrypto ? 'usd' : _currency;
      final result = await _shop.getBusinessWallets(
        channelId: channel.id,
        currency: currency,
      );
      final walletsRaw =
          (result['data'] as Map<String, dynamic>?)?['results'] as List?;
      if (walletsRaw == null || walletsRaw.isEmpty) {
        _toast(
          'No ${currency.toUpperCase()} wallet available for ${channel.name}',
          Colors.red,
        );
        return;
      }
      final pick = walletsRaw[Random().nextInt(walletsRaw.length)];
      final wallet = _Wallet.fromJson(Map<String, dynamic>.from(pick as Map));
      if (!mounted) return;
      setState(() {
        _wallet = wallet;
        _paidChannel = channel;
        _amount = _totalFor(currency);
        _paymentStep = true;
        _fromCtrl.clear();
        _txCtrl.clear();
      });
    } catch (e) {
      _toast('Failed to get payment details: $e', Colors.red);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _submitDeposit() async {
    if (_fromCtrl.text.trim().isEmpty) {
      _toast('Please enter the address you sent from', Colors.red);
      return;
    }
    if (_txCtrl.text.trim().isEmpty) {
      _toast('Please enter the transaction ID', Colors.red);
      return;
    }
    final user = context.read<AuthProvider>().user;
    if (user == null) {
      _toast('Please log in to make a purchase', Colors.red);
      return;
    }
    final channel = _paidChannel;
    final wallet = _wallet;
    if (channel == null || wallet == null) return;

    setState(() => _submitting = true);
    try {
      final currency = channel.isCrypto ? 'usd' : _currency;
      final result = await _shop.submitDeposit(
        userEmail: user.email,
        username: user.username,
        transactionId: _txCtrl.text.trim(),
        coinAmount: widget.item.amount,
        paymentCurrency: currency,
        paymentAmount: _amount,
        fromAddress: _fromCtrl.text.trim(),
        paymentChannelId: channel.id,
        toWalletAddress: wallet.address,
      );
      if (!mounted) return;
      if (result['success'] == true) {
        Navigator.of(context).pop();
        _toast(
          'Deposit submitted successfully! Waiting for admin approval...',
          Colors.green,
        );
      } else {
        _toast(result['message']?.toString() ?? 'Failed to submit', Colors.red);
      }
    } catch (e) {
      _toast('Error: $e', Colors.red);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _toast(String msg, Color bg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: bg),
    );
  }

  @override
  Widget build(BuildContext context) {
    final maxH = MediaQuery.of(context).size.height * 0.9;
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: BoxConstraints(maxWidth: 520, maxHeight: maxH),
        decoration: BoxDecoration(
          color: const Color(0xFF0A0A0A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.hair(0.12)),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                child: Container(width: 3, color: AppColors.gold),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 18, 12, 8),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'SHOP',
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.gold,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.2,
                                  fontSize: 10,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _paymentStep
                                    ? 'Payment Details'
                                    : 'Security Payment',
                                style: AppTheme.heading3.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: Icon(
                            Icons.close,
                            color: Colors.white.withValues(alpha: 0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Divider(height: 1, color: Colors.white.withValues(alpha: 0.08)),
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                      child: _loading
                          ? const Padding(
                              padding: EdgeInsets.all(32),
                              child: Center(child: CircularProgressIndicator()),
                            )
                          : _paymentStep
                              ? _buildPaymentDetails()
                              : _buildSecurityPayment(),
                    ),
                  ),
                  Divider(height: 1, color: Colors.white.withValues(alpha: 0.08)),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                    child: _paymentStep
                        ? Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _submitting
                                      ? null
                                      : () => setState(() => _paymentStep = false),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.white70,
                                    side: BorderSide(
                                      color: Colors.white.withValues(alpha: 0.2),
                                    ),
                                    minimumSize: const Size(0, 44),
                                  ),
                                  child: Text('Back'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                flex: 2,
                                child: _goldOutlineBtn(
                                  label: _submitting ? 'Submitting…' : 'Confirm',
                                  onPressed: _submitting ? null : _submitDeposit,
                                ),
                              ),
                            ],
                          )
                        : _goldOutlineBtn(
                            label: _submitting ? 'Loading…' : 'Confirm & Pay',
                            onPressed: _submitting || _channels.isEmpty
                                ? null
                                : _confirmPay,
                          ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _goldOutlineBtn({required String label, VoidCallback? onPressed}) {
    return SizedBox(
      width: double.infinity,
      height: 44,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.gold,
          side: BorderSide(color: AppColors.gold.withValues(alpha: 0.85)),
          backgroundColor: Colors.black.withValues(alpha: 0.35),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontWeight: FontWeight.w900,
            letterSpacing: 0.6,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _panel({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.panelFill(0.45),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.hair()),
      ),
      child: child,
    );
  }

  Widget _buildSecurityPayment() {
    final user = context.watch<AuthProvider>().user;
    final channel = _selectedChannel;
    final isCrypto = channel?.isCrypto == true;
    final payCode = isCrypto ? 'usd' : _currency;
    final total = _totalFor(payCode);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Player Email',
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.gold,
                  fontWeight: FontWeight.w700,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                user?.email ?? '—',
                style: AppTheme.bodyMedium.copyWith(color: Colors.white),
              ),
              Divider(height: 20, color: Colors.white.withValues(alpha: 0.08)),
              Text(
                'Coupon',
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.gold,
                  fontWeight: FontWeight.w700,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'No available coupon',
                style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        Text(
          'Select payment channels',
          style: AppTheme.bodyMedium.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        ..._channels.map((ch) {
          final selected = ch.id == _channelId;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: InkWell(
              onTap: () => setState(() => _channelId = ch.id),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.gold.withValues(alpha: 0.08)
                      : AppColors.panelFill(0.35),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: selected
                        ? AppColors.gold.withValues(alpha: 0.55)
                        : AppColors.hair(),
                    width: selected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    _channelIcon(ch),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        ch.name,
                        style: AppTheme.bodyMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    if (selected)
                      Icon(Icons.check_circle, color: AppColors.gold, size: 18),
                  ],
                ),
              ),
            ),
          );
        }),
        if (!isCrypto) ...[
          const SizedBox(height: 8),
          Text(
            'Currency',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.textMuted,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            children: ['bdt', 'inr', 'pkr'].map((code) {
              final selected = _currency == code;
              return ChoiceChip(
                label: Text(code.toUpperCase()),
                selected: selected,
                onSelected: (_) => setState(() => _currency = code),
                selectedColor: AppColors.gold.withValues(alpha: 0.25),
                backgroundColor: AppColors.panelFill(0.5),
                labelStyle: TextStyle(
                  color: selected ? AppColors.gold : Colors.white70,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
                side: BorderSide(
                  color: selected
                      ? AppColors.gold.withValues(alpha: 0.6)
                      : AppColors.hair(),
                ),
              );
            }).toList(),
          ),
        ],
        const SizedBox(height: 14),
        _panel(
          child: Column(
            children: [
              _kv('Pack', '${widget.item.amount} ${widget.item.symbol}'),
              const SizedBox(height: 8),
              _kv(
                'Total',
                '${total.toStringAsFixed(2)} ${payCode.toUpperCase()}',
                highlight: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _kv(String k, String v, {bool highlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(k, style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
        Text(
          v,
          style: AppTheme.bodyMedium.copyWith(
            color: highlight ? AppColors.gold : Colors.white,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  Widget _channelIcon(_Channel ch) {
    final name = ch.name.toLowerCase();
    if (name.contains('bkash')) {
      return Image.asset(
        'assets/images/bkash.webp',
        width: 40,
        height: 28,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => Icon(Icons.payment, color: AppColors.gold),
      );
    }
    if (ch.icon.isNotEmpty) {
      final url = AppConfig.getImageUrl(ch.icon);
      return ImageUtils.networkImage(
        url,
        width: 40,
        height: 28,
        fit: BoxFit.contain,
        errorWidget: Icon(Icons.payment, color: AppColors.gold, size: 22),
      );
    }
    return Icon(Icons.payment, color: AppColors.gold, size: 22);
  }

  Widget _buildPaymentDetails() {
    final wallet = _wallet!;
    final channel = _paidChannel!;
    final currency =
        channel.isCrypto ? 'USD' : _currency.toUpperCase();
    final qr = wallet.qrCode;
    final qrUrl = (qr != null && qr.isNotEmpty)
        ? (qr.startsWith('http') || qr.startsWith('data:')
            ? qr
            : AppConfig.getImageUrl(qr))
        : null;

    return Column(
      children: [
        _channelIcon(channel),
        const SizedBox(height: 8),
        Text(
          channel.name,
          style: AppTheme.bodyMedium.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w800,
          ),
        ),
        if (qrUrl != null) ...[
          const SizedBox(height: 14),
          Text(
            'Scan QR Code',
            style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Image.network(
              qrUrl,
              width: 200,
              height: 200,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const SizedBox(
                width: 200,
                height: 200,
                child: Center(child: Icon(Icons.qr_code, size: 64)),
              ),
            ),
          ),
        ],
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: _panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Amount',
                      style: AppTheme.bodySmall
                          .copyWith(color: AppColors.textMuted, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_amount.toStringAsFixed(2)} $currency',
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Wallet Address',
                      style: AppTheme.bodySmall
                          .copyWith(color: AppColors.textMuted, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            wallet.address,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTheme.bodySmall.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          onPressed: () {
                            Clipboard.setData(
                              ClipboardData(text: wallet.address),
                            );
                            _toast('Address copied', Colors.green);
                          },
                          icon: Icon(Icons.copy, size: 16, color: AppColors.gold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.info.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.info.withValues(alpha: 0.25)),
          ),
          child: Text(
            'Send the amount to the wallet above, then enter your from-address and transaction ID.',
            style: AppTheme.bodySmall.copyWith(
              color: Colors.white.withValues(alpha: 0.75),
              height: 1.35,
            ),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _fromCtrl,
          style: const TextStyle(color: Colors.white),
          decoration: _fieldDeco('From address / mobile'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _txCtrl,
          style: const TextStyle(color: Colors.white),
          decoration: _fieldDeco('Transaction ID'),
        ),
      ],
    );
  }

  InputDecoration _fieldDeco(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35)),
        filled: true,
        fillColor: Colors.black.withValues(alpha: 0.45),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: AppColors.hair()),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.6)),
        ),
      );
}
