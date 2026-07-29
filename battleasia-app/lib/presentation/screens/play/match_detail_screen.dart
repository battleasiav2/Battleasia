import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as date_utils;
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/data/models/match_participant_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/play/play_tabs.dart';

class MatchDetailScreen extends StatefulWidget {
  final String matchId;

  const MatchDetailScreen({super.key, required this.matchId});

  @override
  State<MatchDetailScreen> createState() => _MatchDetailScreenState();
}

class _MatchDetailScreenState extends State<MatchDetailScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();
  MatchModel? _matchDetail;
  List<MatchParticipantModel> _participants = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _joining = false;
  String _activeTab = 'description';

  @override
  void initState() {
    super.initState();
    _fetchMatchDetail();
  }

  @override
  void dispose() {
    _scrollController.dispose();
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
          } else {
            _errorMessage = 'Match not found';
          }
        } else {
          _errorMessage =
              result['message'] as String? ?? 'Failed to load match details';
        }
      });
    }
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
      return const Scaffold(
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

    final bannerUrl =
        ImageUtils.getImageUrl(_matchDetail!.banner) ??
        'assets/images/game.webp';

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

        // Join Button
        Builder(
          builder: (context) {
            final authProvider = Provider.of<AuthProvider>(
              context,
              listen: false,
            );
            final balance = authProvider.user?.balance ?? 0.0;
            final buttonDisabled =
                _matchDetail!.isJoined ||
                _joining ||
                _matchDetail!.entryFee > balance;
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
                  'label': 'Joined Members (${_participants.length})',
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
    final tabPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);
    
    final tablePadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);
    
    final tableFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    
    final headerFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    
    return Padding(
      padding: EdgeInsets.all(tabPadding),
      child: _participants.isEmpty
          ? Center(
              child: Text(
                'No joined members available.',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontSize: ResponsiveUtils.getResponsiveFontSize(
                    context,
                    baseSize: 16.0,
                  ),
                ),
              ),
            )
          : Table(
              border: TableBorder.all(color: Colors.white.withOpacity(0.1)),
              children: [
                // Header row
                TableRow(
                  decoration: const BoxDecoration(color: Color(0xFF1E1E1E)),
                  children: [
                    TableCell(
                      child: Padding(
                        padding: EdgeInsets.all(tablePadding),
                        child: Text(
                          'Team',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: headerFontSize,
                          ),
                        ),
                      ),
                    ),
                    TableCell(
                      child: Padding(
                        padding: EdgeInsets.all(tablePadding),
                        child: Text(
                          'Position',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: headerFontSize,
                          ),
                        ),
                      ),
                    ),
                    TableCell(
                      child: Padding(
                        padding: EdgeInsets.all(tablePadding),
                        child: Text(
                          'Player Name',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: headerFontSize,
                          ),
                        ),
                      ),
                    ),
                    TableCell(
                      child: Padding(
                        padding: EdgeInsets.all(tablePadding),
                        child: Text(
                          'Joined At',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: headerFontSize,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                // Data rows
                ..._participants.asMap().entries.map((entry) {
                  final index = entry.key;
                  final participant = entry.value;
                  return TableRow(
                    decoration: const BoxDecoration(color: Color(0xFF1E1E1E)),
                    children: [
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(tablePadding),
                          child: Text(
                            participant.team ?? 'Team ${index + 1}',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: tableFontSize,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(tablePadding),
                          child: Text(
                            participant.pubgId ?? '-',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: tableFontSize,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(tablePadding),
                          child: Text(
                            participant.username,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: tableFontSize,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(tablePadding),
                          child: Text(
                            participant.joinedAt != null
                                ? date_utils.DateUtils.formatDateTime(
                                    participant.joinedAt,
                                  )
                                : '-',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: tableFontSize,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ],
            ),
    );
  }
}
