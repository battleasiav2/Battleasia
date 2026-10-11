import 'dart:async';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/utils/idempotency.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/theme/auth_input_style.dart';

class ShopCoinTransferPanel extends StatefulWidget {
  const ShopCoinTransferPanel({super.key});

  @override
  State<ShopCoinTransferPanel> createState() => _ShopCoinTransferPanelState();
}

class _ShopCoinTransferPanelState extends State<ShopCoinTransferPanel> {
  final UserService _userService = UserService();
  final TextEditingController _recipientController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  bool _settingsLoading = true;
  bool _historyLoading = true;
  bool _submitting = false;
  bool _enabled = true;
  double _feePercent = 2;
  double _minAmount = 1;
  double _maxAmount = 10000;
  List<Map<String, dynamic>> _history = [];
  Map<String, dynamic>? _previewUser;
  bool _previewBusy = false;
  String _previewErr = '';
  Timer? _previewDebounce;

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadHistory();
    _recipientController.addListener(_onRecipientChanged);
  }

  @override
  void dispose() {
    _previewDebounce?.cancel();
    _recipientController.removeListener(_onRecipientChanged);
    _recipientController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _onRecipientChanged() {
    _previewDebounce?.cancel();
    final q = _recipientController.text.trim();
    if (q.length < 2) {
      setState(() {
        _previewUser = null;
        _previewErr = '';
        _previewBusy = false;
      });
      return;
    }
    setState(() {
      _previewBusy = true;
      _previewErr = '';
    });
    _previewDebounce = Timer(const Duration(milliseconds: 350), () async {
      final result = await _userService.lookupTransferUser(q);
      if (!mounted) return;
      if (result['success'] == true && result['data'] is Map) {
        setState(() {
          _previewUser = Map<String, dynamic>.from(result['data'] as Map);
          _previewErr = '';
          _previewBusy = false;
        });
      } else {
        setState(() {
          _previewUser = null;
          _previewErr = result['notFound'] == true
              ? 'shop.transferUserMissing'.tr()
              : (result['message'] as String? ?? 'shop.transferUserMissing'.tr());
          _previewBusy = false;
        });
      }
    });
  }

  Future<void> _loadSettings() async {
    setState(() => _settingsLoading = true);
    final result = await _userService.getTransferSettings();
    if (!mounted) return;
    if (result['success'] == true && result['data'] != null) {
      final data = result['data'] as Map<String, dynamic>;
      setState(() {
        _enabled = data['enabled'] != false;
        _feePercent = (data['feePercent'] as num?)?.toDouble() ?? 2;
        _minAmount = (data['minAmount'] as num?)?.toDouble() ?? 1;
        _maxAmount = (data['maxAmount'] as num?)?.toDouble() ?? 10000;
      });
    }
    setState(() => _settingsLoading = false);
  }

  Future<void> _loadHistory() async {
    setState(() => _historyLoading = true);
    final result = await _userService.getTransferHistory();
    if (!mounted) return;
    if (result['success'] == true) {
      final data = result['data'] as Map<String, dynamic>?;
      final results = data?['results'] as List? ?? [];
      setState(() {
        _history = results.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      });
    }
    setState(() => _historyLoading = false);
  }

  double get _parsedAmount {
    final value = double.tryParse(_amountController.text.trim());
    if (value == null || value <= 0) return 0;
    return value;
  }

  double get _feeAmount {
    if (_parsedAmount <= 0) return 0;
    return double.parse(((_parsedAmount * _feePercent) / 100).toStringAsFixed(2));
  }

  double get _totalDebited => _parsedAmount + _feeAmount;

  String? _validateTransfer() {
    if (!_enabled) return 'shop.transferDisabled'.tr();
    final to = _recipientController.text.trim();
    if (to.isEmpty) return 'shop.transferRecipientRequired'.tr();
    if (_previewUser == null ||
        _previewUser!['username']?.toString().toLowerCase() != to.toLowerCase()) {
      return 'shop.transferUserMissing'.tr();
    }
    final me = context.read<AuthProvider>().user;
    if (me != null &&
        (to.toLowerCase() == me.username.toLowerCase() ||
            to.toLowerCase() == me.email.toLowerCase())) {
      return 'shop.transferSelf'.tr();
    }
    if (_parsedAmount <= 0) return 'shop.transferAmountRequired'.tr();
    if (_parsedAmount < _minAmount) {
      return 'shop.transferMin'.tr(namedArgs: {'min': _minAmount.toStringAsFixed(0)});
    }
    if (_parsedAmount > _maxAmount) {
      return 'shop.transferMax'.tr(namedArgs: {'max': _maxAmount.toStringAsFixed(0)});
    }
    final balance = me?.balance ?? 0;
    if (_totalDebited > balance) return 'shop.transferInsufficientBalance'.tr();
    return null;
  }

  Future<void> _requestConfirm() async {
    final err = _validateTransfer();
    if (err != null) {
      _showSnack(err);
      return;
    }
    final to = _recipientController.text.trim();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161618),
        title: Text('shop.transferConfirmTitle'.tr(), style: const TextStyle(color: Colors.white)),
        content: Text(
          'shop.transferConfirmBody'.tr(namedArgs: {
            'amount': _parsedAmount.toStringAsFixed(2),
            'fee': _feeAmount.toStringAsFixed(2),
            'total': _totalDebited.toStringAsFixed(2),
            'user': to,
          }),
          style: TextStyle(color: Colors.white.withValues(alpha: 0.75)),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('shop.cancel'.tr())),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('shop.confirm'.tr(), style: TextStyle(color: AppColors.gold)),
          ),
        ],
      ),
    );
    if (confirmed == true) await _submit();
  }

  Future<void> _submit() async {
    if (_submitting) return;
    setState(() => _submitting = true);
    final idem = newIdempotencyKey();
    final result = await _userService.submitCoinTransfer(
      recipientUsername: _recipientController.text.trim(),
      amount: _parsedAmount,
      note: _noteController.text.trim(),
      idempotencyKey: idem,
    );
    if (!mounted) return;
    setState(() => _submitting = false);

    if (result['success'] == true) {
      _showSnack('shop.transferSuccess'.tr());
      _recipientController.clear();
      _amountController.clear();
      _noteController.clear();
      setState(() {
        _previewUser = null;
        _previewErr = '';
      });
      await context.read<AuthProvider>().refreshUser();
      await _loadHistory();
    } else {
      _showSnack(result['message'] as String? ?? 'shop.transferFailed'.tr());
    }
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final balance = context.watch<AuthProvider>().user?.balance ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'shop.transferTitle'.tr(),
          style: AppTheme.headingSmall.copyWith(
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'shop.transferSubtitle'.tr(),
          style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted, height: 1.5),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _StatChip(
                label: 'shop.transferYourBalance'.tr(),
                value: '${balance.toStringAsFixed(2)} BAC',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _StatChip(
                label: 'shop.transferFeeRate'.tr(),
                value: _settingsLoading ? '…' : '${_feePercent.toStringAsFixed(1)}%',
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _DashCard(
          child: _settingsLoading
              ? const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
              : !_enabled
                  ? Padding(
                      padding: const EdgeInsets.all(8),
                      child: Text(
                        'shop.transferDisabled'.tr(),
                        style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
                      ),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'shop.transferFormTitle'.tr(),
                          style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _recipientController,
                          style: AuthInputStyle.textStyle,
                          cursorColor: AppColors.gold,
                          decoration: AuthInputStyle.decoration(
                            'shop.transferRecipientPlaceholder'.tr(),
                          ),
                        ),
                        if (_previewBusy)
                          const Padding(
                            padding: EdgeInsets.only(top: 8),
                            child: LinearProgressIndicator(minHeight: 2),
                          )
                        else if (_previewUser != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundImage: _previewUser!['avatar'] != null &&
                                          '${_previewUser!['avatar']}'.isNotEmpty
                                      ? NetworkImage(
                                          ImageUtils.getImageUrl('${_previewUser!['avatar']}'),
                                        )
                                      : null,
                                  child: _previewUser!['avatar'] == null ||
                                          '${_previewUser!['avatar']}'.isEmpty
                                      ? const Icon(Icons.person, size: 18)
                                      : null,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '@${_previewUser!['username']}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      if ((_previewUser!['displayName']?.toString() ?? '').isNotEmpty)
                                        Text(
                                          '${_previewUser!['displayName']}',
                                          style: TextStyle(
                                            color: Colors.white.withValues(alpha: 0.55),
                                            fontSize: 12,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          )
                        else if (_previewErr.isNotEmpty && _recipientController.text.trim().length >= 2)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              _previewErr,
                              style: const TextStyle(color: AppColors.error, fontSize: 12),
                            ),
                          ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _amountController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          onChanged: (_) => setState(() {}),
                          style: AuthInputStyle.textStyle,
                          cursorColor: AppColors.gold,
                          decoration: AuthInputStyle.decoration(
                            'shop.transferAmountPlaceholder'.tr(),
                            helperText: 'shop.transferLimitsHint'.tr(namedArgs: {
                              'min': _minAmount.toStringAsFixed(0),
                              'max': _maxAmount.toStringAsFixed(0),
                            }),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _noteController,
                          maxLines: 2,
                          style: AuthInputStyle.textStyle,
                          cursorColor: AppColors.gold,
                          decoration: AuthInputStyle.decoration(
                            'shop.transferNotePlaceholder'.tr(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF101114),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                          ),
                          child: Row(
                            children: [
                              Expanded(child: _PreviewCell('shop.transferAmount'.tr(), _parsedAmount)),
                              Expanded(
                                child: _PreviewCell(
                                  'shop.transferFee'.tr(namedArgs: {'percent': _feePercent.toStringAsFixed(0)}),
                                  _feeAmount,
                                ),
                              ),
                              Expanded(
                                child: _PreviewCell('shop.transferTotalDebit'.tr(), _totalDebited, accent: true),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _submitting ? null : _requestConfirm,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.gold,
                            foregroundColor: Colors.black,
                            minimumSize: const Size.fromHeight(48),
                          ),
                          child: Text(
                            _submitting ? 'shop.transferSending'.tr() : 'shop.transferSend'.tr(),
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
        ),
        const SizedBox(height: 20),
        Text(
          'shop.transferHistoryTitle'.tr(),
          style: AppTheme.bodyMedium.copyWith(
            fontWeight: FontWeight.w800,
            color: AppColors.gold,
          ),
        ),
        const SizedBox(height: 12),
        if (_historyLoading)
          const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
        else if (_history.isEmpty)
          _DashCard(
            child: Text(
              'shop.transferHistoryEmpty'.tr(),
              style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
            ),
          )
        else
          ..._history.map((item) {
            final isSent = item['direction'] == 'sent';
            final amount = (item['amount'] as num?)?.toDouble() ?? 0;
            final totalDebited = (item['totalDebited'] as num?)?.toDouble() ?? amount;
            final counterparty = item['counterpartyUsername'] as String? ?? '';
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _DashCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${isSent ? 'shop.transferSentTo'.tr() : 'shop.transferReceivedFrom'.tr()} @$counterparty',
                            style: AppTheme.bodySmall.copyWith(fontWeight: FontWeight.w800),
                          ),
                          if (item['note'] != null && '${item['note']}'.trim().isNotEmpty)
                            Text(
                              '${item['note']}',
                              style: AppTheme.bodySmall.copyWith(
                                color: AppColors.textMuted,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                        ],
                      ),
                    ),
                    Text(
                      '${isSent ? '-' : '+'}${(isSent ? totalDebited : amount).toStringAsFixed(2)} BAC',
                      style: AppTheme.bodySmall.copyWith(
                        fontWeight: FontWeight.w800,
                        color: isSent ? Colors.redAccent : Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;

  const _StatChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: AppColors.dashCardGradient,
        borderRadius: BorderRadius.circular(AppColors.dashCardRadius),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted, fontSize: 10)),
          const SizedBox(height: 4),
          Text(value, style: AppTheme.bodyMedium.copyWith(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _PreviewCell extends StatelessWidget {
  final String label;
  final double value;
  final bool accent;

  const _PreviewCell(this.label, this.value, {this.accent = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: accent ? AppColors.gold.withValues(alpha: 0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted, fontSize: 10)),
          const SizedBox(height: 4),
          Text(
            value.toStringAsFixed(2),
            style: AppTheme.bodySmall.copyWith(
              fontWeight: FontWeight.w800,
              color: accent ? AppColors.gold : Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _DashCard extends StatelessWidget {
  final Widget child;

  const _DashCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 16, 16, 16),
      decoration: BoxDecoration(
        color: const Color(0xFF161618),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Stack(
        children: [
          Positioned(
            left: -18,
            top: 0,
            bottom: 0,
            child: Container(width: 3, color: AppColors.gold),
          ),
          child,
        ],
      ),
    );
  }
}
