import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';

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

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadHistory();
  }

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
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

  Future<void> _submit() async {
    if (!_enabled) return;
    if (_recipientController.text.trim().isEmpty) {
      _showSnack('shop.transferRecipientRequired'.tr());
      return;
    }
    if (_parsedAmount <= 0) {
      _showSnack('shop.transferAmountRequired'.tr());
      return;
    }

    final balance = context.read<AuthProvider>().user?.balance ?? 0;
    if (_totalDebited > balance) {
      _showSnack('shop.transferInsufficientBalance'.tr());
      return;
    }

    setState(() => _submitting = true);
    final result = await _userService.submitCoinTransfer(
      recipientUsername: _recipientController.text.trim(),
      amount: _parsedAmount,
      note: _noteController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _submitting = false);

    if (result['success'] == true) {
      _showSnack('shop.transferSuccess'.tr());
      _recipientController.clear();
      _amountController.clear();
      _noteController.clear();
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
        GlassCard(
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
                          decoration: InputDecoration(
                            labelText: 'shop.transferRecipient'.tr(),
                            hintText: 'shop.transferRecipientPlaceholder'.tr(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _amountController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          onChanged: (_) => setState(() {}),
                          decoration: InputDecoration(
                            labelText: 'shop.transferAmount'.tr(),
                            hintText: 'shop.transferAmountPlaceholder'.tr(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _noteController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            labelText: 'shop.transferNote'.tr(),
                            hintText: 'shop.transferNotePlaceholder'.tr(),
                          ),
                        ),
                        if (_parsedAmount > 0) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.surface.withValues(alpha: 0.5),
                              border: Border.all(color: AppColors.border(0.12)),
                            ),
                            child: Column(
                              children: [
                                _PreviewRow('shop.transferAmount'.tr(), '${_parsedAmount.toStringAsFixed(2)} BAC'),
                                _PreviewRow(
                                  'shop.transferFee'.tr(namedArgs: {'percent': _feePercent.toStringAsFixed(1)}),
                                  '${_feeAmount.toStringAsFixed(2)} BAC',
                                ),
                                const Divider(height: 16),
                                _PreviewRow(
                                  'shop.transferTotalDebit'.tr(),
                                  '${_totalDebited.toStringAsFixed(2)} BAC',
                                  bold: true,
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _submitting ? null : _submit,
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
          GlassCard(
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
              child: GlassCard(
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
                        color: isSent ? Colors.redAccent : AppColors.gold,
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
        color: AppColors.surface.withValues(alpha: 0.6),
        border: Border.all(color: AppColors.border(0.12)),
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

class _PreviewRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;

  const _PreviewRow(this.label, this.value, {this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
          Text(
            value,
            style: AppTheme.bodySmall.copyWith(
              fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
              color: bold ? AppColors.gold : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
