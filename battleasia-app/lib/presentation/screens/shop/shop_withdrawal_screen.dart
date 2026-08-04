import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/shop_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_section_nav.dart';

/// Native store withdrawal — mirrors web shop `/user/withdrawal` (Coingo payout).
class ShopWithdrawalScreen extends StatefulWidget {
  const ShopWithdrawalScreen({super.key});

  @override
  State<ShopWithdrawalScreen> createState() => _ShopWithdrawalScreenState();
}

class _ShopWithdrawalScreenState extends State<ShopWithdrawalScreen> {
  final ScrollController _scrollController = ScrollController();
  final ShopService _shopService = ShopService();
  final UserService _userService = UserService();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _walletController = TextEditingController();

  final List<String> _channels = const ['bkash', 'nagad', 'crypto'];
  final List<String> _currencies = const ['BDT', 'INR', 'PKR', 'USD'];

  String _channel = 'bkash';
  String _currency = 'BDT';
  double _withdrawable = 0;
  bool _hasPending = false;
  double _pendingAmount = 0;
  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _amountController.dispose();
    _walletController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final result = await _userService.getWithdrawableAmount();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        _withdrawable =
            (data['withdrawableAmount'] as num?)?.toDouble() ?? 0;
        _hasPending = data['hasPendingWithdrawal'] == true;
        _pendingAmount =
            (data['pendingWithdrawalAmount'] as num?)?.toDouble() ?? 0;
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    final auth = context.read<AuthProvider>();
    final amount = double.tryParse(_amountController.text.trim()) ?? 0;
    final wallet = _walletController.text.trim();
    final max = _hasPending ? 0.0 : _withdrawable;

    if (amount <= 0) {
      _toast('Enter a valid BAC amount');
      return;
    }
    if (wallet.isEmpty) {
      _toast('Enter your wallet / mobile number');
      return;
    }
    if (amount > max) {
      _toast('Exceeds withdrawable amount. Max: ${max.toStringAsFixed(2)} BAC');
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceElevated,
        title: Text('Confirm withdrawal', style: AppTheme.heading3),
        content: Text(
          'Withdraw ${amount.toStringAsFixed(2)} BAC via $_channel to:\n$wallet',
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Confirm', style: TextStyle(color: AppColors.gold)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _submitting = true);
    try {
      final result = await _shopService.createCoingoPayout(
        amount: amount,
        walletNumber: wallet,
        walletType: _channel,
        description: 'Withdrawal: $amount BAC to $_currency',
        email: auth.user?.email,
        username: auth.user?.username,
        currencyType: _currency,
      );

      if (!mounted) return;
      if (result['success'] == true) {
        _toast('Withdrawal request submitted', ok: true);
        _amountController.clear();
        _walletController.clear();
        await _load();
      } else {
        _toast(result['message']?.toString() ?? 'Withdrawal failed');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _toast(String msg, {bool ok = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: ok ? Colors.green.shade700 : Colors.red.shade700,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);
    final pad = MediaQuery.of(context).size.width < 600 ? 12.0 : 20.0;
    final balance = context.watch<AuthProvider>().user?.balance ?? 0.0;
    final maxOut = _hasPending ? 0.0 : _withdrawable;

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: pad),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 12),
                      const ShopSectionNav(current: ShopSectionTab.withdrawal),
                      const SizedBox(height: 16),
                      Text(
                        'Withdraw BAC',
                        style: AppTheme.heading2.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Request a payout to bKash, Nagad, or crypto wallet.',
                        style: AppTheme.bodyMedium.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (_loading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(24),
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else ...[
                        Row(
                          children: [
                            Expanded(
                              child: _statTile(
                                'Balance',
                                '${balance.toStringAsFixed(2)} BAC',
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _statTile(
                                'Withdrawable',
                                '${maxOut.toStringAsFixed(2)} BAC',
                              ),
                            ),
                          ],
                        ),
                        if (_hasPending) ...[
                          const SizedBox(height: 12),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.1),
                              border: Border.all(
                                color: AppColors.gold.withValues(alpha: 0.4),
                              ),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Text(
                              'Pending withdrawal: ${_pendingAmount.toStringAsFixed(2)} BAC. New requests are blocked until it clears.',
                              style: AppTheme.bodySmall.copyWith(
                                color: AppColors.gold,
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 20),
                        _label('Currency'),
                        const SizedBox(height: 6),
                        _dropdown(
                          value: _currency,
                          items: _currencies,
                          onChanged: (v) => setState(() => _currency = v!),
                        ),
                        const SizedBox(height: 14),
                        _label('Channel'),
                        const SizedBox(height: 6),
                        _dropdown(
                          value: _channel,
                          items: _channels,
                          onChanged: (v) => setState(() => _channel = v!),
                        ),
                        const SizedBox(height: 14),
                        _label('BAC amount'),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _amountController,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          style: AppTheme.bodyMedium.copyWith(
                            color: AppColors.textPrimary,
                          ),
                          decoration: _fieldDecoration('0.00'),
                        ),
                        const SizedBox(height: 14),
                        _label('Wallet / mobile number'),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _walletController,
                          style: AppTheme.bodyMedium.copyWith(
                            color: AppColors.textPrimary,
                          ),
                          decoration: _fieldDecoration('01XXXXXXXXX or address'),
                        ),
                        const SizedBox(height: 24),
                        GoldButton(
                          label: _submitting ? 'Submitting…' : 'Request withdrawal',
                          onPressed: (_submitting || _hasPending) ? null : _submit,
                        ),
                      ],
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
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

  Widget _statTile(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(2),
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
              letterSpacing: 0.8,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTheme.heading3.copyWith(
              color: AppColors.gold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) => Text(
        text.toUpperCase(),
        style: AppTheme.bodySmall.copyWith(
          color: AppColors.textMuted,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
          fontSize: 11,
        ),
      );

  Widget _dropdown({
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.22)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          dropdownColor: AppColors.surfaceElevated,
          style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
          items: items
              .map(
                (e) => DropdownMenuItem(
                  value: e,
                  child: Text(e.toUpperCase()),
                ),
              )
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  InputDecoration _fieldDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: AppTheme.bodyMedium.copyWith(
          color: Colors.white.withValues(alpha: 0.4),
        ),
        filled: true,
        fillColor: Colors.black.withValues(alpha: 0.45),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(2),
          borderSide: BorderSide(color: AppColors.border(0.22)),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(2)),
          borderSide: BorderSide(color: AppColors.gold),
        ),
      );
}
