import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/engagement_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/data/models/balance_history_model.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

const _engagementReasons = {
  'engagement_reward',
  'engagement_streak_reward',
  'engagement_welcome_reward',
  'engagement_referral_reward',
  'engagement_weekly_reward',
  'engagement_share_reward',
  'engagement_deposit_bonus',
  'engagement_spin_reward',
  'engagement_squad_reward',
  'engagement_season_pass_reward',
};

class WalletEarnPanel extends StatefulWidget {
  final VoidCallback? onBalanceRefresh;

  const WalletEarnPanel({super.key, this.onBalanceRefresh});

  @override
  State<WalletEarnPanel> createState() => _WalletEarnPanelState();
}

class _WalletEarnPanelState extends State<WalletEarnPanel> {
  final EngagementService _engagement = EngagementService();
  final UserService _userService = UserService();
  final TextEditingController _squadNameController = TextEditingController();
  final TextEditingController _squadCodeController = TextEditingController();

  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _home;
  String _hubTab = 'earn';
  String? _claimingKey;
  bool _squadBusy = false;
  List<BalanceHistoryModel> _earnHistory = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _squadNameController.dispose();
    _squadCodeController.dispose();
    super.dispose();
  }

  Future<void> _load({bool historyOnly = false}) async {
    if (!historyOnly) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }

    final homeResult = historyOnly && _home != null
        ? {'success': true, 'data': _home}
        : await _engagement.getHome();
    final historyResult = await _userService.getBalanceHistory(page: 1, limit: 50);

    if (!mounted) return;

    if (homeResult['success'] != true) {
      setState(() {
        _loading = false;
        _error = homeResult['message'] as String? ?? 'wallet.earnLoadFailed'.tr();
      });
      return;
    }

    final rows = (historyResult['data'] as List<dynamic>? ?? [])
        .map((e) => BalanceHistoryModel.fromJson(e as Map<String, dynamic>))
        .where((tx) {
          final reason = tx.detail?['reason'] as String?;
          return reason != null && _engagementReasons.contains(reason);
        })
        .toList();

    setState(() {
      _home = homeResult['data'] as Map<String, dynamic>?;
      _earnHistory = rows;
      _loading = false;
      _error = null;
    });
  }

  void _toast(String message, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? AppColors.error : AppColors.success,
      ),
    );
  }

  Future<void> _afterClaim(Map<String, dynamic> result, {String? successKey}) async {
    if (result['success'] != true) {
      _toast(result['message'] as String? ?? 'wallet.earnClaimFailed'.tr(), error: true);
      return;
    }
    final data = result['data'] as Map<String, dynamic>?;
    if (data?['balanceAfter'] != null) {
      final balance = (data!['balanceAfter'] as num).toDouble();
      if (mounted) {
        Provider.of<AuthProvider>(context, listen: false).updateBalance(balance);
      }
    }
    if (successKey != null) _toast(successKey.tr());
    widget.onBalanceRefresh?.call();
    await _load();
  }

  int get _claimableCount {
    if (_home == null) return 0;
    var count = 0;
    final streak = _home!['streak'] as Map<String, dynamic>?;
    if (streak?['canClaim'] == true) count++;
    final weekly = _home!['weeklyArena'] as Map<String, dynamic>?;
    if (weekly?['canClaim'] == true) count++;
    final squad = _home!['squadChallenge'] as Map<String, dynamic>?;
    if (squad?['canClaim'] == true) count++;
    count += (_home!['seasonPass']?['claimableCount'] as num?)?.toInt() ?? 0;
    final missions = _home!['missions'] as List<dynamic>? ?? [];
    count += missions.where((m) => (m as Map)['status'] == 'completed').length;
    final welcome = _home!['welcome']?['milestones'] as List<dynamic>? ?? [];
    count += welcome.where((m) => (m as Map)['canClaim'] == true).length;
    final referral = _home!['referral']?['tiers'] as List<dynamic>? ?? [];
    count += referral.where((m) => (m as Map)['canClaim'] == true).length;
    return count;
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    if (_error != null) {
      return GlassCard(
        child: Column(
          children: [
            Text(_error!, style: const TextStyle(color: AppColors.textMuted)),
            const SizedBox(height: 12),
            GoldButton(label: 'common.retry'.tr(), onPressed: _load, expanded: false),
          ],
        ),
      );
    }

    final settings = _home!['settings'] as Map<String, dynamic>? ?? {};
    if (settings['enabled'] != true) {
      return GlassCard(
        child: Text(
          'wallet.earnDisabled'.tr(),
          style: const TextStyle(color: AppColors.textMuted, fontSize: 14),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader(settings),
        const SizedBox(height: 12),
        _buildSummary(),
        const SizedBox(height: 12),
        _buildHubTabs(),
        const SizedBox(height: 12),
        if (_hubTab == 'earn') ...[
          _buildLevelPanel(),
          const SizedBox(height: 12),
          _buildSharePanel(),
          const SizedBox(height: 12),
          _buildDepositBonusPanel(),
          const SizedBox(height: 12),
          _buildLuckySpinPanel(),
          const SizedBox(height: 12),
          _buildWeeklyArenaPanel(),
          const SizedBox(height: 12),
          _buildSquadPanel(),
          const SizedBox(height: 12),
          _buildSeasonPassPanel(),
          const SizedBox(height: 12),
          _buildWelcomePanel(),
          const SizedBox(height: 12),
          _buildReferralMilestonesPanel(),
          const SizedBox(height: 12),
          _buildMissionsPanel(),
        ],
        if (_hubTab == 'streak') _buildStreakPanel(),
        if (_hubTab == 'history') _buildEarnHistoryPanel(),
      ],
    );
  }

  Widget _buildHeader(Map<String, dynamic> settings) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            settings['earnTabTitle'] as String? ?? 'wallet.earnTitle'.tr(),
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            settings['earnTabSubtitle'] as String? ?? 'wallet.earnSubtitle'.tr(),
            style: const TextStyle(color: AppColors.textMuted, fontSize: 13, height: 1.45),
          ),
          if (_claimableCount > 0) ...[
            const SizedBox(height: 8),
            Text(
              'wallet.earnReadyCount'.tr(namedArgs: {'count': '$_claimableCount'}),
              style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700, fontSize: 12.5),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSummary() {
    final streak = _home!['streak'] as Map<String, dynamic>?;
    final missions = _home!['missions'] as List<dynamic>? ?? [];
    final claimed = missions.where((m) => (m as Map)['status'] == 'claimed').length;
    return Row(
      children: [
        Expanded(child: _summaryTile('wallet.earnSummaryReady'.tr(), '$_claimableCount')),
        const SizedBox(width: 8),
        Expanded(child: _summaryTile('wallet.earnSummaryStreak'.tr(), '${streak?['currentStreak'] ?? 0}')),
        const SizedBox(width: 8),
        Expanded(child: _summaryTile('wallet.earnSummaryMissions'.tr(), '$claimed/${missions.length}')),
      ],
    );
  }

  Widget _summaryTile(String label, String value) {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      showGoldBar: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildHubTabs() {
    final streakClaimable = (_home!['streak'] as Map?)?['canClaim'] == true;
    final tabs = [
      ('earn', 'wallet.earnHubTabEarn'.tr()),
      ('streak', 'wallet.earnHubTabStreak'.tr()),
      ('history', 'wallet.earnHubTabHistory'.tr()),
    ];
    return Row(
      children: tabs.map((tab) {
        final selected = _hubTab == tab.$1;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: InkWell(
              onTap: () => setState(() => _hubTab = tab.$1),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? AppColors.gold.withValues(alpha: 0.12) : Colors.transparent,
                  border: Border.all(
                    color: selected ? AppColors.gold.withValues(alpha: 0.45) : Colors.white.withValues(alpha: 0.08),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      tab.$2,
                      style: TextStyle(
                        color: selected ? AppColors.gold : AppColors.textMuted,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                    if (tab.$1 == 'earn' && _claimableCount > 0) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        color: AppColors.gold,
                        child: Text(
                          '$_claimableCount',
                          style: const TextStyle(color: Color(0xFF111111), fontSize: 10, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                    if (tab.$1 == 'streak' && streakClaimable) ...[
                      const SizedBox(width: 6),
                      Container(width: 6, height: 6, decoration: BoxDecoration(color: AppColors.gold, shape: BoxShape.circle)),
                    ],
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _panelShell({
    required String title,
    required String subtitle,
    required Widget child,
    String? reward,
  }) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(title, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w800, fontSize: 15)),
              ),
              if (reward != null)
                Text(reward, style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 6),
          Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 12.5, height: 1.45)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildStreakPanel() {
    final streak = _home!['streak'] as Map<String, dynamic>?;
    if (streak == null || streak['enabled'] != true) {
      return GlassCard(child: Text('wallet.streakDisabled'.tr(), style: const TextStyle(color: AppColors.textMuted)));
    }
    final canClaim = streak['canClaim'] == true;
    return _panelShell(
      title: 'wallet.streakTitle'.tr(),
      subtitle: 'wallet.streakHint'.tr(),
      reward: '${streak['totalReward'] ?? 0} BAC',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'wallet.streakDays'.tr(namedArgs: {'days': '${streak['currentStreak'] ?? 0}'}),
            style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          if (canClaim)
            GoldButton(
              label: 'wallet.streakClaim'.tr(),
              loading: _claimingKey == 'streak',
              onPressed: () async {
                setState(() => _claimingKey = 'streak');
                await _afterClaim(await _engagement.claimStreak(), successKey: 'wallet.streakClaimSuccess');
                if (mounted) setState(() => _claimingKey = null);
              },
            )
          else
            Text('wallet.streakCheckIn'.tr(), style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildMissionsPanel() {
    final missions = _home!['missions'] as List<dynamic>? ?? [];
    if (missions.isEmpty) return const SizedBox.shrink();
    return Column(
      children: missions.map((raw) {
        final item = raw as Map<String, dynamic>;
        final mission = item['mission'] as Map<String, dynamic>? ?? {};
        final id = item['id'] as String? ?? '';
        final status = item['status'] as String? ?? 'active';
        final progress = (item['progress'] as num?)?.toInt() ?? 0;
        final target = (item['target'] as num?)?.toInt() ?? 1;
        final reward = (mission['reward']?['bacAmount'] as num?)?.toInt() ?? 0;
        final canClaim = status == 'completed';
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _panelShell(
            title: mission['title'] as String? ?? 'Mission',
            subtitle: mission['description'] as String? ?? '',
            reward: '$reward BAC',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LinearProgressIndicator(
                  value: target > 0 ? (progress / target).clamp(0, 1) : 0,
                  backgroundColor: Colors.white.withValues(alpha: 0.08),
                  color: AppColors.gold,
                  minHeight: 6,
                ),
                const SizedBox(height: 8),
                Text('$progress/$target', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                if (canClaim) ...[
                  const SizedBox(height: 10),
                  GoldButton(
                    label: 'wallet.earnClaim'.tr(),
                    loading: _claimingKey == id,
                    onPressed: () async {
                      setState(() => _claimingKey = id);
                      await _afterClaim(await _engagement.claimMission(id), successKey: 'wallet.earnClaimSuccess');
                      if (mounted) setState(() => _claimingKey = null);
                    },
                  ),
                ] else if (status == 'claimed')
                  Text('wallet.earnClaimed'.tr(), style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w700, fontSize: 12)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildWelcomePanel() {
    final welcome = _home!['welcome'] as Map<String, dynamic>?;
    final milestones = welcome?['milestones'] as List<dynamic>? ?? [];
    if (welcome?['enabled'] != true || milestones.isEmpty) return const SizedBox.shrink();
    return Column(
      children: milestones.map((raw) {
        final item = raw as Map<String, dynamic>;
        final key = item['key'] as String? ?? '';
        final canClaim = item['canClaim'] == true;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _panelShell(
            title: item['title'] as String? ?? 'Welcome',
            subtitle: item['description'] as String? ?? '',
            reward: '${item['bacAmount'] ?? 0} BAC',
            child: canClaim
                ? GoldButton(
                    label: 'wallet.welcomeClaim'.tr(),
                    loading: _claimingKey == 'welcome:$key',
                    onPressed: () async {
                      setState(() => _claimingKey = 'welcome:$key');
                      await _afterClaim(await _engagement.claimWelcome(key), successKey: 'wallet.welcomeClaimSuccess');
                      if (mounted) setState(() => _claimingKey = null);
                    },
                  )
                : Text(
                    item['status'] == 'claimed' ? 'wallet.welcomeClaimed'.tr() : 'wallet.welcomeLocked'.tr(),
                    style: TextStyle(
                      color: item['status'] == 'claimed' ? AppColors.success : AppColors.textMuted,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildReferralMilestonesPanel() {
    final referral = _home!['referral'] as Map<String, dynamic>?;
    final tiers = referral?['tiers'] as List<dynamic>? ?? [];
    if (referral?['enabled'] != true || tiers.isEmpty) return const SizedBox.shrink();
    return Column(
      children: tiers.map((raw) {
        final item = raw as Map<String, dynamic>;
        final key = item['key'] as String? ?? '';
        final canClaim = item['canClaim'] == true;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _panelShell(
            title: item['title'] as String? ?? 'Referral',
            subtitle: item['description'] as String? ?? '',
            reward: '${item['bacAmount'] ?? 0} BAC',
            child: canClaim
                ? GoldButton(
                    label: 'wallet.referralMilestoneClaim'.tr(),
                    loading: _claimingKey == 'referral:$key',
                    onPressed: () async {
                      setState(() => _claimingKey = 'referral:$key');
                      await _afterClaim(await _engagement.claimReferralMilestone(key), successKey: 'wallet.referralMilestoneClaimSuccess');
                      if (mounted) setState(() => _claimingKey = null);
                    },
                  )
                : Text(
                    '${item['progress'] ?? 0}/${item['threshold'] ?? 0} referrals',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildWeeklyArenaPanel() {
    final weekly = _home!['weeklyArena'] as Map<String, dynamic>?;
    if (weekly?['enabled'] != true) return const SizedBox.shrink();
    final progress = (weekly!['progress'] as num?)?.toInt() ?? 0;
    final target = (weekly['targetWins'] as num?)?.toInt() ?? 1;
    return _panelShell(
      title: weekly['title'] as String? ?? 'wallet.weeklyArenaTitle'.tr(),
      subtitle: weekly['description'] as String? ?? '',
      reward: '${weekly['bacAmount'] ?? 0} BAC',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LinearProgressIndicator(
            value: target > 0 ? (progress / target).clamp(0, 1) : 0,
            backgroundColor: Colors.white.withValues(alpha: 0.08),
            color: AppColors.gold,
            minHeight: 6,
          ),
          const SizedBox(height: 8),
          Text('wallet.weeklyArenaProgress'.tr(namedArgs: {'current': '$progress', 'target': '$target'})),
          if (weekly['canClaim'] == true) ...[
            const SizedBox(height: 10),
            GoldButton(
              label: 'wallet.weeklyArenaClaim'.tr(),
              loading: _claimingKey == 'weekly',
              onPressed: () async {
                setState(() => _claimingKey = 'weekly');
                await _afterClaim(await _engagement.claimWeeklyArena(), successKey: 'wallet.weeklyArenaClaimSuccess');
                if (mounted) setState(() => _claimingKey = null);
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLevelPanel() {
    final level = _home!['level'] as Map<String, dynamic>?;
    if (level?['enabled'] != true) return const SizedBox.shrink();
    return _panelShell(
      title: 'wallet.levelTitle'.tr(),
      subtitle: level?['title']?['title'] as String? ?? '',
      reward: 'Lv ${level?['level'] ?? 1}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LinearProgressIndicator(
            value: ((level?['progressPct'] as num?) ?? 0) / 100,
            backgroundColor: Colors.white.withValues(alpha: 0.08),
            color: AppColors.gold,
            minHeight: 6,
          ),
          const SizedBox(height: 8),
          Text(
            'wallet.levelXpProgress'.tr(namedArgs: {
              'current': '${level?['xpIntoLevel'] ?? 0}',
              'target': '${level?['xpToNext'] ?? 0}',
            }),
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildSharePanel() {
    final share = _home!['shareToEarn'] as Map<String, dynamic>?;
    if (share?['enabled'] != true) return const SizedBox.shrink();
    return _panelShell(
      title: share!['title'] as String? ?? 'wallet.shareToEarnTitle'.tr(),
      subtitle: share['description'] as String? ?? '',
      reward: '${share['bacAmount'] ?? 0} BAC',
      child: Text('wallet.shareToEarnHint'.tr(), style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
    );
  }

  Widget _buildDepositBonusPanel() {
    final promo = _home!['depositBonusDays'] as Map<String, dynamic>?;
    if (promo?['enabled'] != true || promo?['active'] != true) return const SizedBox.shrink();
    return _panelShell(
      title: promo!['title'] as String? ?? 'wallet.depositBonusTitle'.tr(),
      subtitle: promo['description'] as String? ?? '',
      reward: '+${promo['percent'] ?? 0}%',
      child: Text('wallet.depositBonusActive'.tr(), style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w700, fontSize: 12)),
    );
  }

  Widget _buildLuckySpinPanel() {
    final spin = _home!['luckySpin'] as Map<String, dynamic>?;
    if (spin?['enabled'] != true) return const SizedBox.shrink();
    final remaining = (spin!['remaining'] as num?)?.toInt() ?? 0;
    return _panelShell(
      title: spin['title'] as String? ?? 'wallet.luckySpinTitle'.tr(),
      subtitle: spin['description'] as String? ?? '',
      reward: '${spin['dailyFreeSpins'] ?? 0}/day',
      child: GoldButton(
        label: remaining > 0 ? 'wallet.luckySpinCta'.tr() : 'wallet.luckySpinUsed'.tr(),
        loading: _claimingKey == 'spin',
        onPressed: remaining <= 0
            ? null
            : () async {
                setState(() => _claimingKey = 'spin');
                await _afterClaim(await _engagement.spinLucky(), successKey: 'wallet.luckySpinSuccess');
                if (mounted) setState(() => _claimingKey = null);
              },
      ),
    );
  }

  Widget _buildSquadPanel() {
    final squad = _home!['squadChallenge'] as Map<String, dynamic>?;
    if (squad?['enabled'] != true) return const SizedBox.shrink();
    final info = squad!['squad'] as Map<String, dynamic>?;
    final hasSquad = info != null;
    return _panelShell(
      title: squad['title'] as String? ?? 'wallet.squadChallengeTitle'.tr(),
      subtitle: squad['description'] as String? ?? '',
      reward: '${squad['bacAmount'] ?? 0} BAC',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (hasSquad) ...[
            Text(info['name'] as String? ?? 'Squad', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
            Text('wallet.squadChallengeInviteCode'.tr(namedArgs: {'code': info['inviteCode'] as String? ?? ''}), style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: () {
                final targetWins = (squad['targetWins'] as num?)?.toInt() ?? 1;
                if (targetWins <= 0) return 0.0;
                return (((squad['progress'] as num?) ?? 0) / targetWins).clamp(0.0, 1.0).toDouble();
              }(),
              backgroundColor: Colors.white.withValues(alpha: 0.08),
              color: AppColors.gold,
              minHeight: 6,
            ),
            const SizedBox(height: 10),
            if (squad['canClaim'] == true)
              GoldButton(
                label: 'wallet.squadChallengeClaim'.tr(),
                loading: _claimingKey == 'squad',
                onPressed: () async {
                  setState(() => _claimingKey = 'squad');
                  await _afterClaim(await _engagement.claimSquad(), successKey: 'wallet.squadChallengeClaimSuccess');
                  if (mounted) setState(() => _claimingKey = null);
                },
              )
            else
              TextButton(onPressed: _squadBusy ? null : () async {
                setState(() => _squadBusy = true);
                await _afterClaim(await _engagement.leaveSquad(), successKey: 'wallet.squadChallengeLeaveSuccess');
                if (mounted) setState(() => _squadBusy = false);
              }, child: Text('wallet.squadChallengeLeave'.tr())),
          ] else ...[
            TextField(
              controller: _squadNameController,
              decoration: InputDecoration(hintText: 'wallet.squadChallengeNamePlaceholder'.tr(), isDense: true),
              style: const TextStyle(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            GoldButton(
              label: 'wallet.squadChallengeCreate'.tr(),
              loading: _squadBusy,
              onPressed: () async {
                setState(() => _squadBusy = true);
                await _afterClaim(await _engagement.createSquad(_squadNameController.text.trim()), successKey: 'wallet.squadChallengeCreateSuccess');
                _squadNameController.clear();
                if (mounted) setState(() => _squadBusy = false);
              },
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _squadCodeController,
              decoration: InputDecoration(hintText: 'wallet.squadChallengeCodePlaceholder'.tr(), isDense: true),
              style: const TextStyle(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            GoldButton(
              label: 'wallet.squadChallengeJoin'.tr(),
              uppercase: false,
              loading: _squadBusy,
              onPressed: () async {
                setState(() => _squadBusy = true);
                await _afterClaim(await _engagement.joinSquad(_squadCodeController.text.trim()), successKey: 'wallet.squadChallengeJoinSuccess');
                _squadCodeController.clear();
                if (mounted) setState(() => _squadBusy = false);
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSeasonPassPanel() {
    final season = _home!['seasonPass'] as Map<String, dynamic>?;
    if (season?['enabled'] != true) return const SizedBox.shrink();
    final tiers = season!['tiers'] as List<dynamic>? ?? [];
    return _panelShell(
      title: season['title'] as String? ?? 'wallet.seasonPassTitle'.tr(),
      subtitle: season['description'] as String? ?? '',
      reward: '${season['xp'] ?? 0} XP',
      child: Column(
        children: tiers.map((raw) {
          final tier = raw as Map<String, dynamic>;
          final level = (tier['level'] as num?)?.toInt() ?? 0;
          final free = tier['freeReward'] as Map<String, dynamic>? ?? {};
          final plus = tier['plusReward'] as Map<String, dynamic>? ?? {};
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('wallet.seasonPassTierLabel'.tr(namedArgs: {'level': '$level'}), style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: GoldButton(
                        label: '${free['label'] ?? 'Free'} (${free['bacAmount'] ?? 0})',
                        uppercase: false,
                        height: 36,
                        loading: _claimingKey == 'free:$level',
                        onPressed: tier['canClaimFree'] == true
                            ? () async {
                                setState(() => _claimingKey = 'free:$level');
                                await _afterClaim(await _engagement.claimSeasonPass(level, 'free'), successKey: 'wallet.seasonPassClaimSuccess');
                                if (mounted) setState(() => _claimingKey = null);
                              }
                            : null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: GoldButton(
                        label: '${plus['label'] ?? 'Plus'} (${plus['bacAmount'] ?? 0})',
                        uppercase: false,
                        height: 36,
                        loading: _claimingKey == 'plus:$level',
                        onPressed: tier['canClaimPlus'] == true
                            ? () async {
                                setState(() => _claimingKey = 'plus:$level');
                                await _afterClaim(await _engagement.claimSeasonPass(level, 'plus'), successKey: 'wallet.seasonPassClaimSuccess');
                                if (mounted) setState(() => _claimingKey = null);
                              }
                            : null,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEarnHistoryPanel() {
    if (_earnHistory.isEmpty) {
      return GlassCard(child: Text('wallet.earnHistoryEmpty'.tr(), style: const TextStyle(color: AppColors.textMuted)));
    }
    return Column(
      children: _earnHistory.map((tx) {
        final isCredit = tx.type == 'deposit' || tx.type == 'earning';
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: GlassCard(
            padding: const EdgeInsets.all(12),
            showGoldBar: false,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_earnHistoryTitle(tx), style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13)),
                      Text(DateFormat.yMMMd().add_jm().format(tx.createdAt ?? DateTime.now()), style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                ),
                Text(
                  '${isCredit ? '+' : '-'}${tx.amount.toStringAsFixed(2)} BAC',
                  style: TextStyle(color: isCredit ? AppColors.success : AppColors.error, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  String _earnHistoryTitle(BalanceHistoryModel tx) {
    final reason = tx.detail?['reason'] as String? ?? '';
    switch (reason) {
      case 'engagement_streak_reward':
        return 'wallet.streakReward'.tr();
      case 'engagement_welcome_reward':
        return tx.detail?['welcomeTitle'] as String? ?? 'wallet.welcomeReward'.tr();
      case 'engagement_referral_reward':
        return tx.detail?['referralTierTitle'] as String? ?? 'wallet.referralMilestoneReward'.tr();
      case 'engagement_weekly_reward':
        return tx.detail?['weeklyTitle'] as String? ?? 'wallet.weeklyArenaReward'.tr();
      case 'engagement_share_reward':
        return 'wallet.shareToEarnTitle'.tr();
      case 'engagement_deposit_bonus':
        return 'wallet.depositBonusTitle'.tr();
      case 'engagement_spin_reward':
        return tx.detail?['prizeLabel'] as String? ?? 'wallet.luckySpinTitle'.tr();
      case 'engagement_squad_reward':
        return tx.detail?['squadTitle'] as String? ?? 'wallet.squadChallengeReward'.tr();
      case 'engagement_season_pass_reward':
        return tx.detail?['seasonTitle'] as String? ?? 'wallet.seasonPassReward'.tr();
      default:
        return tx.detail?['missionTitle'] as String? ?? 'wallet.earnMissionReward'.tr();
    }
  }
}
