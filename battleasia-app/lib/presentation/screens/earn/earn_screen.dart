import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/engagement_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';

/// Native Earn hub — same jobs as the website, built as Flutter cards.
class EarnScreen extends StatefulWidget {
  const EarnScreen({super.key});

  @override
  State<EarnScreen> createState() => _EarnScreenState();
}

class _EarnScreenState extends State<EarnScreen> {
  final EngagementService _api = EngagementService();
  final UserService _users = UserService();
  final TextEditingController _squadChat = TextEditingController();
  final ScrollController _scroll = ScrollController();
  final TextEditingController _squadName = TextEditingController();
  final TextEditingController _invite = TextEditingController();

  Map<String, dynamic>? _home;
  List<Map<String, dynamic>> _badges = [];
  List<Map<String, dynamic>> _claims = [];
  List<Map<String, dynamic>> _squadMessages = [];
  String _tab = 'overview';
  String? _error;
  String _busy = '';
  bool _loading = true;

  static const _tabs = ['overview', 'missions', 'streak', 'spin', 'squad', 'season', 'badges', 'claims'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _scroll.dispose();
    _squadName.dispose();
    _invite.dispose();
    _squadChat.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _home == null;
      _error = null;
    });
    final home = await _api.getHome();
    final badges = await _api.getBadges();
    final history = await _users.getBalanceHistory(page: 1, limit: 80);
    final chat = await _api.getSquadChat();
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (home['success'] == true && home['data'] is Map) {
        _home = Map<String, dynamic>.from(home['data'] as Map);
      } else {
        _error = home['message']?.toString() ?? 'Could not load Earn';
      }
      final badgeData = badges['data'];
      if (badgeData is Map && badgeData['badges'] is List) {
        _badges = (badgeData['badges'] as List)
            .whereType<Map>()
            .map((row) => Map<String, dynamic>.from(row))
            .toList();
      }
      final historyPayload = history['data'];
      final historyRows = historyPayload is Map ? historyPayload['results'] : historyPayload;
      _claims = historyRows is List
          ? historyRows.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).where(_isClaim).toList()
          : [];
      final chatRows = chat['data'];
      _squadMessages = chatRows is List
          ? chatRows.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList()
          : [];
    });
  }

  Future<void> _run(String id, Future<Map<String, dynamic>> Function() action) async {
    setState(() => _busy = id);
    final result = await action();
    if (!mounted) return;
    final data = result['data'];
    var message = result['success'] == true ? 'Claimed' : (result['message']?.toString() ?? 'Could not claim');
    if (result['success'] == true && data is Map && data['prizeLabel'] != null) {
      message = '${data['prizeLabel']} · +${data['bacAmount'] ?? 0} BAC';
    }
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    setState(() => _busy = '');
    if (result['success'] == true) await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          if (_loading)
            Center(child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2))
          else if (_error != null && _home == null)
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(_error!, style: const TextStyle(color: Colors.white)),
                  const SizedBox(height: 12),
                  FilledButton(onPressed: _load, child: const Text('Reload')),
                ],
              ),
            )
          else
            ListView(
              controller: _scroll,
              padding: const EdgeInsets.fromLTRB(16, 108, 16, 120),
              children: [
                _header(),
                const SizedBox(height: 14),
                _tabBar(),
                const SizedBox(height: 14),
                _body(),
              ],
            ),
          Positioned(top: 0, left: 0, right: 0, child: AppHeader(scrollController: _scroll)),
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  Widget _header() {
    final level = _map(_home?['level']);
    final title = _map(level['title'])['title']?.toString();
    final n = level['level'] ?? 1;
    final pct = (level['progressPct'] as num?)?.toDouble() ?? 0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('nav.earn'.tr().toUpperCase(), style: TextStyle(color: AppColors.gold, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
        const SizedBox(height: 4),
        const Text('Earn', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800)),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF121318),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 72,
                height: 72,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      value: (pct / 100).clamp(0, 1),
                      strokeWidth: 6,
                      backgroundColor: Colors.white.withValues(alpha: 0.08),
                      color: AppColors.gold,
                    ),
                    Text('${pct.round()}%', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title == null || title.isEmpty ? 'Rookie' : title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text('Level $n · ${level['xp'] ?? 0} XP', style: TextStyle(color: Colors.white.withValues(alpha: 0.62))),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _tabBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _tabs.map((id) {
          final on = _tab == id;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => setState(() => _tab = id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: on ? AppColors.gold.withValues(alpha: 0.16) : const Color(0xFF121318),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: on ? AppColors.gold.withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.1)),
                ),
                child: Text(
                  id[0].toUpperCase() + id.substring(1),
                  style: TextStyle(color: on ? AppColors.gold : Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _body() {
    final home = _home ?? {};
    switch (_tab) {
      case 'missions':
        return _missions(_list(home['missions']));
      case 'streak':
        return _streak(_map(home['streak']));
      case 'spin':
        return _spin(_map(home['luckySpin']));
      case 'squad':
        return _squad(_map(home['squadChallenge']));
      case 'season':
        return _season(_map(home['seasonPass']));
      case 'badges':
        return _badgeList();
      case 'claims':
        return _claimsList();
      default:
        return _overview(home);
    }
  }

  Widget _overview(Map<String, dynamic> home) {
    final welcome = _map(home['welcome']);
    final streak = _map(home['streak']);
    final spin = _map(home['luckySpin']);
    final squad = _map(home['squadChallenge']);
    final season = _map(home['seasonPass']);
    final weekly = _map(home['weeklyArena']);
    final missions = _list(home['missions']);
    final ready = missions.where((m) => m['status'] == 'completed').length;
    final milestones = _list(welcome['milestones']);
    return Column(
      children: [
        for (final w in milestones)
          _task(
            title: w['title']?.toString() ?? 'Welcome',
            detail: w['claimedAt'] != null ? 'Claimed' : (w['description']?.toString() ?? 'Welcome bonus'),
            reward: '+${w['bacAmount'] ?? 0}',
            action: w['canClaim'] == true ? 'Claim' : (w['claimedAt'] != null ? 'Done' : 'Open'),
            enabled: w['canClaim'] == true && _busy != w['key'],
            onTap: w['canClaim'] == true ? () => _run('${w['key']}', () => _api.claimWelcome('${w['key']}')) : null,
          ),
        _task(
          title: 'Missions',
          detail: ready > 0 ? '$ready ready to claim' : '${missions.length} open',
          reward: '${missions.length}',
          action: 'Open',
          enabled: true,
          onTap: () => setState(() => _tab = 'missions'),
        ),
        _task(
          title: 'Streak',
          detail: 'Current ${streak['currentStreak'] ?? 0}',
          reward: '+${streak['todayReward'] ?? 0}',
          action: streak['canClaim'] == true ? 'Claim' : 'Open',
          enabled: true,
          onTap: () => setState(() => _tab = 'streak'),
        ),
        _task(
          title: 'Spin',
          detail: '${spin['remaining'] ?? 0} left today',
          reward: '${spin['remaining'] ?? 0}',
          action: 'Spin',
          enabled: true,
          onTap: () => setState(() => _tab = 'spin'),
        ),
        _task(
          title: 'Squad',
          detail: '${squad['winCount'] ?? 0}/${squad['targetWins'] ?? 0} wins',
          reward: '${squad['winCount'] ?? 0}',
          action: 'Open',
          enabled: true,
          onTap: () => setState(() => _tab = 'squad'),
        ),
        _task(
          title: 'Season',
          detail: 'Tier ${season['currentTier'] ?? 0}',
          reward: '${season['claimableCount'] ?? 0}',
          action: 'Open',
          enabled: true,
          onTap: () => setState(() => _tab = 'season'),
        ),
        if (weekly['enabled'] == true)
          _task(
            title: 'Weekly arena',
            detail: 'Your rank ${weekly['viewerRank'] ?? '—'}',
            reward: 'BAC',
            action: _busy == 'weekly' ? '…' : 'Claim',
            enabled: _busy != 'weekly',
            onTap: () => _run('weekly', _api.claimWeeklyArena),
          ),
      ],
    );
  }

  Widget _missions(List<Map<String, dynamic>> missions) {
    if (missions.isEmpty) return _empty('No missions yet. Play a match to unlock some.');
    return Column(
      children: missions.map((m) {
        final mission = _map(m['mission']);
        final reward = _map(mission['reward']);
        final progress = (m['progress'] as num?)?.toDouble() ?? 0;
        final target = (m['target'] as num?)?.toDouble() ?? 1;
        final done = m['status'] == 'completed';
        return _task(
          title: mission['title']?.toString() ?? 'Mission',
          detail: '${mission['description'] ?? ''}\n${progress.round()}/${target.round()}',
          reward: '+${reward['bacAmount'] ?? 0}',
          action: done ? 'Claim' : (m['status']?.toString() ?? 'Active'),
          enabled: done && _busy != m['id'],
          progress: target <= 0 ? 0 : (progress / target).clamp(0, 1),
          onTap: done ? () => _run('${m['id']}', () => _api.claimMission('${m['id']}')) : null,
        );
      }).toList(),
    );
  }

  Widget _streak(Map<String, dynamic> streak) {
    final days = _list(streak['calendar']);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _task(
          title: '${streak['currentStreak'] ?? 0} day streak',
          detail: 'Longest ${streak['longestStreak'] ?? 0}',
          reward: '+${streak['todayReward'] ?? 0}',
          action: streak['canClaim'] == true ? 'Claim' : (streak['claimedToday'] == true ? 'Claimed' : 'Checked'),
          enabled: streak['canClaim'] == true && _busy != 'streak',
          onTap: streak['canClaim'] == true ? () => _run('streak', _api.claimStreak) : null,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: days.map((day) {
            final on = day['checkedIn'] == true;
            return Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: on ? AppColors.gold.withValues(alpha: 0.2) : const Color(0xFF121318),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: day['isToday'] == true ? AppColors.gold : Colors.white.withValues(alpha: 0.1)),
              ),
              child: Text(
                '${day['date'] ?? ''}'.length >= 10 ? '${day['date']}'.substring(8) : '',
                style: TextStyle(color: on ? AppColors.gold : Colors.white, fontWeight: FontWeight.w700),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _spin(Map<String, dynamic> spin) {
    if (spin['enabled'] == false) return _empty('Spin is off right now.');
    final recent = _list(spin['recent']);
    return Column(
      children: [
        _task(
          title: spin['title']?.toString().isNotEmpty == true ? spin['title'].toString() : 'Lucky spin',
          detail: '${spin['remaining'] ?? 0} of ${spin['dailyFreeSpins'] ?? 0} left',
          reward: '${spin['remaining'] ?? 0}',
          action: _busy == 'spin' ? '...' : 'Spin',
          enabled: ((spin['remaining'] as num?) ?? 0) > 0 && _busy != 'spin',
          onTap: () => _run('spin', _api.spinLucky),
        ),
        for (final row in recent)
          _task(
            title: row['prizeLabel']?.toString() ?? 'Prize',
            detail: 'Recent spin',
            reward: '+${row['bacAmount'] ?? 0}',
            action: 'Won',
            enabled: false,
            onTap: null,
          ),
      ],
    );
  }

  Widget _squad(Map<String, dynamic> squad) {
    final info = _map(squad['squad']);
    final hasSquad = info.isNotEmpty;
    return Column(
      children: [
        if (hasSquad)
          _task(
            title: info['name']?.toString() ?? 'Squad',
            detail: 'Code ${info['inviteCode'] ?? '—'} · ${squad['winCount'] ?? 0}/${squad['targetWins'] ?? 0} wins',
            reward: '+${squad['bacAmount'] ?? 0}',
            action: squad['canClaim'] == true ? 'Claim' : 'Leave',
            enabled: _busy != 'squad',
            onTap: () => squad['canClaim'] == true
                ? _run('squad', _api.claimSquad)
                : _run('squad', _api.leaveSquad),
          ),
        if (hasSquad) ..._squadChatBox(),
        if (!hasSquad) ...[
          _field(_squadName, 'Squad name'),
          const SizedBox(height: 8),
          _task(
            title: 'Create a squad',
            detail: 'Start a team and share the code',
            reward: '',
            action: 'Create',
            enabled: _busy != 'create',
            onTap: () => _run('create', () => _api.createSquad(_squadName.text.trim())),
          ),
          _field(_invite, 'Invite code'),
          const SizedBox(height: 8),
          _task(
            title: 'Join with a code',
            detail: 'Enter a friend\'s squad code',
            reward: '',
            action: 'Join',
            enabled: _busy != 'join',
            onTap: () => _run('join', () => _api.joinSquad(_invite.text.trim())),
          ),
        ],
      ],
    );
  }

  List<Widget> _squadChatBox() {
    return [
      const SizedBox(height: 8),
      const Align(
        alignment: Alignment.centerLeft,
        child: Text('Squad chat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
      const SizedBox(height: 8),
      ..._squadMessages.map(
        (row) => Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Text(
            '${row['username'] ?? 'Player'}: ${row['body'] ?? ''}',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      ),
      Row(
        children: [
          Expanded(
            child: TextField(
              controller: _squadChat,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(hintText: 'Message the squad'),
            ),
          ),
          TextButton(
            onPressed: _busy == 'squad-chat'
                ? null
                : () async {
                    final text = _squadChat.text.trim();
                    if (text.isEmpty) return;
                    setState(() => _busy = 'squad-chat');
                    final result = await _api.sendSquadChat(text);
                    if (!mounted) return;
                    setState(() => _busy = '');
                    if (result['success'] == true) {
                      _squadChat.clear();
                      await _load();
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(result['message']?.toString() ?? 'Could not send')),
                      );
                    }
                  },
            child: const Text('Send'),
          ),
        ],
      ),
    ];
  }

  Widget _season(Map<String, dynamic> season) {
    if (season['enabled'] == false) return _empty('Season pass is off.');
    final tiers = _list(season['tiers']);
    return Column(
      children: [
        _task(
          title: season['title']?.toString().isNotEmpty == true ? season['title'].toString() : 'Season',
          detail: 'Tier ${season['currentTier'] ?? 0} · ${season['xp'] ?? 0} XP',
          reward: '${season['claimableCount'] ?? 0}',
          action: 'Live',
          enabled: false,
          onTap: null,
        ),
        for (final tier in tiers)
          _task(
            title: 'Tier ${tier['level'] ?? ''}',
            detail: '${tier['xpRequired'] ?? 0} XP',
            reward: tier['canClaimFree'] == true ? 'Free' : (tier['canClaimPlus'] == true ? 'Plus' : 'Locked'),
            action: tier['canClaimFree'] == true || tier['canClaimPlus'] == true ? 'Claim' : '—',
            enabled: (tier['canClaimFree'] == true || tier['canClaimPlus'] == true) && _busy != 'tier-${tier['level']}',
            onTap: () {
              final track = tier['canClaimFree'] == true ? 'free' : 'plus';
              final level = (tier['level'] as num?)?.toInt() ?? 0;
              if (level < 1) return;
              _run('tier-$level', () => _api.claimSeasonPass(level, track));
            },
          ),
      ],
    );
  }

  Widget _claimsList() {
    if (_claims.isEmpty) return _empty('No earn claims yet.');
    return Column(
      children: _claims.map((row) {
        final detail = row['detail'] is Map ? Map<String, dynamic>.from(row['detail'] as Map) : <String, dynamic>{};
        final label = detail['missionTitle']?.toString().isNotEmpty == true
            ? detail['missionTitle'].toString()
            : (row['type'] ?? row['reason'] ?? 'claim').toString().replaceAll('_', ' ');
        return _task(
          title: label,
          detail: row['createdAt']?.toString() ?? '',
          reward: '+${row['amount'] ?? 0}',
          action: 'Claimed',
          enabled: false,
          onTap: null,
        );
      }).toList(),
    );
  }

  bool _isClaim(Map<String, dynamic> row) {
    final detail = row['detail'] is Map ? Map<String, dynamic>.from(row['detail'] as Map) : <String, dynamic>{};
    final cat = (row['category'] ?? detail['category'] ?? '').toString();
    final type = (row['type'] ?? '').toString();
    final reason = (detail['reason'] ?? row['reason'] ?? '').toString();
    return cat == 'claim' ||
        type.startsWith('engagement_') ||
        reason.startsWith('engagement_') ||
        reason == 'referral_commission' ||
        reason == 'watch_to_earn' ||
        type == 'earning';
  }

  Widget _badgeList() {
    if (_badges.isEmpty) return _empty('No badges yet.');
    return Column(
      children: _badges.map((badge) {
        final unlocked = badge['unlocked'] == true || badge['earned'] == true;
        return _task(
          title: badge['title']?.toString() ?? 'Badge',
          detail: badge['description']?.toString() ?? '',
          reward: unlocked ? 'Unlocked' : 'Locked',
          action: unlocked ? 'Got' : '—',
          enabled: false,
          onTap: null,
        );
      }).toList(),
    );
  }

  Widget _task({
    required String title,
    required String detail,
    required String reward,
    required String action,
    required bool enabled,
    required VoidCallback? onTap,
    double? progress,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF121318),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    if (detail.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 3),
                        child: Text(detail, style: TextStyle(color: Colors.white.withValues(alpha: 0.55), fontSize: 12)),
                      ),
                  ],
                ),
              ),
              if (reward.isNotEmpty)
                Text(reward, style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w800)),
            ],
          ),
          if (progress != null) ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 4,
                backgroundColor: Colors.white.withValues(alpha: 0.08),
                color: AppColors.gold,
              ),
            ),
          ],
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: FilledButton(
              onPressed: enabled ? onTap : null,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: const Color(0xFF111111),
                disabledBackgroundColor: Colors.white.withValues(alpha: 0.08),
                disabledForegroundColor: Colors.white54,
                minimumSize: const Size(88, 36),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
              ),
              child: Text(action),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(TextEditingController controller, String hint) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4)),
        filled: true,
        fillColor: const Color(0xFF121318),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(9),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.16)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(9),
          borderSide: BorderSide(color: AppColors.gold),
        ),
      ),
    );
  }

  Widget _empty(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Text(text, style: TextStyle(color: Colors.white.withValues(alpha: 0.6))),
    );
  }

  Map<String, dynamic> _map(dynamic value) {
    if (value is Map) return Map<String, dynamic>.from(value);
    return {};
  }

  List<Map<String, dynamic>> _list(dynamic value) {
    if (value is! List) return [];
    return value.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
  }
}
