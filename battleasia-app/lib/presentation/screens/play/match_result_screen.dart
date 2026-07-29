import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/services/games_service.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as date_utils;
import 'package:battleasia_app/data/models/match_model.dart';
import 'package:battleasia_app/data/models/match_result_participant_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';

class MatchResultScreen extends StatefulWidget {
  final String matchId;

  const MatchResultScreen({super.key, required this.matchId});

  @override
  State<MatchResultScreen> createState() => _MatchResultScreenState();
}

class _MatchResultScreenState extends State<MatchResultScreen> {
  final ScrollController _scrollController = ScrollController();
  final GamesService _gamesService = GamesService();
  MatchModel? _match;
  List<MatchResultParticipantModel> _participants = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchResult();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchResult() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _gamesService.getMatchResult(widget.matchId);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true) {
          final data = result['data'] as Map<String, dynamic>?;
          if (data != null) {
            // Parse match info
            final matchData = data['match'] as Map<String, dynamic>? ?? data;
            _match = MatchModel.fromJson(matchData);
            // Parse participants
            final participantsRaw = data['participants'] as List<dynamic>?;
            if (participantsRaw != null) {
              _participants = participantsRaw
                  .map(
                    (p) => MatchResultParticipantModel.fromJson(
                      p as Map<String, dynamic>,
                    ),
                  )
                  .toList();
              // Sort by placement asc, unplaced (0) last
              _participants.sort((a, b) {
                if (a.placement == 0 && b.placement == 0) return 0;
                if (a.placement == 0) return 1;
                if (b.placement == 0) return -1;
                return a.placement.compareTo(b.placement);
              });
            }
          } else {
            _errorMessage = 'Result not found';
          }
        } else {
          _errorMessage =
              result['message'] as String? ?? 'Failed to load match result';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
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
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;

    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Center(
          child: CircularProgressIndicator(color: AppTheme.accentColor),
        ),
      );
    }

    if (_errorMessage != null || _match == null) {
      return Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _errorMessage ?? 'Result not found',
                style: AppTheme.bodyLarge.copyWith(
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    final mapImagePath = _getMapImagePath(_match!.map);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverToBoxAdapter(child: SizedBox(height: topPadding)),

              // Back button
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: horizontalPadding,
                    vertical: verticalPadding,
                  ),
                  child: InkWell(
                    onTap: () => Navigator.pop(context),
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
                        const SizedBox(width: 8),
                        Text(
                          'Back',
                          style: AppTheme.bodyLarge.copyWith(
                            color: AppTheme.textPrimary,
                            fontSize: ResponsiveUtils.getResponsiveFontSize(
                              context,
                              baseSize: 18.0,
                              min: 14.0,
                              max: 20.0,
                            ),
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
                      _buildHeroAndInfo(mapImagePath),
                      const SizedBox(height: 24),
                      _buildResultsTable(),
                      SizedBox(height: bottomPadding),
                    ],
                  ),
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

          // Bottom nav
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  // Map name → local asset path
  // ────────────────────────────────────────────────────────────
  String _getMapImagePath(String? mapName) {
    if (mapName == null || mapName.isEmpty) return 'assets/images/game.webp';
    // Normalize: trim, capitalize first letter for asset filename matching
    final normalized = mapName.trim();
    final capitalized =
        normalized[0].toUpperCase() + normalized.substring(1).toLowerCase();
    const knownMaps = [
      'Erangel',
      'Miramar',
      'Sanhok',
      'Vikendi',
      'Livik',
      'Rondo',
      'Nusa',
      'Karakin',
      'Hanger',
      'Gun',
      'Warehouse',
    ];
    // Exact capitalized match
    if (knownMaps.contains(capitalized)) {
      return 'assets/images/map/$capitalized.webp';
    }
    // Case-insensitive fallback
    final match = knownMaps.firstWhere(
      (m) => m.toLowerCase() == normalized.toLowerCase(),
      orElse: () => '',
    );
    if (match.isNotEmpty) return 'assets/images/map/$match.webp';
    return 'assets/images/game.webp';
  }

  // ────────────────────────────────────────────────────────────
  // Hero banner + match info section
  // ────────────────────────────────────────────────────────────
  Widget _buildHeroAndInfo(String mapImagePath) {
    final bannerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 220.0,
    ).clamp(180.0, 220.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Map image
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.asset(
            mapImagePath,
            height: bannerHeight,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              // Fallback to game.webp if map asset missing
              return Image.asset(
                'assets/images/game.webp',
                height: bannerHeight,
                width: double.infinity,
                fit: BoxFit.cover,
              );
            },
          ),
        ),

        const SizedBox(height: 12),

        // Match name
        Text(
          _match!.matchName,
          style: AppTheme.heading2.copyWith(
            color: const Color(0xFF10b981),
            fontWeight: FontWeight.bold,
            fontSize: ResponsiveUtils.getResponsiveFontSize(
              context,
              baseSize: 22.0,
              min: 18.0,
              max: 26.0,
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Info grid (2 columns)
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 2.8,
          children: [
            _buildInfoTile(
              'Game',
              _match!.gameName.isNotEmpty ? _match!.gameName : 'N/A',
            ),
            _buildInfoTile(
              'Type',
              _match!.matchType?.toUpperCase() ?? 'N/A',
            ),
            _buildInfoTile(
              'Map',
              _match!.map ?? 'N/A',
            ),
            _buildInfoTile(
              'Team',
              _match!.teamType?.toUpperCase() ?? 'N/A',
            ),
            _buildInfoTile(
              'Per Kill',
              _match!.perKill > 0
                  ? _match!.perKill.toStringAsFixed(0)
                  : 'N/A',
            ),
            _buildInfoTile(
              'Players',
              '${_match!.totalPlayer}',
            ),
          ],
        ),

        const SizedBox(height: 8),

        // Date (full width)
        _buildInfoTile(
          'Date',
          _match!.matchSchedule != null
              ? date_utils.DateUtils.formatDateTime(_match!.matchSchedule)
              : 'N/A',
          fullWidth: true,
        ),
      ],
    );
  }

  Widget _buildInfoTile(String label, String value, {bool fullWidth = false}) {
    final padding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 13.0,
    );

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 15.0,
    );

    final child = Container(
      padding: EdgeInsets.all(padding),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: labelFontSize,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: AppTheme.textPrimary,
              fontSize: valueFontSize,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );

    if (fullWidth) {
      return SizedBox(width: double.infinity, child: child);
    }
    return child;
  }

  // ────────────────────────────────────────────────────────────
  // Results – one card per participant
  // ────────────────────────────────────────────────────────────
  Widget _buildResultsTable() {
    final headerFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 15.0,
      max: 20.0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'MATCH RESULTS',
          style: AppTheme.heading3.copyWith(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: headerFontSize,
          ),
        ),
        const SizedBox(height: 12),

        if (_participants.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.surfaceColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'No results available yet.',
              textAlign: TextAlign.center,
              style: AppTheme.bodyLarge.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _participants.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) =>
                _buildParticipantCard(_participants[index]),
          ),
      ],
    );
  }

  Widget _buildParticipantCard(MatchResultParticipantModel p) {
    // ── rank badge colours ────────────────────────────────────
    final rankColor = p.placement == 1
        ? const Color(0xFFFFD700)
        : p.placement == 2
            ? const Color(0xFFC0C0C0)
            : p.placement == 3
                ? const Color(0xFFCD7F32)
                : AppTheme.textSecondary;

    final rankLabel = p.placement > 0 ? '#${p.placement}' : '-';

    // ── card border accent ────────────────────────────────────
    final borderColor =
        p.isWinner ? const Color(0xFF10b981) : const Color(0xFF1A1A1A);

    // ── stat items (label, value, optional highlight color) ───
    final stats = <_StatItem>[
      _StatItem('ENTRY FEE', p.entryFee > 0 ? p.entryFee.toStringAsFixed(0) : '-', isCoins: true),
      _StatItem('KILLS', '${p.kills}'),
      _StatItem('POINTS', p.points > 0 ? p.points.toStringAsFixed(1) : '-'),
      _StatItem('WIN PRIZE', p.winPrize > 0 ? p.winPrize.toStringAsFixed(0) : '-',
          highlight: p.winPrize > 0, isCoins: true),
      _StatItem('BONUS', p.bonus > 0 ? p.bonus.toStringAsFixed(0) : '-',
          isCoins: p.bonus > 0),
    ];

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── header row ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
            child: Row(
              children: [
                // Rank badge
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: rankColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    rankLabel,
                    style: TextStyle(
                      color: rankColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Name + pubgId
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.username,
                        style: const TextStyle(
                          color: Colors.black87,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (p.email != null && p.email!.isNotEmpty)
                        Text(
                          p.email!,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 11,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Win / Loss badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: p.isWinner
                        ? const Color(0xFF10b981)
                        : const Color(0xFF1A1A1A),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    p.isWinner ? 'WIN' : 'LOSS',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, indent: 14, endIndent: 14),

          // ── stats grid ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
            child: GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.0,
              children: stats.map(_buildStatCell).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCell(_StatItem item) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            item.label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 9,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              if (item.isCoins && item.value != '-')
                Padding(
                  padding: const EdgeInsets.only(right: 3),
                  child: Image.asset(
                    'assets/images/coin.webp',
                    width: 11,
                    height: 11,
                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              Expanded(
                child: Text(
                  item.value,
                  style: TextStyle(
                    color: item.highlight
                        ? const Color(0xFF10b981)
                        : Colors.black87,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Simple data holder for stat cells
class _StatItem {
  final String label;
  final String value;
  final bool highlight;
  final bool isCoins;

  const _StatItem(this.label, this.value,
      {this.highlight = false, this.isCoins = false});
}
