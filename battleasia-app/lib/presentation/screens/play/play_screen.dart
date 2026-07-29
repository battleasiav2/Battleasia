import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/game_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_hero_banner.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/widgets/play/game_card.dart';
import 'package:battleasia_app/presentation/screens/play/match_screen.dart';

class PlayScreen extends StatefulWidget {
  const PlayScreen({super.key});

  @override
  State<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends State<PlayScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();
  String _activeTab = 'tournament';
  List<GameModel> _games = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchGames();
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
              result['message'] as String? ?? 'Failed to load games';
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
              color: AppTheme.textSecondary,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'Failed to load games',
              style: AppTheme.bodyLarge.copyWith(
                color: AppTheme.textSecondary,
                fontSize: ResponsiveUtils.getResponsiveFontSize(
                  context,
                  baseSize: 18.0,
                ),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _fetchGames,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentColor,
                padding: EdgeInsets.symmetric(
                  horizontal: ResponsiveUtils.getResponsiveSpacing(
                    context,
                    baseSize: 24.0,
                  ).clamp(16.0, 24.0),
                  vertical: ResponsiveUtils.getResponsiveSpacing(
                    context,
                    baseSize: 12.0,
                  ).clamp(8.0, 12.0),
                ),
              ),
              child: Text(
                'Retry',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: ResponsiveUtils.getResponsiveFontSize(
                    context,
                    baseSize: 16.0,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleWatchLive() {
    // TODO: Implement watch live functionality
  }

  Widget _buildSkeletonCardWithSpinner() {
    return Card(
      color: AppTheme.surfaceColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Stack(
          children: [
            // Background image immediately visible
            Positioned.fill(
              child: Image.asset(
                'assets/images/game2.webp',
                fit: BoxFit.cover,
              ),
            ),
            // Dark gradient overlay
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.8),
                    ],
                  ),
                ),
              ),
            ),
            // Spinner centered on card
            const Positioned.fill(
              child: Center(
                child: CircularProgressIndicator(
                  color: AppTheme.accentColor,
                  strokeWidth: 2.5,
                ),
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
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Scrollable content
          CustomScrollView(
            controller: _scrollController,
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
                        'title': 'BATTLEMANIA',
                        'description':
                            'eSports Tournament App for PUBG, FreeFire, Pubg Lite, COD, Fortnite & more + Admin panel + Website',
                        'imageUrl': 'assets/images/banner2.webp',
                      },
                      {
                        'title': 'BATTLEMANIA',
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
                    tabs: const [
                      {'label': 'Tournament', 'value': 'tournament'},
                      {'label': 'Live', 'value': 'live'},
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
                      childAspectRatio: 0.75,
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
                      'No games available',
                      style: AppTheme.bodyLarge.copyWith(
                        color: AppTheme.textSecondary,
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
                      childAspectRatio: 0.75,
                    ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final game = _games[index];
                      return GameCard(
                        title: game.name,
                        subTitle: game.packageName,
                        imageUrl: ImageUtils.getImageUrl(game.image),
                        logo: ImageUtils.getImageUrl(game.logo),
                        comingSoon: game.comingSoon,
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
