import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/game_model.dart';
import 'package:battleasia_app/core/services/public_dashboard_service.dart';
import 'package:battleasia_app/data/models/public_dashboard_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_hero_banner.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/widgets/play/game_card.dart';
import 'package:battleasia_app/core/utils/link_utils.dart';
import 'package:battleasia_app/presentation/screens/play/match_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';

class PlayScreen extends StatefulWidget {
  const PlayScreen({super.key});

  @override
  State<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends State<PlayScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();
  final PublicDashboardService _dashboardService = PublicDashboardService();
  String _activeTab = 'tournament';
  List<GameModel> _games = [];
  Map<String, int> _liveCountByGame = {};
  Map<String, int> _participantsByGame = {};
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchGames();
    _fetchDashboardCounts();
  }

  Future<void> _fetchDashboardCounts() async {
    final result = await _dashboardService.fetchDashboard();
    if (!mounted || result['success'] != true) return;

    final stats = result['data'] as PublicDashboardStats?;
    if (stats == null) return;

    setState(() {
      _liveCountByGame = stats.liveCountByGame;
      _participantsByGame = stats.participantsByGame;
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchGames() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _gamesService.getGames();

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true) {
          _games = result['data'] as List<GameModel>? ?? [];
        } else {
          _errorMessage =
              result['message'] as String? ?? 'play.failedLoadGames'.tr();
        }
      });
    }
  }

  void _handleGameClick(String gameId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => MatchScreen(gameId: gameId)),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'play.failedLoadGames'.tr(),
              style: AppTheme.bodyLarge.copyWith(
                color: AppColors.textMuted,
                fontSize: ResponsiveUtils.getResponsiveFontSize(
                  context,
                  baseSize: 18.0,
                ),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            GoldButton(
              label: 'common.retry'.tr(),
              expanded: false,
              onPressed: _fetchGames,
            ),
          ],
        ),
      ),
    );
  }

  void _handleWatchLive() {
    LinkUtils.openYoutubeLive();
  }

  Widget _buildSkeletonCardWithSpinner() {
    return GlassCard(
      padding: EdgeInsets.zero,
      showGoldBar: true,
      child: ClipRRect(
        borderRadius: BorderRadius.zero,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/game2.webp',
              fit: BoxFit.cover,
            ),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.8),
                  ],
                ),
              ),
            ),
            const Center(
              child: CircularProgressIndicator(
                color: AppColors.gold,
                strokeWidth: 2.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Responsive padding
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final verticalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final gridSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final topPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);
    
    final bottomPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(60.0, 80.0);

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Scrollable content
          CustomScrollView(
            controller: _scrollController,
            physics: appScrollPhysics,
            slivers: [
              // Add top padding for header
              SliverToBoxAdapter(child: SizedBox(height: topPadding)),

              // Hero Banner
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: horizontalPadding,
                    vertical: verticalPadding,
                  ),
                  child: PlayHeroBanner(
                    slides: const [
                      {
                        'title': 'BATTLEASIA',
                        'description':
                            'eSports Tournament App for PUBG, FreeFire, Pubg Lite, COD, Fortnite & more + Admin panel + Website',
                        'imageUrl': 'assets/images/banner2.webp',
                      },
                      {
                        'title': 'BATTLEASIA',
                        'description':
                            'eSports Tournament App for PUBG, FreeFire, Pubg Lite, COD, Fortnite & more + Admin panel + Website',
                        'imageUrl': 'assets/images/banner4.webp',
                      },
                    ],
                    onWatchLive: _handleWatchLive,
                  ),
                ),
              ),

              // Tabs
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: PlayTabs(
                    tabs: [
                      {'label': 'play.tabTournament'.tr(), 'value': 'tournament'},
                      {'label': 'play.tabLive'.tr(), 'value': 'live'},
                    ],
                    activeTab: _activeTab,
                    onTabChanged: (tab) {
                      setState(() {
                        _activeTab = tab;
                      });
                    },
                  ),
                ),
              ),

              // Game Cards Grid or Loading/Error State
              if (_errorMessage != null)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _buildErrorState(),
                )
              else if (_isLoading)
                SliverPadding(
                  padding: EdgeInsets.all(horizontalPadding),
                  sliver: SliverGrid(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: gridSpacing,
                      mainAxisSpacing: gridSpacing,
                      childAspectRatio: 1.0,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => index == 0
                          ? _buildSkeletonCardWithSpinner()
                          : const SizedBox.shrink(),
                      childCount: 1,
                    ),
                  ),
                )
              else if (_games.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Text(
                      'play.noGames'.tr(),
                      style: AppTheme.bodyLarge.copyWith(
                        color: AppColors.textMuted,
                        fontSize: ResponsiveUtils.getResponsiveFontSize(
                          context,
                          baseSize: 18.0,
                        ),
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: EdgeInsets.all(horizontalPadding),
                  sliver: SliverGrid(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: gridSpacing,
                      mainAxisSpacing: gridSpacing,
                      childAspectRatio: 1.0,
                    ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final game = _games[index];
                      return GameCard(
                        title: game.name,
                        subTitle: game.genreLabel,
                        imageUrl: ImageUtils.getImageUrl(game.image),
                        comingSoon: game.comingSoon,
                        liveCount: _liveCountByGame[game.name] ?? 0,
                        playerCount: _participantsByGame[game.name] ?? 0,
                        liveBadgeLabel: 'play.liveBadge'.tr(),
                        joinLabel: 'play.joinLabel'.tr(),
                        onTap: () => _handleGameClick(game.id),
                      );
                    }, childCount: _games.length),
                  ),
                ),

              // Bottom padding for floating nav
              SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
            ],
          ),

          // Header overlay
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),

          // Bottom menu
          const FloatingBottomNav(),
        ],
      ),
    );
  }
}
