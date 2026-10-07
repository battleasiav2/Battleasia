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
import 'package:battleasia_app/presentation/widgets/common/network_status_banner.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/widgets/play/match_card.dart';
import 'package:battleasia_app/presentation/widgets/play/join_arena_card.dart';
import 'package:battleasia_app/presentation/widgets/play/match_join_sheet.dart';
import 'package:battleasia_app/presentation/widgets/play/room_seats_dialog.dart';
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
  String _filter = 'all';
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

  int _spotsLeft(MatchModel match) {
    final left = match.totalPlayer - (match.participantsCount ?? 0);
    return left < 0 ? 0 : left;
  }

  int _winningPool(MatchModel match) {
    if (match.entryFee > 0 && match.totalPlayer > 0) {
      return (match.entryFee * match.totalPlayer).round();
    }
    final raw = match.prizeDescription ?? '';
    final hit = RegExp(r'(\d[\d,]*)').firstMatch(raw);
    if (hit == null) return 0;
    return int.tryParse(hit.group(1)!.replaceAll(',', '')) ?? 0;
  }

  bool _isJoinable(MatchModel match) {
    final status = match.status.toLowerCase();
    return (status == 'active' || status == 'start') &&
        _spotsLeft(match) > 0 &&
        !match.isJoined;
  }

  List<MatchModel> _pinJoinedFirst(List<MatchModel> list) {
    final copy = [...list];
    copy.sort((a, b) => (b.isJoined ? 1 : 0).compareTo(a.isJoined ? 1 : 0));
    return copy;
  }

  List<MatchModel> _visibleMatches() {
    if (_filter == 'joined') {
      return _pinJoinedFirst(_matches.where((m) => m.isJoined).toList());
    }
    if (_filter == 'open') {
      return _pinJoinedFirst(_matches.where(_isJoinable).toList());
    }
    if (_filter == 'free') {
      return _pinJoinedFirst(
        _matches.where((m) => m.matchType == 'free' || m.entryFee <= 0).toList(),
      );
    }
    if (_filter == 'highPrize' || _filter == 'lowPrize') {
      final priced = _matches.where((m) => _winningPool(m) > 0).toList();
      priced.sort((a, b) {
        final byPool = _filter == 'highPrize'
            ? _winningPool(b).compareTo(_winningPool(a))
            : _winningPool(a).compareTo(_winningPool(b));
        if (byPool != 0) return byPool;
        return _spotsLeft(b).compareTo(_spotsLeft(a));
      });
      return _pinJoinedFirst(priced);
    }
    return _pinJoinedFirst(_matches);
  }

  Map<String, List<MatchModel>> _categorizeMatches() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final groups = <String, List<MatchModel>>{
      'ongoing': [],
      'upcoming': [],
      'results': [],
    };

    for (final match in _visibleMatches()) {
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
      onOpenSeats: isResult
          ? null
          : () {
              showDialog<void>(
                context: context,
                builder: (context) => RoomSeatsDialog(match: match, gamesService: _gamesService),
              );
            },
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

    if (_isLoading) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.fromLTRB(horizontalPadding, 24, horizontalPadding, 0),
          child: Column(
            children: [
              Icon(Icons.signal_cellular_alt, color: AppColors.gold, size: 28),
              const SizedBox(height: 12),
              CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2.4),
              const SizedBox(height: 12),
              Text(
                'Loading matchesâ€¦',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
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
              _visibleMatches().isEmpty && _filter != 'all'
                  ? 'match.filterEmpty'.tr()
                  : 'No matches available',
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
      padding: EdgeInsets.fromLTRB(horizontalPadding, 8, horizontalPadding, 0),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildMatchCard(
              matches[index],
              showLive,
              isResult: isResult,
            ),
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
              const SliverToBoxAdapter(child: NetworkStatusBanner()),

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

              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(horizontalPadding, 0, horizontalPadding, 8),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final item in const [
                          ('all', 'match.filterAll'),
                          ('joined', 'match.filterJoined'),
                          ('open', 'match.filterOpen'),
                          ('highPrize', 'match.filterHighPrize'),
                          ('lowPrize', 'match.filterLowPrize'),
                          ('free', 'match.filterFree'),
                        ])
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(item.$2.tr()),
                              selected: _filter == item.$1,
                              onSelected: (_) => setState(() => _filter = item.$1),
                              labelStyle: TextStyle(
                                color: _filter == item.$1 ? Colors.black : Colors.white70,
                                fontWeight: FontWeight.w700,
                              ),
                              selectedColor: AppColors.gold,
                              backgroundColor: const Color(0xFF161618),
                              side: BorderSide(
                                color: _filter == item.$1
                                    ? AppColors.gold
                                    : Colors.white.withValues(alpha: 0.08),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              if (!_isLoading && _visibleMatches().isEmpty && _filter != 'all')
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 24),
                    child: Column(
                      children: [
                        Text(
                          'match.filterEmpty'.tr(),
                          style: AppTheme.heading3.copyWith(color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'match.filterEmptyLead'.tr(),
                          style: AppTheme.bodySmall.copyWith(color: Colors.white70),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),

              if (_isLoading || _filter == 'all' || _visibleMatches().isNotEmpty) ...[
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
              ],

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
            MatchJoinSheet(
              match: _confirmMatch!,
              balance: Provider.of<AuthProvider>(context, listen: false).user?.balance ?? 0,
              joining: _joiningMatchId == _confirmMatch!.id,
              onClose: _handleCloseConfirm,
              onConfirm: _handleConfirmJoin,
            ),

          // Room Details Dialog
          if (_selectedMatchForRoomDetails != null)
            _buildRoomDialog(_selectedMatchForRoomDetails!),
        ],
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



