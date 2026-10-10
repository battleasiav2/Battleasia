import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/shop_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_section_nav.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_stat_tile.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_item_card.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_buy_flow.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_domain_hint.dart';

/// Native BAC store — list + filters + buy, matching web shop.battleasia.gg.
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> with WidgetsBindingObserver {
  final ScrollController _scrollController = ScrollController();
  final ShopService _shopService = ShopService();
  final TextEditingController _minPriceController = TextEditingController();
  final TextEditingController _maxPriceController = TextEditingController();

  List<ShopItemModel> _items = [];
  List<ShopItemModel> _allItems = [];
  List<Map<String, dynamic>> _channels = [];
  List<Map<String, dynamic>> _rates = [];
  double _bdtRate = 1;
  bool _loading = true;
  int _packImageEpoch = 0;
  String _selectedCategory = 'all';
  String _selectedChannelId = '';

  final List<Map<String, String>> _categories = [
    {'value': 'all', 'key': 'shop.categoryAll'},
    {'value': 'premium', 'key': 'shop.categoryPremium'},
    {'value': 'normal', 'key': 'shop.categoryNormal'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _fetchAll();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _fetchItems(silent: true);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scrollController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  Future<void> _fetchAll({bool silent = false}) async {
    await Future.wait([
      _fetchItems(silent: silent),
      _fetchChannels(),
      _fetchRates(),
    ]);
  }

  Future<void> _fetchRates() async {
    try {
      final result = await _shopService.getCurrencyRates();
      if (result['success'] == true && result['data'] is List) {
        final list = (result['data'] as List)
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
        double bdt = 1;
        for (final r in list) {
          final cur = r['currency']?.toString().toLowerCase() ?? '';
          final region = r['region']?.toString().toLowerCase() ?? '';
          if (cur == 'bdt' || region == 'bdt') {
            final rate = r['rate'];
            if (rate is num && rate > 0) bdt = rate.toDouble();
            break;
          }
        }
        if (mounted) {
          setState(() {
            _rates = list;
            _bdtRate = bdt;
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _fetchChannels() async {
    try {
      final result = await _shopService.getPaymentChannels();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'];
        final list = data is Map
            ? (data['results'] as List? ?? [])
            : (data is List ? data : []);
        final enabled = list
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .where((c) => c['enabled'] == true)
            .toList();
        if (mounted) setState(() => _channels = enabled);
      }
    } catch (_) {}
  }

  Future<void> _fetchItems({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);

    try {
      final result = await _shopService.getShopItems();

      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final payload = data['results'] ?? data;
        final items = payload is List
            ? payload
            : (payload['results'] as List? ?? []);

        final itemsList = items
            .map((item) => ShopItemModel.fromJson(item as Map<String, dynamic>))
            .where((i) => i.isActive)
            .toList();

        if (mounted) {
          setState(() {
            _allItems = itemsList;
            _items = _applyFilters(itemsList);
            _packImageEpoch = DateTime.now().millisecondsSinceEpoch;
          });
        }
      } else if (mounted) {
        setState(() {
          _allItems = [];
          _items = [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('common.error'.tr(namedArgs: {'error': e.toString()})),
            backgroundColor: Colors.red,
          ),
        );
        setState(() {
          _allItems = [];
          _items = [];
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<ShopItemModel> _applyFilters(List<ShopItemModel> all) {
    var list = all;

    switch (_selectedCategory) {
      case 'premium':
        list = list.where((i) => i.discountPercent > 0).toList();
        break;
      case 'normal':
        list = list.where((i) => i.discountPercent == 0).toList();
        break;
    }

    final min = double.tryParse(_minPriceController.text.trim());
    final max = double.tryParse(_maxPriceController.text.trim());
    if (min != null) {
      list = list.where((i) => i.price >= min).toList();
    }
    if (max != null) {
      list = list.where((i) => i.price <= max).toList();
    }

    list.sort((a, b) => a.amount.compareTo(b.amount));
    return list;
  }

  void _refilter() {
    setState(() => _items = _applyFilters(_allItems));
  }

  void _clearPriceFilters() {
    _minPriceController.clear();
    _maxPriceController.clear();
    _selectedChannelId = '';
    _selectedCategory = 'all';
    _refilter();
  }

  void _handleBuy(ShopItemModel item) {
    showShopBuyFlow(
      context,
      item: item,
      preferredChannelId:
          _selectedChannelId.isEmpty ? null : _selectedChannelId,
      preloadedChannels: _channels,
      preloadedRates: _rates,
    );
  }

  Future<void> _onRefresh() async {
    await _fetchAll(silent: true);
  }

  @override
  Widget build(BuildContext context) {
    return ShopAuthGate(
      afterLoginScreen: const ShopScreen(),
      child: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
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
    final balance = context.watch<AuthProvider>().user?.balance ?? 0.0;

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            physics: appScrollPhysics,
            slivers: [
              CupertinoSliverRefreshControl(onRefresh: _onRefresh),
              SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
              SliverToBoxAdapter(
                child: Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text(
                        'nav.shop'.tr(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'shop.heroSubtitle'.tr(),
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.62),
                          fontSize: 13,
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const ShopDomainHint(),
                      const SizedBox(height: 14),
                      _buildStats(balance),
                      if (screenWidth < 900 || _loading) ...[
                        const SizedBox(height: 14),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 360),
                            child: _buildFilters(),
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      _buildCategories(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
              if (_loading)
                SliverPadding(
                  padding:
                      EdgeInsets.symmetric(horizontal: horizontalPadding),
                  sliver: SliverGrid(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: screenWidth < 600 ? 2 : 4,
                      crossAxisSpacing: screenWidth < 600 ? 10 : 14,
                      mainAxisSpacing: screenWidth < 600 ? 10 : 14,
                      mainAxisExtent: screenWidth < 600 ? 220 : 248,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (_, __) => Container(
                        decoration: BoxDecoration(
                          color: AppColors.panelFill(0.4),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.hair()),
                        ),
                      ),
                      childCount: 12,
                    ),
                  ),
                )
              else if (_items.isEmpty)
                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  sliver: SliverToBoxAdapter(
                    child: screenWidth >= 900
                        ? Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(width: 220, child: _buildFilters()),
                              const SizedBox(width: 14),
                              Expanded(child: _buildEmptyState()),
                            ],
                          )
                        : _buildEmptyState(),
                  ),
                )
              else if (screenWidth >= 900)
                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(width: 220, child: _buildFilters()),
                        const SizedBox(width: 14),
                        Expanded(
                          child: GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: screenWidth >= 1240 ? 3 : 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              mainAxisExtent: 248,
                            ),
                            itemCount: _items.length,
                            itemBuilder: (context, index) {
                              final item = _items[index];
                              return ShopItemCard(
                                item: item,
                                bdtRate: _bdtRate,
                                imageCacheEpoch: _packImageEpoch,
                                onTap: () => _handleBuy(item),
                                onBuy: () => _handleBuy(item),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding:
                      EdgeInsets.symmetric(horizontal: horizontalPadding),
                  sliver: Builder(
                    builder: (context) {
                      final w = MediaQuery.of(context).size.width;
                      final crossAxisCount = w < 600 ? 2 : 4;

                      return SliverGrid(
                        gridDelegate:
                            SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          crossAxisSpacing: w < 600 ? 10 : 14,
                          mainAxisSpacing: w < 600 ? 10 : 14,
                          mainAxisExtent: w < 600 ? 220 : 248,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final item = _items[index];
                            return ShopItemCard(
                              item: item,
                              bdtRate: _bdtRate,
                              imageCacheEpoch: _packImageEpoch,
                              onTap: () => _handleBuy(item),
                              onBuy: () => _handleBuy(item),
                            );
                          },
                          childCount: _items.length,
                        ),
                      );
                    },
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),
          const ShopSectionNav(active: ShopNavTab.shop),
        ],
      ),
    );
  }

  Widget _buildStats(double balance) {
    return Row(
      children: [
        Expanded(
          child: GlassStatTile(
            label: 'shop.statBalance'.tr(),
            value: balance.toStringAsFixed(0),
            suffix: 'BAC',
            icon: Icons.account_balance_wallet_outlined,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GlassStatTile(
            label: 'shop.statPacks'.tr(),
            value: '${_items.length}',
            suffix: 'shop.statAvailable'.tr(),
            icon: Icons.shopping_bag_outlined,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GlassStatTile(
            label: 'shop.statChannels'.tr(),
            value: '${_channels.length}',
            suffix: 'shop.statActive'.tr(),
            icon: Icons.credit_card_outlined,
          ),
        ),
      ],
    );
  }

  Widget _buildFilters() {
    const ink = Color(0xFFF2F3F0);
    const hint = Color(0xFF9CA3AF);
    const line = Color(0x1AFFFFFF);
    final channelItems = <DropdownMenuItem<String>>[
      DropdownMenuItem(
        value: '',
        child: Text(
          'shop.allChannels'.tr(),
          style: const TextStyle(color: hint, fontSize: 14),
        ),
      ),
      ..._channels.map((c) {
        final id = c['_id']?.toString() ?? '';
        final name = c['channel_name']?.toString() ?? 'Channel';
        return DropdownMenuItem(
          value: id,
          child: Text(name, style: const TextStyle(color: ink, fontSize: 14)),
        );
      }),
    ];
    final picked = _selectedChannelId.isNotEmpty;

    return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: AppColors.dashCardGradient,
            borderRadius: BorderRadius.circular(AppColors.dashCardRadius),
            border: Border.all(color: line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'shop.filterPayment'.tr(),
                style: const TextStyle(
                  color: hint,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C0E12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: line),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedChannelId,
                    isExpanded: true,
                    dropdownColor: const Color(0xFF171A1E),
                    iconEnabledColor: hint,
                    style: TextStyle(
                      color: picked ? ink : hint,
                      fontSize: 14,
                    ),
                    items: channelItems,
                    onChanged: (v) =>
                        setState(() => _selectedChannelId = v ?? ''),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'shop.filterPriceRange'.tr(),
                style: const TextStyle(
                  color: hint,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _minPriceController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      onChanged: (_) => _refilter(),
                      style: const TextStyle(color: ink, fontSize: 14),
                      decoration: _priceDecoration('shop.minPrice'.tr()),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _maxPriceController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      onChanged: (_) => _refilter(),
                      style: const TextStyle(color: ink, fontSize: 14),
                      decoration: _priceDecoration('shop.maxPrice'.tr()),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              OutlinedButton(
                onPressed: _clearPriceFilters,
                style: OutlinedButton.styleFrom(
                  foregroundColor: ink,
                  backgroundColor: Colors.transparent,
                  minimumSize: const Size(0, 34),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  side: const BorderSide(color: Color(0x24FFFFFF)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  'shop.clear'.tr(),
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
    );
  }

  InputDecoration _priceDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
        filled: true,
        fillColor: const Color(0xFF0C0E12),
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0x1AFFFFFF)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD4E82A)),
        ),
      );

  Widget _buildCategories() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _categories.map((category) {
          final isSelected = _selectedCategory == category['value'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () {
                setState(() {
                  _selectedCategory = category['value']!;
                  _items = _applyFilters(_allItems);
                });
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.surfaceElevated
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected ? AppColors.gold : AppColors.border(0.2),
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  category['key']!.tr(),
                  style: AppTheme.bodyMedium.copyWith(
                    fontSize: 13,
                    color: isSelected ? AppColors.gold : AppColors.textMuted,
                    fontWeight:
                        isSelected ? FontWeight.w800 : FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.shopping_bag_outlined,
              size: 56,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: 12),
            Text(
              'shop.emptyFilters'.tr(),
              style: AppTheme.heading3.copyWith(color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'shop.emptyFiltersHint'.tr(),
              style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: _clearPriceFilters,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.gold,
                side: BorderSide(color: AppColors.gold.withValues(alpha: 0.7)),
              ),
              child: Text('shop.clearAllFilters'.tr()),
            ),
          ],
        ),
      ),
    );
  }
}
