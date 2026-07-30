import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/shop_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/refresh_overlay.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_item_card.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_detail_screen.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  final ScrollController _scrollController = ScrollController();
  final ShopService _shopService = ShopService();

  List<ShopItemModel> _items = [];
  List<ShopItemModel> _allItems = []; // full unfiltered list from API
  bool _loading = true;
  String _selectedCategory = 'all';
  bool _isRefreshing = false;
  double _overscrollAccumulator = 0.0;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;

  final List<Map<String, String>> _categories = [
    {'value': 'all', 'label': 'All'},
    {'value': 'premium', 'label': 'Premium'},
    {'value': 'normal', 'label': 'Normal'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchItems();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchItems({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
      });
    }

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
            .toList();

        if (mounted) {
          setState(() {
            _allItems = itemsList;
            _items = _applyFilter(itemsList, _selectedCategory);
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _allItems = [];
            _items = [];
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load shop items: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() {
          _allItems = [];
          _items = [];
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  /// Client-side filter mirroring the web frontend's All / Premium / Normal tabs.
  ///
  /// - "all"     → every item
  /// - "premium" → items with discountPercent > 0 (they carry a premium discount)
  /// - "normal"  → items with discountPercent == 0
  List<ShopItemModel> _applyFilter(
      List<ShopItemModel> all, String category) {
    switch (category) {
      case 'premium':
        return all.where((i) => i.discountPercent > 0).toList();
      case 'normal':
        return all.where((i) => i.discountPercent == 0).toList();
      default:
        return all;
    }
  }

  void _handleCategorySelect(String category) {
    setState(() {
      _selectedCategory = category;
      _items = _applyFilter(_allItems, category);
    });
  }

  void _handleBuy(ShopItemModel item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ShopDetailScreen(itemId: item.id),
      ),
    );
  }

  Future<void> _onRefresh() async {
    await _fetchItems(silent: true);
  }

  bool _atTop() =>
      _scrollController.hasClients &&
      _scrollController.position.pixels <= 0;

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
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final screenWidth = MediaQuery.of(context).size.width;
    // Responsive horizontal padding based on screen width
    final horizontalPadding = screenWidth < 600
        ? 12.0
        : screenWidth < 900
        ? 16.0
        : screenWidth < 1200
        ? 24.0
        : 32.0;

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
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: spacing16),
                        _buildHeader(context),
                      SizedBox(height: spacing24),
                      _buildCategories(context),
                      SizedBox(height: spacing16),
                    ],
                  ),
                ),
              ),
              // Items Grid
              if (_loading)
                SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(spacing24),
                      child: const CircularProgressIndicator(),
                    ),
                  ),
                )
              else if (_items.isEmpty)
                SliverToBoxAdapter(child: _buildEmptyState(context))
              else
                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  sliver: Builder(
                    builder: (context) {
                      final screenWidth = MediaQuery.of(context).size.width;
                      // Responsive grid columns + fixed main-axis height
                      int crossAxisCount;
                      // Image height mirrors ShopItemCard._buildImage sizing
                      final double imageH = screenWidth < 600
                          ? screenWidth * 0.42
                          : screenWidth < 900
                              ? 180.0
                              : 220.0;
                      // Content area: title + price row + padding (~96px)
                      const double contentH = 96.0;
                      final double mainAxisExtent = imageH + contentH;

                      if (screenWidth < 600) {
                        crossAxisCount = 1;
                      } else if (screenWidth < 900) {
                        crossAxisCount = 2;
                      } else {
                        crossAxisCount = 3;
                      }

                      return SliverGrid(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          crossAxisSpacing: spacing16,
                          mainAxisSpacing: spacing16,
                          mainAxisExtent: mainAxisExtent,
                        ),
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final item = _items[index];
                          return ShopItemCard(
                            item: item,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      ShopDetailScreen(itemId: item.id),
                                ),
                              );
                            },
                            onBuy: () => _handleBuy(item),
                          );
                        }, childCount: _items.length),
                      );
                    },
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
            const FloatingBottomNav(),
          ],
        ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );

    return Text(
      'Shop',
      style: AppTheme.heading2.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w800,
        fontSize: titleFontSize,
        letterSpacing: 1,
      ),
    );
  }

  Widget _buildCategories(BuildContext context) {
    final categoryPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final categoryPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    final categoryFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _categories.map((category) {
          final isSelected = _selectedCategory == category['value'];
          return Padding(
            padding: EdgeInsets.only(right: spacing8),
            child: InkWell(
              onTap: () => _handleCategorySelect(category['value']!),
              borderRadius: BorderRadius.circular(2),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: categoryPaddingH,
                  vertical: categoryPaddingV,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.surfaceElevated
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected
                        ? AppColors.gold
                        : AppColors.border(0.2),
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Text(
                  category['label']!,
                  style: AppTheme.bodyMedium.copyWith(
                    fontSize: categoryFontSize,
                    color: isSelected
                        ? AppColors.gold
                        : AppColors.textMuted,
                    fontWeight: isSelected
                        ? FontWeight.w800
                        : FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final emptyStatePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 40.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 64.0,
    ).clamp(48.0, 80.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);

    final headingFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 20.0,
      min: 18.0,
      max: 24.0,
    );

    return Center(
      child: Padding(
        padding: EdgeInsets.all(emptyStatePadding),
        child: Column(
          children: [
            Icon(
              Icons.shopping_bag_outlined,
              size: iconSize,
              color: AppColors.textMuted,
            ),
            SizedBox(height: spacing16),
            Text(
              'No items found',
              style: AppTheme.heading3.copyWith(
                fontSize: headingFontSize,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
