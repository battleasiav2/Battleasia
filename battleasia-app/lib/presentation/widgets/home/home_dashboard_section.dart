import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/public_dashboard_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/data/models/public_dashboard_model.dart';

/// Live platform pulse — mirrors web `LandingDashboardSection`.
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
            _pulseRow(_stats!),
            const SizedBox(height: 16),
            _playerList(
              'Top profit generators',
              _stats!.topProfitPlayers,
              showWinnings: true,
            ),
            const SizedBox(height: 12),
            _playerList(
              'Top players by kills',
              _stats!.topPlayers,
              showWinnings: false,
            ),
            const SizedBox(height: 12),
            _matchList('High prize battles', _stats!.highPrizeMatches),
            const SizedBox(height: 12),
            _matchList('Ongoing matches', _stats!.ongoingMatchList),
          ],
        ],
      ),
    );
  }

  Widget _errorBox() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border(0.2)),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Column(
        children: [
          Text(_error!, style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted)),
          TextButton(
            onPressed: _load,
            child: Text('Retry', style: TextStyle(color: AppColors.gold)),
          ),
        ],
      ),
    );
  }

  Widget _pulseRow(PublicDashboardStats s) {
    return Row(
      children: [
        Expanded(
          child: _pulseTile(
            'Total winnings',
            '\$${s.totalWinnings.toStringAsFixed(0)}',
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _pulseTile('Processed', '${s.processedMatches}'),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _pulseTile('Ongoing', '${s.ongoingMatches}'),
        ),
      ],
    );
  }

  Widget _pulseTile(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.14)),
      ),
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
          Text(
            value,
            style: AppTheme.heading3.copyWith(
              color: AppColors.gold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _playerList(
    String title,
    List<DashboardTopPlayer> players, {
    required bool showWinnings,
  }) {
    return _panel(
      title: title,
      child: players.isEmpty
          ? Text('No data yet', style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted))
          : Column(
              children: players.take(5).map((p) {
                final avatarUrl = AppConfig.getImageUrl(p.avatar);
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: AppColors.surface,
                        backgroundImage: avatarUrl != null && avatarUrl.isNotEmpty
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
                            ? '\$${p.totalWinnings.toStringAsFixed(0)}'
                            : '${p.totalKills} kills',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.gold,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _matchList(String title, List<DashboardMatchSummary> matches) {
    return _panel(
      title: title,
      child: matches.isEmpty
          ? Text('No matches', style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted))
          : Column(
              children: matches.take(5).map((m) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              m.matchName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTheme.bodyMedium.copyWith(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              '${m.gameName} · ${m.participantsCount}/${m.totalPlayer}',
                              style: AppTheme.bodySmall.copyWith(
                                color: AppColors.textMuted,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '\$${m.prizeEstimate.toStringAsFixed(0)}',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.gold,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _panel({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: AppColors.border(0.14)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.gold,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              fontSize: 10,
            ),
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
