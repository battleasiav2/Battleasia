import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/services/engagement_service.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/match_cover_utils.dart';
import 'package:battleasia_app/core/utils/match_capacity_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as date_utils;
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/data/models/match_participant_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';
import 'package:battleasia_app/presentation/widgets/play/match_spots_progress.dart';
import 'package:battleasia_app/presentation/widgets/play/room_seats.dart';

class MatchDetailScreen extends StatefulWidget {
  final String matchId;

  const MatchDetailScreen({super.key, required this.matchId});

  @override
  State<MatchDetailScreen> createState() => _MatchDetailScreenState();
}

class _MatchDetailScreenState extends State<MatchDetailScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();
  final EngagementService _earn = EngagementService();
  MatchModel? _matchDetail;
  List<MatchParticipantModel> _participants = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _joining = false;
  bool _leaving = false;
  bool _ready = false;
  bool _readyBusy = false;
  bool _chatBusy = false;
  Map<String, dynamic>? _share;
  bool _shareBusy = false;
  List<Map<String, dynamic>> _chat = [];
  final TextEditingController _chatCtrl = TextEditingController();
  String _activeTab = 'description';

  @override
  void initState() {
    super.initState();
    _fetchMatchDetail();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _chatCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchMatchDetail() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _gamesService.getMatchDetail(widget.matchId);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true) {
          final matchData = result['data'] as Map<String, dynamic>?;
          if (matchData != null) {
            _matchDetail = MatchModel.fromJson(matchData);
            // Parse participants if available
            final participantsData =
                matchData['participants'] as List<dynamic>?;
            if (participantsData != null) {
              _participants = participantsData
                  .map(
                    (p) => MatchParticipantModel.fromJson(
                      p as Map<String, dynamic>,
                    ),
                  )
                  .toList();
            } else {
              _participants = [];
            }
            final me = context.read<AuthProvider>().user?.id;
            _ready = _participants.any((p) => p.userId == me && p.ready);
            if (_matchDetail?.isJoined != true) _chat = [];
          } else {
            _errorMessage = 'Match not found';
          }
        } else {
          _errorMessage =
              result['message'] as String? ?? 'Failed to load match details';
        }
      });
      if (_matchDetail?.isJoined == true) {
        await _loadChat();
        await _loadShare();
      } else if (mounted) {
        setState(() => _share = null);
      }
    }
  }

  Future<void> _loadShare() async {
    final result = await _earn.getShareStatus(widget.matchId);
    if (!mounted || result['success'] != true) return;
    final data = result['data'];
    setState(() {
      _share = data is Map ? Map<String, dynamic>.from(data) : null;
    });
  }

  Future<void> _claimShare() async {
    setState(() => _shareBusy = true);
    final result = await _earn.claimShare(widget.matchId);
    if (!mounted) return;
    setState(() {
      _shareBusy = false;
      if (result['success'] == true) {
        _share = {...?_share, 'claimedForMatch': true};
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result['success'] == true
              ? 'Share reward claimed'
              : (result['message']?.toString() ?? 'Could not claim share reward'),
        ),
      ),
    );
  }

  Future<void> _loadChat() async {
    final result = await _gamesService.getMatchChat(widget.matchId);
    if (!mounted || result['success'] != true) return;
    final rows = result['data'];
    setState(() {
      _chat = rows is List
          ? rows.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList()
          : [];
    });
  }

  Future<void> _toggleReady(bool value) async {
    setState(() => _readyBusy = true);
    final result = await _gamesService.setReady(widget.matchId, value);
    if (!mounted) return;
    setState(() {
      _readyBusy = false;
      if (result['success'] == true) _ready = value;
    });
    if (result['success'] != true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']?.toString() ?? 'Could not update ready')),
      );
    }
  }

  Future<void> _leaveMatch() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF121318),
        title: const Text('Leave match?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'You will leave this room. Entry fee is refunded when the match allows it.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Stay')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Leave')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    setState(() => _leaving = true);
    final result = await _gamesService.leaveMatch(widget.matchId);
    if (!mounted) return;
    setState(() => _leaving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(result['success'] == true ? 'Left the match' : (result['message']?.toString() ?? 'Could not leave'))),
    );
    if (result['success'] == true) await _fetchMatchDetail();
  }

  Future<void> _sendChat() async {
    final text = _chatCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _chatBusy = true);
    final result = await _gamesService.sendMatchChat(widget.matchId, text);
    if (!mounted) return;
    setState(() => _chatBusy = false);
    if (result['success'] == true) {
      _chatCtrl.clear();
      await _loadChat();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']?.toString() ?? 'Could not send')),
      );
    }
  }

  Future<void> _reportPlayer(String userId) async {
    final result = await _gamesService.reportPlayer(widget.matchId, userId);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(result['success'] == true ? 'Report sent' : (result['message']?.toString() ?? 'Could not report'))),
    );
  }

  Future<void> _handleJoinMatch() async {
    if (_matchDetail == null || _joining || _matchDetail!.isJoined) {
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final balance = authProvider.user?.balance ?? 0.0;

    if (_matchDetail!.entryFee > balance) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Insufficient balance'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (!isMatchJoinableByCapacity(
      participantsCount: _matchDetail!.participantsCount,
      totalPlayer: _matchDetail!.totalPlayer,
    )) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('match.matchFullToast'.tr()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _joining = true;
    });

    final result = await _gamesService.joinMatch(_matchDetail!.id);

    if (mounted) {
      setState(() {
        _joining = false;
      });

      if (result['success'] == true) {
        // Update balance if returned
        final updatedBalance = result['data']?['balance'];
        if (updatedBalance != null && updatedBalance is num) {
          // Note: You may need to add an updateBalance method to AuthProvider
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Joined match successfully'),
            backgroundColor: Colors.green,
          ),
        );

        // Refresh match details
        _fetchMatchDetail();
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

  void _handleBack() {
    Navigator.pop(context);
  }

  void _handleTabChange(String tab) {
    setState(() {
      _activeTab = tab;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Responsive sizes
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    
    final verticalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(8.0, 16.0);
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;

    final topPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);
    
    final backFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 20.0,
    );
    
    if (_isLoading || _matchDetail == null) {
      return Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.accentColor),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _errorMessage!,
                style: AppTheme.bodyLarge.copyWith(
                  color: AppTheme.textSecondary,
                  fontSize: ResponsiveUtils.getResponsiveFontSize(
                    context,
                    baseSize: 18.0,
                  ),
                ),
              ),
              SizedBox(
                height: ResponsiveUtils.getResponsiveSpacing(
                  context,
                  baseSize: 16.0,
                ).clamp(12.0, 16.0),
              ),
              ElevatedButton(
                onPressed: _handleBack,
                child: Text(
                  'Go Back',
                  style: TextStyle(
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

    final bannerUrl = MatchCoverUtils.resolve(_matchDetail!);

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
                    onTap: _handleBack,
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

              // Main content
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Image and Summary Grid
                      _buildImageAndSummarySection(bannerUrl),

                      SizedBox(
                        height: ResponsiveUtils.getResponsiveSpacing(
                          context,
                          baseSize: 24.0,
                        ).clamp(16.0, 24.0),
                      ),

                      // Tabs Card
                      _buildTabsCard(),
                    ],
                  ),
                ),
              ),
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

  Widget _buildImageAndSummarySection(String bannerUrl) {
    final bannerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 250.0,
    ).clamp(200.0, 250.0);
    
    final spacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 28.0,
    );
    
    final gridSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(4.0, 8.0);
    
    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Banner Image
        Container(
          height: bannerHeight,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: const Color.fromARGB(255, 170, 170, 170),
            image: DecorationImage(
              image: bannerUrl.startsWith('http')
                  ? NetworkImage(bannerUrl)
                  : AssetImage(bannerUrl) as ImageProvider,
              fit: BoxFit.contain,
            ),
          ),
        ),

        SizedBox(height: spacing),

        // Match Title
        Text(
          _matchDetail!.matchName,
          style: AppTheme.heading2.copyWith(
            color: const Color(0xFF10b981),
            fontWeight: FontWeight.bold,
            fontSize: titleFontSize,
          ),
        ),

        SizedBox(height: spacing),

        // Match Information Cards
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: gridSpacing,
          crossAxisSpacing: gridSpacing,
          childAspectRatio: 2.5,
          children: [
            _buildInfoCard(
              'Team',
              _matchDetail!.teamType?.toUpperCase() ?? 'N/A',
            ),
            _buildInfoCard(
              'Entry Fee',
              '${_matchDetail!.entryFee.toStringAsFixed(0)}',
            ),
            _buildInfoCard('MAP', _matchDetail!.map ?? 'N/A'),
            _buildInfoCard(
              'Match Type',
              _matchDetail!.matchType?.toUpperCase() ?? 'N/A',
            ),
          ],
        ),

        SizedBox(height: gridSpacing),

        // Match Schedule Card (full width)
        _buildInfoCard(
          'Match Schedule',
          _matchDetail!.matchSchedule != null
              ? date_utils.DateUtils.formatDateTime(_matchDetail!.matchSchedule)
              : 'N/A',
          fullWidth: true,
        ),

        SizedBox(height: spacing),

        // Room Details Card
        _buildRoomDetailsCard(),

        SizedBox(height: spacing),

        MatchSpotsProgress(
          participantsCount: _matchDetail!.participantsCount,
          totalPlayer: _matchDetail!.totalPlayer,
          variant: MatchSpotsProgressVariant.featured,
        ),

        SizedBox(height: spacing),

        // Join Button
        Builder(
          builder: (context) {
            final authProvider = Provider.of<AuthProvider>(
              context,
              listen: false,
            );
            final balance = authProvider.user?.balance ?? 0.0;
            final isFull = !isMatchJoinableByCapacity(
              participantsCount: _matchDetail!.participantsCount,
              totalPlayer: _matchDetail!.totalPlayer,
            );
            final buttonDisabled =
                _matchDetail!.isJoined ||
                _joining ||
                _matchDetail!.entryFee > balance ||
                isFull;
            return SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: buttonDisabled ? null : _handleJoinMatch,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF8C42),
                  padding: EdgeInsets.symmetric(
                    vertical: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 16.0,
                    ).clamp(12.0, 16.0),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  disabledBackgroundColor: Colors.grey,
                ),
                child: _joining
                    ? SizedBox(
                        height: ResponsiveUtils.getResponsiveSpacing(
                          context,
                          baseSize: 20.0,
                        ).clamp(18.0, 20.0),
                        width: ResponsiveUtils.getResponsiveSpacing(
                          context,
                          baseSize: 20.0,
                        ).clamp(18.0, 20.0),
                        child: const CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(
                        _matchDetail!.isJoined
                            ? 'Already Joined'
                            : isFull
                                ? 'match.matchFull'.tr()
                                : 'Join Match',
                        style: AppTheme.bodyMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: buttonFontSize,
                        ),
                      ),
              ),
            );
          },
        ),
        if (_matchDetail!.isJoined) ...[
          SizedBox(height: spacing),
          _buildLobby(),
        ],
      ],
    );
  }

  Widget _buildLobby() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Ready', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          subtitle: Text(
            _ready ? 'You are ready for this lobby' : 'Mark ready when you are in',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.55)),
          ),
          value: _ready,
          activeThumbColor: AppColors.gold,
          onChanged: _readyBusy ? null : _toggleReady,
        ),
        OutlinedButton(
          onPressed: _leaving ? null : _leaveMatch,
          child: Text(_leaving ? 'Leaving…' : 'Leave match'),
        ),
        if (_share?['enabled'] == true) ...[
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: _shareBusy || _share?['claimedForMatch'] == true ? null : _claimShare,
            child: Text(
              _share?['claimedForMatch'] == true
                  ? 'Share reward claimed'
                  : (_shareBusy ? 'Claiming…' : 'Share reward (+${_share?['bacAmount'] ?? 0} BAC)'),
            ),
          ),
        ],
        const SizedBox(height: 16),
        const Text('Lobby chat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Container(
          constraints: const BoxConstraints(maxHeight: 220),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFF121318),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: _chat.isEmpty
              ? Text('No messages yet', style: TextStyle(color: Colors.white.withValues(alpha: 0.5)))
              : ListView(
                  shrinkWrap: true,
                  children: _chat.map((row) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        '${row['username'] ?? 'Player'}: ${row['message'] ?? ''}',
                        style: const TextStyle(color: Colors.white),
                      ),
                    );
                  }).toList(),
                ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _chatCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Message',
                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
                  filled: true,
                  fillColor: const Color(0xFF121318),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(9)),
                ),
                onSubmitted: (_) => _sendChat(),
              ),
            ),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: _chatBusy ? null : _sendChat,
              child: Text(_chatBusy ? '…' : 'Send'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Joined players can be reported from the Seats tab.',
          style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildInfoCard(String label, String value, {bool fullWidth = false}) {
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: EdgeInsets.all(cardPadding),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E).withOpacity(0.95),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Text(
        '$label: $value',
        style: AppTheme.bodyMedium.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w500,
          fontSize: bodyFontSize,
        ),
      ),
    );
  }

  Widget _buildRoomDetailsCard() {
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 22.0,
      max: 32.0,
    );
    
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    
    final spacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(cardPadding),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E).withOpacity(0.95),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Room Details',
            style: AppTheme.heading3.copyWith(
              color: const Color(0xFF10b981),
              fontWeight: FontWeight.w600,
              fontSize: titleFontSize,
            ),
          ),
          SizedBox(height: spacing),
          Text(
            'Room ID: ${_matchDetail!.roomId ?? 'N/A'}',
            style: AppTheme.bodyMedium.copyWith(
              color: Colors.white,
              fontSize: bodyFontSize,
            ),
          ),
          SizedBox(height: spacing * 0.5),
          Text(
            'Password: ${_matchDetail!.password ?? 'N/A'}',
            style: AppTheme.bodyMedium.copyWith(
              color: Colors.white,
              fontSize: bodyFontSize,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabsCard() {
    final tabPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    
    final tabFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 12.0,
      max: 18.0,
    );
    
    return Card(
      color: AppTheme.surfaceColor,
      child: Column(
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: tabPadding),
            child: PlayTabs(
              fontSize: tabFontSize,
              tabs: [
                {'label': 'Description', 'value': 'description'},
                {
                  'label': 'Seats (${_participants.length}/${_matchDetail?.totalPlayer ?? 0})',
                  'value': 'joined',
                },
              ],
              activeTab: _activeTab,
              onTabChanged: _handleTabChange,
            ),
          ),
          if (_activeTab == 'description') _buildDescriptionTab(),
          if (_activeTab == 'joined') _buildJoinedTab(),
        ],
      ),
    );
  }

  Widget _buildDescriptionTab() {
    final tabPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );
    
    final spacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);
    
    final largeSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);
    
    return Padding(
      padding: EdgeInsets.all(tabPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Prize Details Section
          _buildSectionTitle('Prize Details'),
          SizedBox(height: spacing),
          Row(
            children: [
              Expanded(
                child: _buildInfoCard(
                  'Prize',
                  _matchDetail!.prizeDescription ?? 'N/A',
                ),
              ),
              SizedBox(
                width: ResponsiveUtils.getResponsiveSpacing(
                  context,
                  baseSize: 8.0,
                ).clamp(4.0, 8.0),
              ),
              Expanded(
                child: _buildInfoCard(
                  'Per Kill',
                  '${_matchDetail!.perKill.toStringAsFixed(0)}',
                ),
              ),
            ],
          ),

          SizedBox(height: largeSpacing),

          // Match Sponsor Section
          _buildSectionTitle('Match Sponsor'),
          SizedBox(height: spacing),
          Text(
            _matchDetail!.matchSponsor ?? 'N/A',
            style: AppTheme.bodyMedium.copyWith(
              color: AppTheme.textPrimary,
              fontSize: bodyFontSize,
            ),
          ),

          SizedBox(height: largeSpacing),

          // About this Match Section
          _buildSectionTitle('About this Match'),
          SizedBox(height: spacing),
          Text(
            _matchDetail!.matchDescription ?? 'No description provided.',
            style: AppTheme.bodyMedium.copyWith(
              color: AppTheme.textPrimary,
              height: 1.8,
              fontSize: bodyFontSize,
            ),
          ),

          SizedBox(height: largeSpacing),

          // Match Private Description Section
          _buildSectionTitle(
            'Match Private Description (Only match join member can see)',
          ),
          SizedBox(height: spacing),
          Text(
            _matchDetail!.isJoined
                ? (_matchDetail!.matchPrivateDescription ??
                      'No private description.')
                : 'Join this match to view the private description.',
            style: AppTheme.bodyMedium.copyWith(
              color: AppTheme.textPrimary,
              fontSize: bodyFontSize,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    final sectionTitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 20.0,
    );
    
    return Text(
      title,
      style: AppTheme.heading3.copyWith(
        color: const Color(0xFF10b981),
        fontWeight: FontWeight.bold,
        fontSize: sectionTitleFontSize,
      ),
    );
  }

  Widget _buildJoinedTab() {
    final total = _matchDetail?.totalPlayer ?? _participants.length;
    final used = _matchDetail?.participantsCount ?? _participants.length;
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 4, 14, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$used of $total joined',
            style: AppTheme.bodySmall.copyWith(
              color: Colors.white.withValues(alpha: 0.62),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          RoomSeats(
            total: total,
            players: _participants,
            selfId: context.read<AuthProvider>().user?.id,
            onReport: _matchDetail?.isJoined == true ? _reportPlayer : null,
          ),
        ],
      ),
    );
  }
}
