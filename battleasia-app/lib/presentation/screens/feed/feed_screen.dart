import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/feed_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/common/refresh_overlay.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_hub_panels.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_hub_tabs.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_item.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_composer.dart';
import 'package:battleasia_app/presentation/widgets/feed/stories_bar.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_detail_screen.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final ScrollController _scrollController = ScrollController();
  final FeedService _feedService = FeedService();
  final TextEditingController _searchController = TextEditingController();

  List<FeedModel> _feeds = [];
  List<FeedCategory> _categories = [];
  bool _loading = true;
  bool _loadingMore = false;
  int _currentPage = 1;
  bool _hasMore = true;
  String? _selectedCategoryId;
  String? _searchQuery;
  String _feedMode = 'all';
  bool _isRefreshing = false;
  double _overscrollAccumulator = 0.0;
  double _dragStartY = 0.0;
  bool _dragStartedAtTop = false;
  bool _dragStartedAtBottom = false;
  double _wheelAccumulator = 0.0;
  FeedHubSection _hubSection = FeedHubSection.feed;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _fetchFeeds();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchCategories() async {
    try {
      final result = await _feedService.getFeedCategories();
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final payload = data['results'] ?? data;
        final items = payload is List
            ? payload
            : (payload['results'] as List? ?? []);

        final categoriesList = items
            .map((item) => FeedCategory.fromJson(item as Map<String, dynamic>))
            .toList();

        if (mounted) {
          setState(() {
            _categories = categoriesList;
          });
        }
      }
    } catch (e) {
      // Silently fail for categories
    }
  }

  Future<void> _fetchFeeds({bool loadMore = false, bool silent = false}) async {
    if (loadMore && (!_hasMore || _loadingMore)) return;

    setState(() {
      if (loadMore) {
        _loadingMore = true;
      } else if (!silent) {
        _loading = true;
        _currentPage = 1;
        _hasMore = true;
      } else {
        _currentPage = 1;
        _hasMore = true;
      }
    });

    try {
      final requestedPage = loadMore ? _currentPage + 1 : 1;
      final result = await _feedService.getFeeds(
        page: requestedPage,
        limit: 20,
        categoryId: _selectedCategoryId,
        search: _searchQuery,
        feedMode: _feedMode,
      );

      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final payload = data['results'] ?? data;
        final items = payload is List
            ? payload
            : (payload['results'] as List? ?? []);

        final feedsList = items
            .map((item) => FeedModel.fromJson(item as Map<String, dynamic>))
            .toList();

        final total = (data['total'] as num?)?.toInt() ?? 0;
        final nextCount = loadMore ? _feeds.length + feedsList.length : feedsList.length;
        final hasMore = nextCount < total;

        if (mounted) {
          setState(() {
            if (loadMore) {
              _feeds.addAll(feedsList);
              _currentPage = requestedPage;
            } else {
              _feeds = feedsList;
              _currentPage = 1;
            }
            _hasMore = hasMore;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            if (!loadMore) {
              _feeds = [];
            }
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load feeds: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
        if (!loadMore) {
          setState(() {
            _feeds = [];
          });
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _loadingMore = false;
        });
      }
    }
  }

  Future<void> _handleLike(FeedModel feed) async {
    setState(() {
      _feeds = _feeds.map((f) {
        if (f.id == feed.id) {
          return f.copyWith(
            totalLikes: f.isLiked ? f.totalLikes - 1 : f.totalLikes + 1,
            isLiked: !f.isLiked,
          );
        }
        return f;
      }).toList();
    });

    try {
      await _feedService.toggleFeedLike(feed.id);
    } catch (_) {
      _fetchFeeds();
    }
  }

  Future<void> _handleSave(FeedModel feed) async {
    setState(() {
      _feeds = _feeds
          .map((f) => f.id == feed.id ? f.copyWith(isSaved: !f.isSaved) : f)
          .toList();
    });

    try {
      final result = await _feedService.toggleSaveFeed(feed.id);
      if (result['success'] == true && result['data'] is Map) {
        final saved = (result['data'] as Map)['isSaved'] == true;
        if (mounted) {
          setState(() {
            _feeds = _feeds
                .map((f) => f.id == feed.id ? f.copyWith(isSaved: saved) : f)
                .toList();
          });
        }
      }
    } catch (_) {
      _fetchFeeds();
    }
  }

  void _handleFeedMode(String mode) {
    if (_feedMode == mode) return;
    setState(() => _feedMode = mode);
    _fetchFeeds();
  }

  void _handleCategorySelect(String? categoryId) {
    setState(() {
      _selectedCategoryId = categoryId;
    });
    _fetchFeeds();
  }

  void _handleSearch(String query) {
    setState(() {
      _searchQuery = query.isEmpty ? null : query;
    });
    _fetchFeeds();
  }

  Future<void> _onRefresh() async {
    await Future.wait([
      _fetchCategories(),
      _fetchFeeds(silent: true),
    ]);
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
    // 드래그 시작 시점에 이미 경계에 있었을 때만 새로고침
    // dy > 0 = 아래로 끌기 → 최상단에서만
    // dy < 0 = 위로 끌기   → 최하단에서만
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
    setState(() {
      _isRefreshing = true;
      _loadingMore = false;
    });
    await _onRefresh();
    if (mounted) setState(() => _isRefreshing = false);
  }

  @override
  Widget build(BuildContext context) {
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

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
                      SizedBox(height: spacing16),
                      FeedHubTabs(
                        active: _hubSection,
                        onChanged: (section) {
                          setState(() => _hubSection = section);
                        },
                      ),
                      if (_hubSection == FeedHubSection.feed) ...[
                        SizedBox(height: spacing16),
                        const StoriesBar(),
                        SizedBox(height: spacing16),
                        FeedComposer(onPosted: () => _fetchFeeds()),
                        SizedBox(height: spacing16),
                        _buildFeedModes(context),
                        SizedBox(height: spacing16),
                        _buildSearchBar(context),
                        SizedBox(height: spacing16),
                        if (_categories.isNotEmpty) _buildCategories(context),
                        SizedBox(height: spacing16),
                      ] else
                        SizedBox(height: spacing16),
                    ],
                  ),
                ),
              ),
              if (_hubSection == FeedHubSection.feed) ...[
              // Feeds List
              if (_loading)
                SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(spacing24),
                      child: const CircularProgressIndicator(),
                    ),
                  ),
                )
              else if (_feeds.isEmpty)
                SliverToBoxAdapter(child: _buildEmptyState(context))
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    if (index == _feeds.length) {
                      // Load more indicator
                      if (_hasMore && !_loadingMore && !_isRefreshing) {
                        _fetchFeeds(loadMore: true);
                      }
                      if (_loadingMore && !_isRefreshing) {
                        return Center(
                          child: Padding(
                            padding: EdgeInsets.all(spacing24),
                            child: const CircularProgressIndicator(),
                          ),
                        );
                      }
                      return const SizedBox.shrink();
                    }

                    final feed = _feeds[index];
                    return Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: horizontalPadding,
                      ),
                      child: FeedItem(
                        feed: feed,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  FeedDetailScreen(feedId: feed.id),
                            ),
                          );
                        },
                        onLike: () => _handleLike(feed),
                        onSave: () => _handleSave(feed),
                        onShare: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('feedHub.shareSoon'.tr()),
                            ),
                          );
                        },
                      ),
                    );
                  }, childCount: _feeds.length + (_hasMore ? 1 : 0)),
                ),
              ] else
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: _buildHubPanel(),
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
      'feedHub.feed'.tr(),
      style: AppTheme.heading2.copyWith(
        color: AppColors.textPrimary,
        fontWeight: FontWeight.w800,
        fontSize: titleFontSize,
        letterSpacing: 1,
      ),
    );
  }

  Widget _buildFeedModes(BuildContext context) {
    const modes = [
      ('all', 'All'),
      ('following', 'Following'),
      ('trending', 'Trending'),
      ('latest', 'Latest'),
      ('recommended', 'For you'),
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: modes.map((m) {
          final selected = _feedMode == m.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => _handleFeedMode(m.$1),
              borderRadius: BorderRadius.circular(2),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.gold.withValues(alpha: 0.15)
                      : Colors.transparent,
                  border: Border.all(
                    color: selected ? AppColors.gold : AppColors.border(0.2),
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Text(
                  m.$2,
                  style: AppTheme.bodySmall.copyWith(
                    color: selected ? AppColors.gold : AppColors.textMuted,
                    fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    final searchPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 16.0);

    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 24.0);

    final fontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.12)),
      ),
      child: TextField(
        controller: _searchController,
        style: AppTheme.bodyMedium.copyWith(
          fontSize: fontSize,
          color: AppColors.textPrimary,
        ),
        decoration: InputDecoration(
          hintText: 'feedHub.searchHint'.tr(),
          hintStyle: AppTheme.bodySmall.copyWith(
            fontSize: fontSize,
            color: AppColors.textMuted,
          ),
          prefixIcon: Icon(
            Icons.search,
            size: iconSize,
            color: AppColors.textMuted,
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: Icon(
                    Icons.clear,
                    size: iconSize,
                    color: AppColors.textMuted,
                  ),
                  onPressed: () {
                    _searchController.clear();
                    _handleSearch('');
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: EdgeInsets.all(searchPadding),
        ),
        onChanged: _handleSearch,
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
      baseSize: 10.0,
    ).clamp(8.0, 12.0);

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
        children: [
          // All category
          _buildCategoryChip(
            context,
            label: 'All',
            isSelected: _selectedCategoryId == null,
            onTap: () => _handleCategorySelect(null),
            paddingH: categoryPaddingH,
            paddingV: categoryPaddingV,
            fontSize: categoryFontSize,
          ),
          SizedBox(width: spacing8),
          // Category chips
          ..._categories.map((category) {
            return Padding(
              padding: EdgeInsets.only(right: spacing8),
              child: _buildCategoryChip(
                context,
                label: category.name,
                isSelected: _selectedCategoryId == category.id,
                onTap: () => _handleCategorySelect(category.id),
                paddingH: categoryPaddingH,
                paddingV: categoryPaddingV,
                fontSize: categoryFontSize,
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required double paddingH,
    required double paddingV,
    required double fontSize,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(2),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: paddingH, vertical: paddingV),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.gold.withValues(alpha: 0.15)
              : AppColors.surfaceElevated.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(2),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.border(0.2),
          ),
        ),
        child: Text(
          label,
          style: AppTheme.bodyMedium.copyWith(
            fontSize: fontSize,
            color: isSelected ? AppColors.gold : AppColors.textMuted,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
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
              Icons.article_outlined,
              size: iconSize,
              color: AppColors.textMuted,
            ),
            SizedBox(height: spacing16),
            Text(
              'feedHub.noFeeds'.tr(),
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

  Widget _buildHubPanel() {
    switch (_hubSection) {
      case FeedHubSection.explore:
        return const FeedExplorePanel();
      case FeedHubSection.reels:
        return const FeedReelsPanel();
      case FeedHubSection.saved:
        return const FeedSavedPanel();
      case FeedHubSection.messages:
        return const FeedMessagesPanel();
      case FeedHubSection.feed:
        return const SizedBox.shrink();
    }
  }
}
