import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
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
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_stat_tile.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_item_card.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_detail_screen.dart';

/// Native BAC store — list + filters + buy, matching web shop.battleasia.gg /store.
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  final ScrollController _scrollController = ScrollController();
  final ShopService _shopService = ShopService();
  final TextEditingController _minPriceController = TextEditingController();
  final TextEditingController _maxPriceController = TextEditingController();

  List<ShopItemModel> _items = [];
  List<ShopItemModel> _allItems = [];
  List<Map<String, dynamic>> _channels = [];
  bool _loading = true;
  String _selectedCategory = 'all';
  String _selectedChannelId = '';
  bool _isRefreshing = false;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;

  final List<Map<String, String>> _categories = [
    {'value': 'all', 'key': 'shop.categoryAll'},
    {'value': 'premium', 'key': 'shop.categoryPremium'},
    {'value': 'normal', 'key': 'shop.categoryNormal'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchItems();
    _fetchChannels();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
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
    } catch (_) {
      // Filters stay empty — shop list still works.
    }
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

    // Channel filter preselects buy flow; packs themselves are not channel-bound
    // on the API, so we only store the preference for detail navigation.
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
    _refilter();
  }

  void _handleBuy(ShopItemModel item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ShopDetailScreen(
          itemId: item.id,
          preferredChannelId: _selectedChannelId.isEmpty
              ? null
              : _selectedChannelId,
        ),
      ),
    );
  }

  Future<void> _onRefresh() async {
    await Future.wait([_fetchItems(silent: true), _fetchChannels()]);
  }

  bool _atTop() =>
      _scrollController.hasClients && _scrollController.position.pixels <= 0;

  bool _atBottom() =>
      _scrollController.hasClients &&
      _scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent;

  void _onPointerDown(PointerDownEvent e) {
    _dragStartY = e.position.dy;
    _dragStartedAtTop = _atTop();
    _dragStartedAtBottom = _atBottom();
  }

  void _onPointerMove(PointerMoveEvent e) {
    if (_isRefreshing) return;
    final dy = e.position.dy - _dragStartY;
    if ((dy > 0 && _dragStartedAtTop) || (dy < 0 && _dragStartedAtBottom)) {
      if (dy.abs() >= 70) _triggerRefresh();
    }
  }

  void _onPointerSignal(PointerSignalEvent e) {
    if (_isRefreshing) return;
    if (e is PointerScrollEvent) {
      final scrollingUp = e.scrollDelta.dy < 0;
      final scrollingDown = e.scrollDelta.dy > 0;
      if (scrollingDown && _atTop()) {
        _wheelAccumulator += e.scrollDelta.dy.abs();
      } else if (scrollingUp && _atBottom()) {
        _wheelAccumulator += e.scrollDelta.dy.abs();
      } else {
        _wheelAccumulator = 0;
      }
      if (_wheelAccumulator >= 60) {
        _wheelAccumulator = 0;
        _triggerRefresh();
      }
    }
  }

  Future<void> _triggerRefresh() async {
    if (_isRefreshing || !mounted) return;
    setState(() => _isRefreshing = true);
    await _onRefresh();
    if (mounted) setState(() => _isRefreshing = false);
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
      body: Listener(
        onPointerDown: _onPointerDown,
        onPointerMove: _onPointerMove,
        onPointerSignal: _onPointerSignal,
        child: Stack(
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
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 12),
                        _buildHero(),
                        const SizedBox(height: 14),
                        _buildStats(balance),
                        const SizedBox(height: 14),
                        _buildFilters(),
                        const SizedBox(height: 12),
                        _buildCategories(),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
                if (_loading)
                  const SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  )
                else if (_items.isEmpty)
                  SliverToBoxAdapter(child: _buildEmptyState())
                else
                  SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    sliver: Builder(
                      builder: (context) {
                        final w = MediaQuery.of(context).size.width;
                        final crossAxisCount =
                            w < 340 ? 1 : (w < 900 ? 2 : 4);

                        return SliverGrid(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: crossAxisCount,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            mainAxisExtent: 320,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final item = _items[index];
                              return ShopItemCard(
                                item: item,
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
            const FloatingBottomNav(),
          ],
        ),
      ),
    );
  }

  Widget _buildHero() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(2),
      child: AspectRatio(
        aspectRatio: 16 / 7,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/shop/bac-store-hero.webp',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: AppColors.surface,
                alignment: Alignment.center,
                child: Icon(Icons.storefront, color: AppColors.gold, size: 48),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.75),
                    Colors.black.withValues(alpha: 0.2),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'shop.heroTitle'.tr(),
                      style: AppTheme.heading2.copyWith(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        fontSize: 22,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'shop.heroSubtitle'.tr(),
                      style: AppTheme.bodySmall.copyWith(
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
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
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GlassStatTile(
            label: 'shop.statPacks'.tr(),
            value: '${_allItems.length}',
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: GlassStatTile(
            label: 'shop.statChannels'.tr(),
            value: '${_channels.length}',
          ),
        ),
      ],
    );
  }

  Widget _buildFilters() {
    final channelItems = <DropdownMenuItem<String>>[
      DropdownMenuItem(value: '', child: Text('shop.allChannels'.tr())),
      ..._channels.map((c) {
        final id = c['_id']?.toString() ?? '';
        final name = c['channel_name']?.toString() ?? 'Channel';
        return DropdownMenuItem(value: id, child: Text(name));
      }),
    ];

    return GlassCard(
      padding: const EdgeInsets.all(12),
      showGoldBar: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'shop.filters'.tr(),
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.textMuted,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              fontSize: 10,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(2),
              border: Border.all(color: AppColors.border(0.2)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedChannelId,
                isExpanded: true,
                dropdownColor: AppColors.surfaceElevated,
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                  fontSize: 13,
                ),
                items: channelItems,
                onChanged: (v) => setState(() => _selectedChannelId = v ?? ''),
              ),
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
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                  ),
                  decoration: _priceDecoration('shop.minPrice'.tr()),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _maxPriceController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  onChanged: (_) => _refilter(),
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                  ),
                  decoration: _priceDecoration('shop.maxPrice'.tr()),
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: _clearPriceFilters,
                child: Text(
                  'shop.clear'.tr(),
                  style: TextStyle(color: AppColors.gold, fontSize: 12),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  InputDecoration _priceDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: AppTheme.bodySmall.copyWith(
          color: Colors.white.withValues(alpha: 0.4),
        ),
        filled: true,
        fillColor: Colors.black.withValues(alpha: 0.4),
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(2),
          borderSide: BorderSide(color: AppColors.border(0.2)),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(2)),
          borderSide: BorderSide(color: AppColors.gold),
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
              borderRadius: BorderRadius.circular(2),
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
                  borderRadius: BorderRadius.circular(2),
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
              style: AppTheme.heading3.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
