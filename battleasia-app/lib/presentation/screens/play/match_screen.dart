import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/widgets/play/match_card.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/play/match_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/play/match_result_screen.dart';

class MatchScreen extends StatefulWidget {
  final String gameId;

  const MatchScreen({super.key, required this.gameId});

  @override
  State<MatchScreen> createState() => _MatchScreenState();
}

class _MatchScreenState extends State<MatchScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();
  String _activeTab = 'ongoing';
  List<MatchModel> _matches = [];
  bool _isLoading = false;
  String? _joiningMatchId;
  MatchModel? _selectedMatchForRoomDetails;
  // The match waiting for the user to confirm before joining.
  MatchModel? _confirmMatch;

  @override
  void initState() {
    super.initState();
    _fetchMatches();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMatches() async {
    setState(() {
      _isLoading = true;
    });

    final result = await _gamesService.getMatches(gameId: widget.gameId);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true) {
          final matchesData = result['data'] as List<dynamic>?;
          if (matchesData != null) {
            _matches = matchesData
                .map(
                  (matchJson) =>
                      MatchModel.fromJson(matchJson as Map<String, dynamic>),
                )
                .toList();
          } else {
            _matches = [];
          }
        } else {
          // Show error via snackbar
          final errorMsg =
              result['message'] as String? ?? 'Failed to load matches';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(errorMsg),
              backgroundColor: Colors.red,
            ),
          );
          _matches = [];
        }
      });
    }
  }

  Future<void> _handleJoinMatch(MatchModel match) async {
    if (_joiningMatchId != null) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    final balance = user?.balance ?? 0.0;
    final isPremiumUser = user?.isPremiumActive ?? false;

    // Block non-premium users from joining premium-only matches
    if (match.premiumOnly && !isPremiumUser) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('This match is available for premium members only'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Balance check is shown inside the confirmation dialog.
    // Show confirmation dialog before actually joining.
    setState(() {
      _confirmMatch = match;
    });
  }

  /// Called when the user taps "Join" inside the confirmation dialog.
  Future<void> _handleConfirmJoin() async {
    final match = _confirmMatch;
    if (match == null || _joiningMatchId != null) return;

    setState(() {
      _confirmMatch = null;
      _joiningMatchId = match.id;
    });

    final result = await _gamesService.joinMatch(match.id);

    if (mounted) {
      setState(() {
        _joiningMatchId = null;
      });

      if (result['success'] == true) {
        // Update balance in provider if returned.
        final updatedBalance = result['data']?['balance'];
        if (updatedBalance != null && updatedBalance is num) {
          Provider.of<AuthProvider>(context, listen: false)
              .updateBalance(updatedBalance.toDouble());
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Joined match successfully'),
            backgroundColor: Colors.green,
          ),
        );

        _fetchMatches();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              result['message'] as String? ?? 'Failed to join match',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _handleCloseConfirm() {
    setState(() {
      _confirmMatch = null;
    });
  }

  void _handleWatchLive() {
    // TODO: Implement watch live functionality
  }

  void _handleShowRoomDetails(MatchModel match) {
    setState(() {
      _selectedMatchForRoomDetails = match;
    });
  }

  void _handleCloseRoomDetails() {
    setState(() {
      _selectedMatchForRoomDetails = null;
    });
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard'),
        duration: const Duration(seconds: 2),
        backgroundColor: AppTheme.accentColor,
      ),
    );
  }

  Map<String, List<MatchModel>> _categorizeMatches() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final groups = <String, List<MatchModel>>{
      'ongoing': [],
      'upcoming': [],
      'results': [],
    };

    for (final match in _matches) {
      if (match.status == 'complete' || match.status == 'cancel') {
        groups['results']!.add(match);
        continue;
      }

      if (match.matchSchedule != null) {
        try {
          final scheduleTime = DateTime.parse(
            match.matchSchedule!,
          ).millisecondsSinceEpoch;
          if (scheduleTime > now) {
            groups['upcoming']!.add(match);
          } else {
            groups['ongoing']!.add(match);
          }
        } catch (e) {
          groups['results']!.add(match);
        }
      } else {
        groups['results']!.add(match);
      }
    }

    return groups;
  }

  Widget _buildMatchCard(MatchModel match, bool showLive, {bool isResult = false}) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isPremiumUser = authProvider.user?.isPremiumActive ?? false;
    
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);

    void goToResult() {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => MatchResultScreen(matchId: match.id),
        ),
      );
    }

    final card = Padding(
      padding: EdgeInsets.fromLTRB(
        horizontalPadding,
        8,
        horizontalPadding,
        0,
      ),
      child: MatchCard(
        match: match,
        onWatchLive: isResult ? null : _handleWatchLive,
        onJoin: isResult ? () {} : () => _handleJoinMatch(match),
        onShowRoomDetails: isResult ? null : () => _handleShowRoomDetails(match),
        onMatchNameTap: isResult
            ? goToResult
            : () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MatchDetailScreen(matchId: match.id),
                  ),
                );
              },
        joining: _joiningMatchId == match.id,
        canJoin: !match.premiumOnly || isPremiumUser,
        isJoined: match.isJoined,
        showLive: isResult ? false : showLive,
        isPremiumUser: isPremiumUser,
      ),
    );

    if (isResult) {
      return GestureDetector(
        onTap: goToResult,
        child: card,
      );
    }
    return card;
  }

  Widget _buildMatchGrid(List<MatchModel> matches, {bool showLive = false, bool isResult = false}) {
    if (_isLoading) {
      return SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(
              ResponsiveUtils.getResponsiveSpacing(
                context,
                baseSize: 32.0,
              ).clamp(24.0, 32.0),
            ),
            child: const CircularProgressIndicator(color: AppTheme.accentColor),
          ),
        ),
      );
    }

    if (matches.isEmpty) {
      return SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(
              ResponsiveUtils.getResponsiveSpacing(
                context,
                baseSize: 32.0,
              ).clamp(24.0, 32.0),
            ),
            child: Text(
              'No matches available',
              style: AppTheme.bodyLarge.copyWith(
                color: AppTheme.textSecondary,
                fontSize: ResponsiveUtils.getResponsiveFontSize(
                  context,
                  baseSize: 18.0,
                ),
              ),
            ),
          ),
        ),
      );
    }

    final cardHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 280.0,
    ).clamp(250.0, 280.0);
    
    return SliverFixedExtentList(
      itemExtent: cardHeight,
      delegate: SliverChildBuilderDelegate((context, index) {
        final match = matches[index];
        return _buildMatchCard(match, showLive, isResult: isResult);
      }, childCount: matches.length),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categorizedMatches = _categorizeMatches();
    final ongoingCount = categorizedMatches['ongoing']!.length;
    final upcomingCount = categorizedMatches['upcoming']!.length;
    final resultsCount = categorizedMatches['results']!.length;
    
    // Responsive sizes
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final verticalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final topPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);
    
    final tabFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 12.0,
      max: 18.0,
    );
    
    final backFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 20.0,
    );

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

              // Back button
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: horizontalPadding,
                    vertical: verticalPadding,
                  ),
                  child: InkWell(
                    onTap: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const PlayScreen(),
                        ),
                      );
                    },
                    child: Row(
                      children: [
                        Icon(
                          Icons.arrow_back,
                          color: AppTheme.textPrimary,
                          size: ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 24.0,
                          ).clamp(20.0, 24.0),
                        ),
                        SizedBox(
                          width: ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 8.0,
                          ).clamp(4.0, 8.0),
                        ),
                        Text(
                          'Back',
                          style: AppTheme.bodyLarge.copyWith(
                            color: AppTheme.textPrimary,
                            fontSize: backFontSize,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Tabs
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: PlayTabs(
                    fontSize: tabFontSize,
                    tabs: [
                      {'label': 'ONGOING ($ongoingCount)', 'value': 'ongoing'},
                      {
                        'label': 'UPCOMING ($upcomingCount)',
                        'value': 'upcoming',
                      },
                      {'label': 'RESULTS ($resultsCount)', 'value': 'results'},
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

              // Match grid based on active tab
              _activeTab == 'ongoing'
                  ? _buildMatchGrid(
                      categorizedMatches['ongoing']!,
                      showLive: true,
                    )
                  : _activeTab == 'upcoming'
                  ? _buildMatchGrid(categorizedMatches['upcoming']!)
                  : _buildMatchGrid(categorizedMatches['results']!, isResult: true),

              // Extra bottom padding so the last card's button is never hidden
              // behind the floating bottom navigation bar.
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 90 + MediaQuery.of(context).padding.bottom,
                ),
              ),
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

          // Confirm join dialog
          if (_confirmMatch != null)
            _buildConfirmJoinDialog(_confirmMatch!),

          // Room Details Dialog
          if (_selectedMatchForRoomDetails != null)
            _buildRoomDialog(_selectedMatchForRoomDetails!),
        ],
      ),
    );
  }

  Widget _buildConfirmJoinDialog(MatchModel match) {
    // Format schedule date the same way as the web frontend.
    String formatSchedule(String? raw) {
      if (raw == null) return '-';
      try {
        final dt = DateTime.parse(raw).toLocal();
        final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
        final m = dt.minute.toString().padLeft(2, '0');
        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
        return '${dt.day.toString().padLeft(2, '0')}/'
            '${dt.month.toString().padLeft(2, '0')}/'
            '${dt.year} $h:$m $ampm';
      } catch (_) {
        return raw;
      }
    }

    // Try to load the local map image; fall back gracefully if not found.
    Widget mapImage(String? mapName) {
      if (mapName == null || mapName.isEmpty) return const SizedBox.shrink();
      // Asset names are title-cased (e.g. "Erangel.webp").
      final assetPath =
          'assets/images/map/${mapName[0].toUpperCase()}${mapName.substring(1)}.webp';
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Stack(
          children: [
            Image.asset(
              assetPath,
              width: double.infinity,
              height: 180,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
            // Map name label at bottom-left, same as web.
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.55),
                ),
                child: Text(
                  mapName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }

    Widget detailRow(String label, Widget value) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 12,
              ),
            ),
            value,
          ],
        ),
      );
    }

    Widget coinValue(double amount) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(
            'assets/images/currency.webp',
            width: 16,
            height: 16,
            errorBuilder: (_, __, ___) => const SizedBox.shrink(),
          ),
          const SizedBox(width: 4),
          Text(
            amount.toStringAsFixed(0),
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
        ],
      );
    }

    Widget detailText(String value) => Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
            color: Colors.black87,
          ),
        );

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Title
                const Text(
                  'Confirm Join Match',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 8),

                // Subtitle: Join "name" for X?
                Row(
                  children: [
                    Text(
                      'Join "${match.matchName}" for ',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                    Image.asset(
                      'assets/images/currency.webp',
                      width: 16,
                      height: 16,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                    const SizedBox(width: 3),
                    Text(
                      '${match.entryFee.toStringAsFixed(0)} ?',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Details table
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4F6F8),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      detailRow('Game', detailText(match.gameName.isNotEmpty ? match.gameName : '-')),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Schedule', detailText(formatSchedule(match.matchSchedule))),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Entry Fee', coinValue(match.entryFee)),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Per Kill', coinValue(match.perKill)),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Team Type', detailText(match.teamType ?? '-')),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Players', detailText(match.totalPlayer.toString())),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Map', detailText(match.map ?? '-')),
                      Divider(height: 1, color: Colors.grey[300]),
                      detailRow('Type', detailText(match.matchType ?? '-')),
                      if (match.prizeDescription != null &&
                          match.prizeDescription!.isNotEmpty) ...[
                        Divider(height: 1, color: Colors.grey[300]),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Prize',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                match.prizeDescription!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Balance status row
                Builder(builder: (context) {
                  final authProvider =
                      Provider.of<AuthProvider>(context, listen: false);
                  final userBalance =
                      authProvider.user?.balance ?? 0.0;
                  final insufficient =
                      match.entryFee > userBalance;
                  return Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: insufficient
                          ? Colors.red.shade50
                          : Colors.green.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: insufficient
                            ? Colors.red.shade200
                            : Colors.green.shade200,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Your Balance',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        Row(
                          children: [
                            Image.asset(
                              'assets/images/currency.webp',
                              width: 14,
                              height: 14,
                              errorBuilder: (_, __, ___) =>
                                  const SizedBox.shrink(),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              userBalance.toStringAsFixed(0),
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: insufficient
                                    ? Colors.red.shade700
                                    : Colors.green.shade700,
                              ),
                            ),
                            if (insufficient) ...
                              [
                                const SizedBox(width: 6),
                                Text(
                                  '— Insufficient',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.red.shade700,
                                  ),
                                ),
                              ],
                          ],
                        ),
                      ],
                    ),
                  );
                }),

                const SizedBox(height: 16),

                // Action buttons
                Builder(builder: (context) {
                  final authProvider =
                      Provider.of<AuthProvider>(context, listen: false);
                  final userBalance =
                      authProvider.user?.balance ?? 0.0;
                  final insufficient = match.entryFee > userBalance;
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton(
                        onPressed: _handleCloseConfirm,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.black87,
                          side: const BorderSide(color: Colors.black26),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        child: const Text('Cancel'),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: (_joiningMatchId != null || insufficient)
                            ? null
                            : _handleConfirmJoin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black87,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 28, vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        child: _joiningMatchId != null
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Join'),
                      ),
                    ],
                  );
                }),

                // Map image — placed below the buttons so Cancel/Join are
                // always visible without scrolling. Users scroll down to view
                // the map if they want to.
                if (match.map != null && match.map!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  mapImage(match.map),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomDialog(MatchModel match) {
    final dialogPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final contentPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);
    
    final closeButtonSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(28.0, 32.0);
    
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 36.0,
      min: 24.0,
      max: 40.0,
    );
    
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 20.0,
    );
    
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );
    
    final maxWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 500.0,
    ).clamp(300.0, 500.0);
    
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.symmetric(horizontal: dialogPadding),
      child: Container(
        constraints: BoxConstraints(maxWidth: maxWidth),
        margin: const EdgeInsets.only(top: 0),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E).withOpacity(0.98),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            // Close button
            Positioned(
              top: contentPadding * 0.67,
              right: contentPadding * 0.67,
              child: SizedBox(
                width: closeButtonSize,
                height: closeButtonSize,
                child: IconButton(
                  icon: Icon(
                    Icons.close,
                    color: Colors.white,
                    size: closeButtonSize * 0.6,
                  ),
                  onPressed: _handleCloseRoomDetails,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),
            ),

            // Content
            Padding(
              padding: EdgeInsets.all(contentPadding),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  // Title
                  Text(
                    'Room Details',
                    style: AppTheme.heading2.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: titleFontSize,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 24.0,
                    ).clamp(16.0, 24.0),
                  ),

                  // Room ID Section
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Room ID',
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: labelFontSize,
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveUtils.getResponsiveSpacing(
                          context,
                          baseSize: 8.0,
                        ).clamp(4.0, 8.0),
                      ),
                      Container(
                        padding: EdgeInsets.all(
                          ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 16.0,
                          ).clamp(12.0, 16.0),
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                match.roomId ?? 'N/A',
                                style: AppTheme.bodyLarge.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'monospace',
                                  fontSize: bodyFontSize,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy, color: Colors.blue),
                              onPressed: () {
                                if (match.roomId != null) {
                                  _copyToClipboard(match.roomId!, 'Room ID');
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 16.0,
                    ).clamp(12.0, 16.0),
                  ),

                  // Password Section
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Password',
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: labelFontSize,
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveUtils.getResponsiveSpacing(
                          context,
                          baseSize: 8.0,
                        ).clamp(4.0, 8.0),
                      ),
                      Container(
                        padding: EdgeInsets.all(
                          ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 16.0,
                          ).clamp(12.0, 16.0),
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                match.password ?? 'N/A',
                                style: AppTheme.bodyLarge.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'monospace',
                                  fontSize: bodyFontSize,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy, color: Colors.blue),
                              onPressed: () {
                                if (match.password != null) {
                                  _copyToClipboard(match.password!, 'Password');
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 16.0,
                    ).clamp(12.0, 16.0),
                  ),

                  // Match Name
                  Container(
                    padding: EdgeInsets.all(
                      ResponsiveUtils.getResponsiveSpacing(
                        context,
                        baseSize: 16.0,
                      ).clamp(12.0, 16.0),
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF8C42).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color: const Color(0xFFFF8C42).withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'Match',
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: labelFontSize,
                          ),
                        ),
                        SizedBox(
                          height: ResponsiveUtils.getResponsiveSpacing(
                            context,
                            baseSize: 4.0,
                          ).clamp(2.0, 4.0),
                        ),
                        Text(
                          match.matchName,
                          style: AppTheme.heading3.copyWith(
                            color: const Color(0xFFFF8C42),
                            fontWeight: FontWeight.bold,
                            fontSize: ResponsiveUtils.getResponsiveFontSize(
                              context,
                              baseSize: 28.0,
                              min: 20.0,
                              max: 32.0,
                            ),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}



