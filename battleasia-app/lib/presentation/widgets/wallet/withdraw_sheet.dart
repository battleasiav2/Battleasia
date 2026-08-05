import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/constants/withdrawal_channels.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

/// Dark glass withdrawal sheet matching battleasia.gg wallet dialog (form → confirm).
Future<bool?> showWithdrawSheet({
  required BuildContext context,
  required double availableBalance,
  required double withdrawableAmount,
  required bool hasPendingWithdrawal,
  required double pendingWithdrawalAmount,
  List<Map<String, dynamic>> currencyRates = const [],
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _WithdrawSheet(
      availableBalance: availableBalance,
      withdrawableAmount: withdrawableAmount,
      hasPendingWithdrawal: hasPendingWithdrawal,
      pendingWithdrawalAmount: pendingWithdrawalAmount,
      currencyRates: currencyRates,
    ),
  );
}

class _WithdrawSheet extends StatefulWidget {
  final double availableBalance;
  final double withdrawableAmount;
  final bool hasPendingWithdrawal;
  final double pendingWithdrawalAmount;
  final List<Map<String, dynamic>> currencyRates;

  const _WithdrawSheet({
    required this.availableBalance,
    required this.withdrawableAmount,
    required this.hasPendingWithdrawal,
    required this.pendingWithdrawalAmount,
    required this.currencyRates,
  });

  @override
  State<_WithdrawSheet> createState() => _WithdrawSheetState();
}

class _WithdrawSheetState extends State<_WithdrawSheet> {
  final _amountController = TextEditingController();
  final _walletController = TextEditingController();
  final _userService = UserService();

  String _step = 'form'; // form | confirm
  String _channel = kWithdrawalChannels.first.value;
  bool _submitting = false;

  WithdrawalChannel get _selectedChannel =>
      kWithdrawalChannels.firstWhere((c) => c.value == _channel);

  double get _maxOut =>
      widget.hasPendingWithdrawal ? 0.0 : widget.withdrawableAmount;

  double get _coins => double.tryParse(_amountController.text.trim()) ?? 0.0;

  double get _rate {
    for (final r in widget.currencyRates) {
      if (r['currency'] == _selectedChannel.currency) {
        final rate = (r['rate'] as num?)?.toDouble() ?? 0.0;
        if (rate > 0) return rate;
      }
    }
    // Fallback rates matching web wallet-view.tsx
    const fallback = {'BDT': 5.5, 'INR': 4.2, 'PKR': 14.0, 'USD': 0.05};
    return fallback[_selectedChannel.currency] ?? 1.0;
  }

  double get _currencyAmount => _coins * _rate;

  @override
  void dispose() {
    _amountController.dispose();
    _walletController.dispose();
    super.dispose();
  }

  void _toast(String msg, {bool ok = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: ok ? AppColors.success : AppColors.error,
      ),
    );
  }

  void _continue() {
    if (_coins <= 0) {
      _toast('wallet.invalidCoinAmount'.tr());
      return;
    }
    if (_walletController.text.trim().isEmpty) {
      _toast('wallet.enterWalletAddress'.tr());
      return;
    }
    if (_coins > _maxOut) {
      _toast('wallet.exceedsWithdrawableMax'.tr(namedArgs: {
        'max': _maxOut.toStringAsFixed(2),
      }));
      return;
    }
    setState(() => _step = 'confirm');
  }

  Future<void> _submit() async {
    final user = context.read<AuthProvider>().user;
    if (user == null) return;

    setState(() => _submitting = true);
    try {
      final result = await _userService.submitWithdrawal(
        userEmail: user.email,
        username: user.username,
        coinAmount: _coins,
        walletType: _channel,
        walletAddress: _walletController.text.trim(),
        currencyType: _selectedChannel.currency,
        currencyAmount: _currencyAmount,
        description: 'Withdrawal request via $_channel',
      );

      if (!mounted) return;
      if (result['success'] == true) {
        Navigator.pop(context, true);
        return;
      }
      _toast(result['message']?.toString() ?? 'wallet.submitFailed'.tr());
    } catch (e) {
      if (mounted) {
        _toast('common.error'.tr(namedArgs: {'error': e.toString()}));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  InputDecoration _fieldDeco(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: AppTheme.bodyMedium.copyWith(
          color: Colors.white.withValues(alpha: 0.35),
          fontSize: 13,
        ),
        filled: true,
        fillColor: Colors.black.withValues(alpha: 0.45),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.border(0.22)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.gold),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: DraggableScrollableSheet(
        initialChildSize: 0.88,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceElevated,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border.all(color: AppColors.border(0.14)),
            ),
            child: Column(
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 10),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border(0.35),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 8, 8),
                  child: Row(
                    children: [
                      const Icon(Icons.account_balance_wallet_outlined,
                          color: AppColors.gold, size: 22),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _step == 'form'
                              ? 'wallet.requestWithdrawal'.tr()
                              : 'wallet.confirmWithdrawal'.tr(),
                          style: AppTheme.heading3.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: _submitting
                            ? null
                            : () => Navigator.pop(context, false),
                        icon: Icon(Icons.close,
                            color: AppColors.textMuted.withValues(alpha: 0.8)),
                      ),
                    ],
                  ),
                ),
                Divider(height: 1, color: AppColors.border(0.12)),
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(20),
                    child: _step == 'form' ? _buildForm() : _buildConfirm(),
                  ),
                ),
                SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                    child: _step == 'form'
                        ? Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _submitting
                                      ? null
                                      : () => Navigator.pop(context, false),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.textPrimary,
                                    side: BorderSide(
                                        color: AppColors.border(0.28)),
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 14),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text('wallet.cancel'.tr()),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: GoldButton(
                                  label: 'wallet.continue'.tr(),
                                  onPressed: widget.hasPendingWithdrawal
                                      ? null
                                      : _continue,
                                ),
                              ),
                            ],
                          )
                        : Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _submitting
                                      ? null
                                      : () => setState(() => _step = 'form'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.textPrimary,
                                    side: BorderSide(
                                        color: AppColors.border(0.28)),
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 14),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text('wallet.back'.tr()),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: GoldButton(
                                  label: 'wallet.confirm'.tr(),
                                  loading: _submitting,
                                  onPressed: _submitting ? null : _submit,
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
      ),
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.hasPendingWithdrawal) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'wallet.pendingWithdrawalTitle'.tr(),
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'wallet.pendingWithdrawalDescription'.tr(namedArgs: {
                    'amount':
                        widget.pendingWithdrawalAmount.toStringAsFixed(2),
                  }),
                  style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border(0.16)),
          ),
          child: Column(
            children: [
              _balanceRow(
                'wallet.availableBalance'.tr(),
                widget.availableBalance,
              ),
              const SizedBox(height: 10),
              Divider(height: 1, color: AppColors.border(0.12)),
              const SizedBox(height: 10),
              _balanceRow(
                'wallet.withdrawableAmount'.tr(),
                _maxOut,
                muted: widget.hasPendingWithdrawal,
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _label('wallet.coinAmount'.tr()),
        const SizedBox(height: 8),
        TextField(
          controller: _amountController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
          onChanged: (_) => setState(() {}),
          decoration: _fieldDeco('wallet.coinAmountHint'.tr()).copyWith(
            helperText: 'wallet.maximum'.tr(namedArgs: {
              'amount': _maxOut.toStringAsFixed(2),
            }),
            helperStyle: AppTheme.bodySmall.copyWith(
              color: AppColors.textMuted,
              fontSize: 11,
            ),
            prefixIcon: Padding(
              padding: const EdgeInsets.all(10),
              child: Image.asset(
                'assets/images/currency.webp',
                width: 20,
                height: 20,
                errorBuilder: (_, __, ___) =>
                    const Icon(Icons.monetization_on, color: AppColors.gold),
              ),
            ),
          ),
        ),
        if (_coins > 0) ...[
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppColors.success.withValues(alpha: 0.35),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'wallet.estimatedCurrency'.tr(namedArgs: {
                    'currency': _selectedChannel.currency,
                  }),
                  style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
                ),
                Text(
                  '${_currencyAmount.toStringAsFixed(2)} ${_selectedChannel.currency}',
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.success,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
        _label('wallet.paymentChannel'.tr()),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.45),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border(0.22)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _channel,
              isExpanded: true,
              dropdownColor: AppColors.surfaceElevated,
              style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
              items: kWithdrawalChannels
                  .map(
                    (c) => DropdownMenuItem(
                      value: c.value,
                      child: Text('${c.label} (${c.currency})'),
                    ),
                  )
                  .toList(),
              onChanged: (v) {
                if (v != null) setState(() => _channel = v);
              },
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '1 BAC = ${_rate.toStringAsFixed(2)} ${_selectedChannel.currency}',
          style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        _label('wallet.walletAddress'.tr()),
        const SizedBox(height: 8),
        TextField(
          controller: _walletController,
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
          decoration: _fieldDeco('wallet.walletAddressHint'.tr()),
        ),
      ],
    );
  }

  Widget _buildConfirm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'wallet.confirmWithdrawalHint'.tr(),
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        _confirmRow('wallet.coinAmount'.tr(), '${_coins.toStringAsFixed(2)} BAC'),
        _confirmRow(
          'wallet.estimatedCurrency'.tr(namedArgs: {
            'currency': _selectedChannel.currency,
          }),
          '${_currencyAmount.toStringAsFixed(2)} ${_selectedChannel.currency}',
        ),
        _confirmRow('wallet.paymentChannel'.tr(), _channel),
        _confirmRow(
          'wallet.walletAddress'.tr(),
          _walletController.text.trim(),
        ),
      ],
    );
  }

  Widget _confirmRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.35),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border(0.14)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: AppTheme.bodySmall.copyWith(
                color: AppColors.textMuted,
                fontSize: 10,
                letterSpacing: 0.6,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: AppTheme.bodyMedium.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _balanceRow(String label, double amount, {bool muted = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
        ),
        Text(
          '${amount.toStringAsFixed(2)} BAC',
          style: AppTheme.bodyMedium.copyWith(
            color: muted ? AppColors.textMuted : AppColors.gold,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  Widget _label(String text) => Text(
        text,
        style: AppTheme.bodySmall.copyWith(
          color: AppColors.textMuted,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.4,
        ),
      );
}
