import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/public_dashboard_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/data/models/public_dashboard_model.dart';
import 'package:battleasia_app/presentation/screens/play/match_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';

/// Live platform pulse — mirrors web `LandingDashboardSection` glass layout.
class HomeDashboardSection extends StatefulWidget {
  const HomeDashboardSection({super.key});

  @override
  State<HomeDashboardSection> createState() => _HomeDashboardSectionState();
}

class _HomeDashboardSectionState extends State<HomeDashboardSection> {
  final PublicDashboardService _service = PublicDashboardService();
  PublicDashboardStats? _stats;
  bool _loading = true;
  String? _error;
  String _gameFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final result = await _service.fetchDashboard();
    if (!mounted) return;
    if (result['success'] == true && result['data'] is PublicDashboardStats) {
      setState(() {
        _stats = result['data'] as PublicDashboardStats;
        _loading = false;
      });
    } else {
      setState(() {
        _error = result['message']?.toString() ?? 'Failed to load';
        _loading = false;
      });
    }
  }

  List<String> get _gameChips {
    final names = <String>{};
    final s = _stats;
    if (s == null) return const ['ALL'];
    for (final m in [...s.highPrizeMatches, ...s.ongoingMatchList]) {
      if (m.gameName.trim().isNotEmpty) names.add(m.gameName.trim());
    }
    final list = names.toList()..sort();
    return ['ALL', ...list];
  }

  bool _passesFilter(String gameName) {
    if (_gameFilter == 'ALL') return true;
    return gameName.toLowerCase() == _gameFilter.toLowerCase();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
      color: AppColors.pageBg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'LIVE DASHBOARD',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.gold,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.4,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'BattleAsia Pulse',
            style: AppTheme.heading2.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w900,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Track winnings, matches and live action in real time.',
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),
          if (_loading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_error != null)
            _errorBox()
          else if (_stats != null) ...[
            _pulseGrid(_stats!),
            const SizedBox(height: 14),
            _gameFilterRow(),
            const SizedBox(height: 14),
            _playerPanel(
              'Top profit generators',
              _stats!.topProfitPlayers,
              showWinnings: true,
            ),
            const SizedBox(height: 12),
            _playerPanel(
              'Top players by kills',
              _stats!.topPlayers,
              showWinnings: false,
            ),
            const SizedBox(height: 12),
            _matchRail(
              'High prize battles',
              _stats!.highPrizeMatches
                  .where((m) => _passesFilter(m.gameName))
                  .toList(),
            ),
            const SizedBox(height: 12),
            _matchRail(
              'Ongoing matches',
              _stats!.ongoingMatchList
                  .where((m) => _passesFilter(m.gameName))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _errorBox() {
    return GlassCard(
      child: Column(
        children: [
          Text(
            _error!,
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
          ),
          TextButton(
            onPressed: _load,
            child: Text('Retry', style: TextStyle(color: AppColors.gold)),
          ),
        ],
      ),
    );
  }

  Widget _pulseGrid(PublicDashboardStats s) {
    final tiles = [
      ('Total winnings', _bac(s.totalWinnings), true),
      ('Processed', '${s.processedMatches}', false),
      ('Ongoing', '${s.ongoingMatches}', false),
      ('Today joined', '${s.todayJoinedUsers}', false),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final narrow = constraints.maxWidth < 420;
        if (narrow) {
          return Column(
            children: [
              Row(
                children: [
                  Expanded(child: _pulseTile(tiles[0].$1, tiles[0].$2, tiles[0].$3)),
                  const SizedBox(width: 8),
                  Expanded(child: _pulseTile(tiles[1].$1, tiles[1].$2, tiles[1].$3)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: _pulseTile(tiles[2].$1, tiles[2].$2, tiles[2].$3)),
                  const SizedBox(width: 8),
                  Expanded(child: _pulseTile(tiles[3].$1, tiles[3].$2, tiles[3].$3)),
                ],
              ),
            ],
          );
        }
        return Row(
          children: [
            for (var i = 0; i < tiles.length; i++) ...[
              if (i > 0) const SizedBox(width: 8),
              Expanded(
                child: _pulseTile(tiles[i].$1, tiles[i].$2, tiles[i].$3),
              ),
            ],
          ],
        );
      },
    );
  }

  String _bac(double n) {
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(n >= 10000 ? 0 : 1)}K BAC';
    return '${n.toStringAsFixed(0)} BAC';
  }

  Widget _pulseTile(String label, String value, bool emphasize) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
      decoration: BoxDecoration(
        color: AppColors.panelFill(0.55),
        borderRadius: BorderRadius.circular(AppColors.radiusSm),
        border: Border.all(color: AppColors.hair()),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: Container(width: 2, color: AppColors.gold.withValues(alpha: 0.55)),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.textMuted,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    if (emphasize) ...[
                      Image.asset(
                        'assets/images/currency.webp',
                        width: 16,
                        height: 16,
                        errorBuilder: (_, __, ___) => Icon(
                          Icons.monetization_on,
                          size: 16,
                          color: AppColors.gold,
                        ),
                      ),
                      const SizedBox(width: 4),
                    ],
                    Flexible(
                      child: Text(
                        value,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.heading3.copyWith(
                          color: AppColors.gold,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _gameFilterRow() {
    final chips = _gameChips;
    if (chips.length <= 1) return const SizedBox.shrink();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: chips.map((g) {
          final selected = _gameFilter == g;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => setState(() => _gameFilter = g),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.gold.withValues(alpha: 0.12)
                      : AppColors.panelFill(0.4),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: selected
                        ? AppColors.gold.withValues(alpha: 0.55)
                        : AppColors.hair(),
                  ),
                ),
                child: Text(
                  g.toUpperCase(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                    color: selected ? AppColors.gold : AppColors.textMuted,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _playerPanel(
    String title,
    List<DashboardTopPlayer> players, {
    required bool showWinnings,
  }) {
    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    fontSize: 10,
                  ),
                ),
              ),
              GestureDetector(
                onTap: () {
                  // Leaderboard lives in drawer; Play is closest public rail.
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const PlayScreen()),
                  );
                },
                child: Text(
                  'View all',
                  style: TextStyle(
                    color: AppColors.gold.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (players.isEmpty)
            Text(
              'No data yet',
              style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
            )
          else
            ...players.take(5).map((p) {
              final avatarUrl = AppConfig.getImageUrl(p.avatar);
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.surface,
                      backgroundImage:
                          avatarUrl != null && avatarUrl.isNotEmpty
                              ? NetworkImage(avatarUrl)
                              : null,
                      child: avatarUrl == null || avatarUrl.isEmpty
                          ? Text(
                              p.username.isNotEmpty
                                  ? p.username[0].toUpperCase()
                                  : '?',
                              style: const TextStyle(fontSize: 12),
                            )
                          : null,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        p.username,
                        style: AppTheme.bodyMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Text(
                      showWinnings
                          ? _bac(p.totalWinnings)
                          : '${p.totalKills} kills',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _matchRail(String title, List<DashboardMatchSummary> matches) {
    final items = matches.take(8).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title.toUpperCase(),
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.gold,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                  fontSize: 10,
                ),
              ),
            ),
            GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const PlayScreen()),
                );
              },
              child: Text(
                'View all',
                style: TextStyle(
                  color: AppColors.gold.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w700,
                  fontSize: 11,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (items.isEmpty)
          GlassCard(
            padding: const EdgeInsets.all(14),
            child: Text(
              'No matches',
              style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
            ),
          )
        else
          SizedBox(
            height: 168,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) => _matchCard(items[index]),
            ),
          ),
      ],
    );
  }

  Widget _matchCard(DashboardMatchSummary m) {
    final cap = m.totalPlayer <= 0
        ? 0.0
        : (m.participantsCount / m.totalPlayer).clamp(0.0, 1.0);
    final barColor = cap >= 1
        ? const Color(0xFFEF4444)
        : cap > 0.7
            ? const Color(0xFFF59E0B)
            : const Color(0xFF10B981);

    return InkWell(
      onTap: () {
        if (m.id.isEmpty) return;
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => MatchDetailScreen(matchId: m.id),
          ),
        );
      },
      borderRadius: BorderRadius.circular(AppColors.radiusSm),
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.panelFill(0.55),
          borderRadius: BorderRadius.circular(AppColors.radiusSm),
          border: Border.all(color: AppColors.hair()),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.12),
                    border: Border.all(
                      color: AppColors.gold.withValues(alpha: 0.32),
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    (m.gameName.isNotEmpty ? m.gameName : 'Match')
                        .toUpperCase(),
                    style: AppTheme.bodySmall.copyWith(
                      color: AppColors.gold,
                      fontWeight: FontWeight.w800,
                      fontSize: 9,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  _bac(m.prizeEstimate),
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              m.matchName,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTheme.bodyMedium.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
                fontSize: 13,
                height: 1.25,
              ),
            ),
            const Spacer(),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: cap,
                minHeight: 3,
                backgroundColor: Colors.white.withValues(alpha: 0.06),
                color: barColor,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${m.participantsCount}/${m.totalPlayer <= 0 ? '-' : m.totalPlayer} · Entry ${m.entryFee.toStringAsFixed(0)}',
              style: AppTheme.bodySmall.copyWith(
                color: AppColors.textMuted,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 32,
              child: OutlinedButton(
                onPressed: m.id.isEmpty
                    ? null
                    : () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => MatchDetailScreen(matchId: m.id),
                          ),
                        );
                      },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.gold,
                  side: BorderSide(
                    color: AppColors.gold.withValues(alpha: 0.7),
                  ),
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'JOIN',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 11,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
