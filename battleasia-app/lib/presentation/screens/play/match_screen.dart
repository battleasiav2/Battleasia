import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/match_capacity_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/widgets/play/match_card.dart';
import 'package:battleasia_app/presentation/widgets/play/join_arena_card.dart';
import 'package:battleasia_app/presentation/widgets/play/match_spots_progress.dart';
import 'package:battleasia_app/core/utils/link_utils.dart';
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
  bool _roomLoading = false;
  Map<String, dynamic>? _roomCredentials;
  String? _roomError;
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

    if (!isMatchJoinableByCapacity(
      participantsCount: match.participantsCount,
      totalPlayer: match.totalPlayer,
    )) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('match.matchFullToast'.tr()),
          backgroundColor: Colors.red,
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
    LinkUtils.openYoutubeLive();
  }

  void _handleShowRoomDetails(MatchModel match) {
    setState(() {
      _selectedMatchForRoomDetails = match;
      _roomCredentials = null;
      _roomError = null;
      _roomLoading = false;
    });
    _loadRoomCredentials(match);
  }

  void _handleCloseRoomDetails() {
    setState(() {
      _selectedMatchForRoomDetails = null;
      _roomLoading = false;
      _roomCredentials = null;
      _roomError = null;
    });
  }

  Future<void> _loadRoomCredentials(MatchModel match) async {
    final existingId = match.roomId?.trim() ?? '';
    if (existingId.isNotEmpty) {
      if (!mounted) return;
      setState(() {
        _roomCredentials = {
          'roomId': match.roomId ?? '',
          'password': match.password ?? '',
          'matchName': match.matchName,
          'map': match.map,
        };
        _roomLoading = false;
        _roomError = null;
      });
      return;
    }

    setState(() {
      _roomLoading = true;
      _roomError = null;
    });

    final result = await _gamesService.getMatchRoomCredentials(match.id);

    if (!mounted || _selectedMatchForRoomDetails?.id != match.id) return;

    if (result['success'] == true && result['data'] is Map) {
      final data = Map<String, dynamic>.from(result['data'] as Map);
      setState(() {
        _roomCredentials = {
          'roomId': (data['roomId'] ?? '').toString(),
          'password': (data['password'] ?? '').toString(),
          'matchName': (data['matchName'] ?? match.matchName).toString(),
          'map': data['map']?.toString() ?? match.map,
        };
        _roomLoading = false;
        _roomError = null;
      });
    } else {
      setState(() {
        _roomLoading = false;
        _roomError =
            result['message'] as String? ?? 'Failed to load room credentials';
        _roomCredentials = null;
      });
    }
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

    void goToResult() {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => MatchResultScreen(matchId: match.id),
        ),
      );
    }

    final card = MatchCard(
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
      canJoin: isMatchJoinableByCapacity(
            participantsCount: match.participantsCount,
            totalPlayer: match.totalPlayer,
          ) &&
          (!match.premiumOnly || isPremiumUser),
      isJoined: match.isJoined,
      showLive: isResult ? false : showLive,
      isPremiumUser: isPremiumUser,
    );

    if (isResult) {
      return GestureDetector(onTap: goToResult, child: card);
    }
    return card;
  }

  Widget _buildMatchGrid(List<MatchModel> matches, {bool showLive = false, bool isResult = false}) {
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(10.0, 16.0);
    final gridGap = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 10.0,
    ).clamp(8.0, 12.0);

    if (_isLoading) {
      return SliverPadding(
        padding: EdgeInsets.fromLTRB(horizontalPadding, 12, horizontalPadding, 0),
        sliver: SliverGrid(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: gridGap,
            mainAxisSpacing: gridGap,
            childAspectRatio: 0.62,
          ),
          delegate: SliverChildBuilderDelegate(
            (context, index) => const _MatchCardSkeleton(),
            childCount: 4,
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

    return SliverPadding(
      padding: EdgeInsets.fromLTRB(horizontalPadding, 12, horizontalPadding, 0),
      sliver: SliverGrid(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: gridGap,
          mainAxisSpacing: gridGap,
          childAspectRatio: 0.62,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildMatchCard(
            matches[index],
            showLive,
            isResult: isResult,
          ),
          childCount: matches.length,
        ),
      ),
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
      backgroundColor: AppColors.pageBg,
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
    String formatSchedule(String? raw) {
      if (raw == null) return '-';
      try {
        final dt = DateTime.parse(raw).toLocal();
        final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
        final m = dt.minute.toString().padLeft(2, '0');
        final ampm = dt.hour >= 12 ? 'PM' : 'AM';
        return '${dt.day.toString().padLeft(2, "0")}/'
            '${dt.month.toString().padLeft(2, "0")}/'
            '${dt.year} $h:$m $ampm';
      } catch (_) {
        return raw;
      }
    }

    Widget mapImage(String? mapName) {
      if (mapName == null || mapName.isEmpty) return const SizedBox.shrink();
      final assetPath =
          'assets/images/map/${mapName[0].toUpperCase()}${mapName.substring(1)}.webp';
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            Image.asset(
              assetPath,
              width: double.infinity,
              height: 160,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                color: Colors.black.withValues(alpha: 0.55),
                child: Text(
                  'MAP ${mapName.toUpperCase()}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }

    Widget detailCell(String label, String value) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.55),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w700,
              height: 1.35,
            ),
          ),
        ],
      );
    }

    Widget coinRow(double amount, {double size = 14}) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(
            'assets/images/currency.webp',
            width: size,
            height: size,
            errorBuilder: (_, __, ___) => const SizedBox.shrink(),
          ),
          const SizedBox(width: 4),
          Text(
            amount.toStringAsFixed(0),
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: size + 1,
              color: Colors.white,
            ),
          ),
        ],
      );
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userBalance = authProvider.user?.balance ?? 0.0;
    final insufficient = match.entryFee > userBalance;
    final isFull = !isMatchJoinableByCapacity(
      participantsCount: match.participantsCount,
      totalPlayer: match.totalPlayer,
    );

    final detailPairs = <List<String>>[
      ['Game', match.gameName.isNotEmpty ? match.gameName : '-'],
      ['Schedule', formatSchedule(match.matchSchedule)],
      ['Team Type', match.teamType ?? '-'],
      ['Map', match.map ?? '-'],
      ['Type', match.matchType ?? '-'],
    ];

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 720),
        decoration: BoxDecoration(
          color: const Color(0xFF161618),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
          boxShadow: const [
            BoxShadow(color: Colors.black54, blurRadius: 40, offset: Offset(0, 18)),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 3,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.transparent,
                    AppColors.gold,
                    Colors.transparent,
                  ],
                ),
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'SECURE ENTRY',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.1,
                        color: AppColors.gold.withValues(alpha: 0.9),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'CONFIRM ENTRY',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.4,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Review entry details for "${match.matchName}".',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.62),
                        height: 1.45,
                      ),
                    ),
                    if (match.map != null && match.map!.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      JoinArenaCard(
                        padding: EdgeInsets.zero,
                        child: mapImage(match.map),
                      ),
                    ],
                    const SizedBox(height: 12),
                    JoinArenaCard(
                      child: Column(
                        children: [
                          for (var i = 0; i < detailPairs.length; i += 2)
                            Padding(
                              padding: EdgeInsets.only(
                                bottom: i + 2 < detailPairs.length ? 12 : 0,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: detailCell(
                                      detailPairs[i][0],
                                      detailPairs[i][1],
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: i + 1 < detailPairs.length
                                        ? detailCell(
                                            detailPairs[i + 1][0],
                                            detailPairs[i + 1][1],
                                          )
                                        : const SizedBox.shrink(),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: JoinArenaCard(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'ENTRY',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.7),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.7,
                                  ),
                                ),
                                coinRow(match.entryFee),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: JoinArenaCard(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'PER KILL',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.7),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.7,
                                  ),
                                ),
                                coinRow(match.perKill),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (match.prizeDescription != null &&
                        match.prizeDescription!.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      JoinArenaCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PRIZE',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.7),
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.7,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              match.prizeDescription!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    MatchSpotsProgress(
                      participantsCount: match.participantsCount,
                      totalPlayer: match.totalPlayer,
                      variant: MatchSpotsProgressVariant.featured,
                    ),
                    const SizedBox(height: 12),
                    JoinArenaCard(
                      accent: insufficient
                          ? JoinArenaCardAccent.error
                          : JoinArenaCardAccent.success,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'match.yourBalance'.tr(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Row(
                            children: [
                              coinRow(userBalance, size: 14),
                              if (insufficient) ...[
                                const SizedBox(width: 6),
                                Text(
                                  '— Insufficient',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.red.shade400,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _handleCloseConfirm,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: BorderSide(
                                color: Colors.white.withValues(alpha: 0.18),
                              ),
                              minimumSize: const Size.fromHeight(44),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: (_joiningMatchId != null ||
                                    insufficient ||
                                    isFull)
                                ? null
                                : _handleConfirmJoin,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.gold,
                              side: BorderSide(
                                color: AppColors.gold.withValues(alpha: 0.85),
                              ),
                              backgroundColor:
                                  Colors.black.withValues(alpha: 0.35),
                              minimumSize: const Size.fromHeight(44),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _joiningMatchId != null
                                ? SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.gold,
                                    ),
                                  )
                                : Text(
                                    isFull
                                        ? 'match.matchFull'.tr()
                                        : 'Join Match',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                          ),
                        ),
                      ],
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

  Widget _buildRoomDialog(MatchModel match) {
    final dialogPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);

    final contentPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(16.0, 24.0);

    final maxWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 420.0,
    ).clamp(300.0, 440.0);

    final roomId = (_roomCredentials?['roomId'] as String?)?.trim().isNotEmpty == true
        ? (_roomCredentials!['roomId'] as String)
        : (match.roomId ?? '');
    final password =
        (_roomCredentials?['password'] as String?)?.trim().isNotEmpty == true
            ? (_roomCredentials!['password'] as String)
            : (match.password ?? '');
    final matchName =
        (_roomCredentials?['matchName'] as String?)?.trim().isNotEmpty == true
            ? (_roomCredentials!['matchName'] as String)
            : match.matchName;
    final mapName = (_roomCredentials?['map'] as String?) ?? match.map;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.symmetric(horizontal: dialogPadding),
      child: Container(
        constraints: BoxConstraints(maxWidth: maxWidth),
        decoration: BoxDecoration(
          color: const Color(0xFF060607),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 3,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                gradient: LinearGradient(
                  colors: [
                    Colors.transparent,
                    AppColors.gold.withValues(alpha: 0.95),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(
                contentPadding,
                contentPadding * 0.85,
                contentPadding * 0.55,
                contentPadding,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'JOINED ACCESS',
                              style: TextStyle(
                                color: AppColors.gold.withValues(alpha: 0.9),
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Room Credentials',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _handleCloseRoomDetails,
                        icon: Icon(
                          Icons.close,
                          color: Colors.white.withValues(alpha: 0.7),
                          size: 20,
                        ),
                        style: IconButton.styleFrom(
                          side: BorderSide(
                            color: Colors.white.withValues(alpha: 0.12),
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_roomLoading)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: AppColors.gold,
                        ),
                      ),
                    )
                  else if (_roomError != null)
                    JoinArenaCard(
                      accent: JoinArenaCardAccent.error,
                      child: Column(
                        children: [
                          Text(
                            _roomError!,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: () => _loadRoomCredentials(match),
                            child: Text(
                              'common.retry'.tr(),
                              style: TextStyle(
                                color: AppColors.gold,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else ...[
                    JoinArenaCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'MATCH',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.45),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            matchName,
                            style: TextStyle(
                              color: AppColors.gold,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          if (mapName != null && mapName.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              'Map: $mapName',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildRoomCredentialRow(
                      label: 'Room ID',
                      value: roomId.isEmpty ? 'N/A' : roomId,
                      icon: Icons.videogame_asset_outlined,
                      canCopy: roomId.isNotEmpty,
                    ),
                    const SizedBox(height: 10),
                    _buildRoomCredentialRow(
                      label: 'Password',
                      value: password.isEmpty ? 'N/A' : password,
                      icon: Icons.lock_outline,
                      canCopy: password.isNotEmpty,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoomCredentialRow({
    required String label,
    required String value,
    required IconData icon,
    required bool canCopy,
  }) {
    return JoinArenaCard(
      padding: const EdgeInsets.fromLTRB(14, 14, 10, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: AppColors.gold),
              const SizedBox(width: 6),
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.45),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(
                    color: canCopy
                        ? Colors.white
                        : Colors.white.withValues(alpha: 0.45),
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    fontFamily: 'monospace',
                    letterSpacing: 0.4,
                  ),
                ),
              ),
              IconButton(
                onPressed: canCopy ? () => _copyToClipboard(value, label) : null,
                icon: Icon(
                  Icons.copy,
                  size: 16,
                  color: canCopy
                      ? AppColors.gold
                      : Colors.white.withValues(alpha: 0.25),
                ),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.gold.withValues(alpha: 0.08),
                  side: BorderSide(
                    color: AppColors.gold.withValues(alpha: 0.35),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MatchCardSkeleton extends StatelessWidget {
  const _MatchCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF161618),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        children: [
          Container(height: 2, color: AppColors.gold.withValues(alpha: 0.35)),
          Expanded(
            flex: 11,
            child: Container(color: Colors.white.withValues(alpha: 0.04)),
          ),
          Expanded(
            flex: 12,
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 12,
                    width: double.infinity,
                    color: Colors.white.withValues(alpha: 0.08),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 10,
                    width: 96,
                    color: Colors.white.withValues(alpha: 0.06),
                  ),
                  const Spacer(),
                  Container(
                    height: 34,
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}



