import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/constants/withdrawal_channels.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_section_nav.dart';
import 'package:battleasia_app/presentation/widgets/wallet/withdraw_sheet.dart';

/// Store withdraw tab — dark glass UI aligned with battleasia.gg wallet withdraw.
class ShopWithdrawalScreen extends StatefulWidget {
  const ShopWithdrawalScreen({super.key});

  @override
  State<ShopWithdrawalScreen> createState() => _ShopWithdrawalScreenState();
}

class _ShopWithdrawalScreenState extends State<ShopWithdrawalScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  double _withdrawable = 0;
  bool _hasPending = false;
  double _pendingAmount = 0;
  bool _loading = true;
  List<Map<String, dynamic>> _currencyRates = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _userService.getWithdrawableAmount(),
        _userService.getCurrencyRates(),
      ]);

      final withdrawResult = results[0];
      if (withdrawResult['success'] == true && withdrawResult['data'] != null) {
        final data = withdrawResult['data'] as Map<String, dynamic>;
        _withdrawable =
            (data['withdrawableAmount'] as num?)?.toDouble() ?? 0;
        _hasPending = data['hasPendingWithdrawal'] == true;
        _pendingAmount =
            (data['pendingWithdrawalAmount'] as num?)?.toDouble() ?? 0;
      }

      final ratesResult = results[1];
      if (ratesResult['success'] == true && ratesResult['data'] is List) {
        _currencyRates = (ratesResult['data'] as List)
            .map<Map<String, dynamic>>(
              (item) => {
                'currency': item['currency']?.toString() ?? '',
                'rate': (item['rate'] as num?)?.toDouble() ?? 0.0,
              },
            )
            .where((item) => item['currency'].toString().isNotEmpty)
            .toList();
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openWithdraw() async {
    final balance = context.read<AuthProvider>().user?.balance ?? 0.0;
    final ok = await showWithdrawSheet(
      context: context,
      availableBalance: balance,
      withdrawableAmount: _withdrawable,
      hasPendingWithdrawal: _hasPending,
      pendingWithdrawalAmount: _pendingAmount,
      currencyRates: _currencyRates,
    );
    if (ok == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('wallet.submitSuccess'.tr()),
          backgroundColor: AppColors.success,
        ),
      );
      await _load();
    }
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
                        'shop.withdrawTitle'.tr(),
                        style: AppTheme.heading2.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'shop.withdrawSubtitleWeb'.tr(),
                        style: AppTheme.bodyMedium.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (_loading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(24),
                            child: CircularProgressIndicator(
                              color: AppColors.gold,
                            ),
                          ),
                        )
                      else ...[
                        GlassCard(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: _statTile(
                                      'shop.statBalance'.tr(),
                                      '${balance.toStringAsFixed(2)} BAC',
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _statTile(
                                      'wallet.withdrawable'.tr(),
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
                                    color:
                                        AppColors.gold.withValues(alpha: 0.1),
                                    border: Border.all(
                                      color: AppColors.gold
                                          .withValues(alpha: 0.4),
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'shop.pendingBlocked'.tr(namedArgs: {
                                      'amount':
                                          _pendingAmount.toStringAsFixed(2),
                                    }),
                                    style: AppTheme.bodySmall.copyWith(
                                      color: AppColors.gold,
                                    ),
                                  ),
                                ),
                              ],
                              const SizedBox(height: 16),
                              Text(
                                'shop.channelsHint'.tr(),
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: kWithdrawalChannels
                                    .map(
                                      (c) => Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.black
                                              .withValues(alpha: 0.4),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                            color: AppColors.border(0.2),
                                          ),
                                        ),
                                        child: Text(
                                          '${c.label} · ${c.currency}',
                                          style: AppTheme.bodySmall.copyWith(
                                            color: AppColors.textPrimary,
                                            fontWeight: FontWeight.w600,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                    )
                                    .toList(),
                              ),
                              const SizedBox(height: 20),
                              GoldButton(
                                label: 'shop.requestWithdrawal'.tr(),
                                icon: Icons.account_balance_wallet_outlined,
                                onPressed:
                                    _hasPending ? null : _openWithdraw,
                              ),
                            ],
                          ),
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
}
