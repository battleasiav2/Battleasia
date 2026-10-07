import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/services/labs_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/profile/public_profile_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';

/// Native Labs. Same flags and room actions as the website.
class LabsScreen extends StatefulWidget {
  final String? path;

  const LabsScreen({super.key, this.path});

  @override
  State<LabsScreen> createState() => _LabsScreenState();
}

class _LabsScreenState extends State<LabsScreen> {
  static const _labs = [
    ('liveGifting', 'live', 'live', 'Live + gifting'),
    ('watchParty', 'watch', 'watch', 'Watch party'),
    ('clans', 'clans', 'clan', 'Clans / wars'),
    ('fantasy', 'fantasy', 'fantasy', 'Fantasy lineups'),
    ('oneVone', 'duel', 'duel', '1v1 duels'),
    ('customizationStore', 'cosmetics', 'cosmetic', 'Customization store'),
    ('ocrResults', 'ocr', 'ocr', 'OCR results'),
    ('creatorLeaderboard', 'creators', 'creators', 'Creator board'),
  ];

  final LabsService _api = LabsService();
  final ScrollController _scroll = ScrollController();

  Map<String, dynamic> _flags = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFlags();
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _loadFlags() async {
    final result = await _api.flags();
    if (!mounted) return;
    setState(() {
      _loading = false;
      final data = result['data'];
      _flags = data is Map ? Map<String, dynamic>.from(data) : {};
    });
  }

  bool _on(String id) => _flags[id] == true;

  @override
  Widget build(BuildContext context) {
    final path = widget.path;
    (String, String, String, String)? spec;
    if (path != null) {
      for (final row in _labs) {
        if (row.$2 == path) spec = row;
      }
    }
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          ListView(
            controller: _scroll,
            padding: const EdgeInsets.fromLTRB(16, 108, 16, 120),
            children: [
              if (spec != null)
                TextButton.icon(
                  onPressed: () => Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const LabsScreen()),
                  ),
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  label: const Text('Labs', style: TextStyle(color: Colors.white)),
                ),
              Text('Labs', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w800, letterSpacing: 1)),
              Text(
                spec?.$4 ?? 'Labs',
                style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),
              if (_loading)
                Center(child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2))
              else if (spec == null)
                ..._labs.map((row) => _labTile(row))
              else if (!_on(spec.$1))
                const Text('This lab is off.', style: TextStyle(color: Colors.white70))
              else if (spec.$2 == 'creators')
                const _CreatorsBoard()
              else
                _LabBoard(kind: spec.$3, mode: spec.$2),
            ],
          ),
          Positioned(top: 0, left: 0, right: 0, child: AppHeader(scrollController: _scroll)),
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  Widget _labTile((String, String, String, String) row) {
    final on = _on(row.$1);
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(row.$4, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      subtitle: Text(on ? 'On' : 'Off', style: TextStyle(color: on ? AppColors.gold : Colors.white54)),
      onTap: () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => LabsScreen(path: row.$2)),
        );
      },
    );
  }
}

class _CreatorsBoard extends StatefulWidget {
  const _CreatorsBoard();

  @override
  State<_CreatorsBoard> createState() => _CreatorsBoardState();
}

class _CreatorsBoardState extends State<_CreatorsBoard> {
  final LabsService _api = LabsService();
  List<Map<String, dynamic>> _rows = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final result = await _api.creators();
    if (!mounted) return;
    final data = result['data'];
    final list = data is Map ? data['results'] : null;
    setState(() {
      _rows = list is List ? list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList() : [];
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_rows.isEmpty) return const Text('No creators yet.', style: TextStyle(color: Colors.white70));
    return Column(
      children: _rows.map((row) {
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text('#${row['rank']} ${row['username']}', style: const TextStyle(color: Colors.white)),
          subtitle: Text('${row['likes'] ?? 0} likes · ${row['posts'] ?? 0} posts', style: const TextStyle(color: Colors.white54)),
          onTap: () {
            final id = row['id']?.toString() ?? '';
            if (id.isEmpty) return;
            Navigator.push(context, MaterialPageRoute(builder: (_) => PublicProfileScreen(userId: id)));
          },
        );
      }).toList(),
    );
  }
}

class _LabBoard extends StatefulWidget {
  final String kind;
  final String mode;

  const _LabBoard({required this.kind, required this.mode});

  @override
  State<_LabBoard> createState() => _LabBoardState();
}

class _LabBoardState extends State<_LabBoard> {
  final LabsService _api = LabsService();
  final FeedService _files = FeedService();
  final _title = TextEditingController();
  final _tag = TextEditingController();
  final _picks = TextEditingController();
  final _draft = TextEditingController();
  final _gift = TextEditingController(text: '10');

  List<Map<String, dynamic>> _rows = [];
  Map<String, dynamic>? _open;
  String _equipped = '';
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _title.dispose();
    _tag.dispose();
    _picks.dispose();
    _draft.dispose();
    _gift.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final result = await _api.list(widget.kind);
    if (!mounted) return;
    if (result['success'] != true) {
      _toast(result['message']?.toString() ?? 'Could not load this lab');
      return;
    }
    final data = result['data'];
    final list = data is Map ? data['results'] : null;
    setState(() {
      _rows = list is List ? list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList() : [];
      _equipped = data is Map ? data['cosmeticId']?.toString() ?? '' : '';
    });
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _create({String? imageUrl}) async {
    setState(() => _busy = true);
    final result = await _api.create(widget.kind, {
      'title': _title.text.trim().isEmpty ? 'Room' : _title.text.trim(),
      if (widget.mode != 'duel') 'tag': _tag.text.trim(),
      if (widget.mode == 'duel') 'stake': num.tryParse(_tag.text) ?? 10,
      'picks': _picks.text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList(),
      if (imageUrl != null) 'imageUrl': imageUrl,
    });
    if (!mounted) return;
    setState(() => _busy = false);
    if (result['success'] == true) {
      _title.clear();
      _tag.clear();
      _picks.clear();
      _toast('Created');
      await _load();
    } else {
      _toast(result['message']?.toString() ?? 'Could not create');
    }
  }

  @override
  Widget build(BuildContext context) {
    final me = context.watch<AuthProvider>().user?.id;
    if (widget.mode == 'cosmetics') {
      return Column(
        children: _rows.map((row) {
          final tag = row['tag']?.toString() ?? '';
          final equipped = _equipped == tag;
          return ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(row['title']?.toString() ?? 'Skin', style: const TextStyle(color: Colors.white)),
            subtitle: Text('${row['priceBac'] ?? 0} BAC', style: const TextStyle(color: Colors.white54)),
            trailing: FilledButton(
              onPressed: _busy
                  ? null
                  : () async {
                      setState(() => _busy = true);
                      final result = await _api.create('cosmetic', {'tag': tag});
                      if (!mounted) return;
                      setState(() {
                        _busy = false;
                        if (result['success'] == true) _equipped = tag;
                      });
                      _toast(result['success'] == true ? (equipped ? 'Equipped' : 'Purchased') : (result['message']?.toString() ?? 'Could not buy'));
                    },
              child: Text(equipped ? 'Equipped' : 'Buy'),
            ),
          );
        }).toList(),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(controller: _title, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(hintText: 'Title')),
        if (widget.mode == 'clans')
          TextField(controller: _tag, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(hintText: 'Tag')),
        if (widget.mode == 'duel')
          TextField(controller: _tag, keyboardType: TextInputType.number, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(hintText: 'Stake')),
        if (widget.mode == 'fantasy')
          TextField(controller: _picks, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(hintText: 'Picks, comma separated')),
        const SizedBox(height: 8),
        if (widget.mode == 'ocr')
          OutlinedButton(
            onPressed: _busy
                ? null
                : () async {
                    final file = await ImagePicker().pickImage(source: ImageSource.gallery);
                    if (file == null) return;
                    setState(() => _busy = true);
                    final upload = await _files.uploadMedia(file.path, folder: 'support');
                    if (!mounted) return;
                    if (upload['success'] != true) {
                      setState(() => _busy = false);
                      _toast(upload['message']?.toString() ?? 'Upload failed');
                      return;
                    }
                    final url = (upload['data'] as Map?)?['url']?.toString();
                    await _create(imageUrl: url);
                  },
            child: const Text('Upload screenshot'),
          )
        else
          FilledButton(onPressed: _busy ? null : () => _create(), child: Text(_busy ? '…' : 'Create')),
        const SizedBox(height: 12),
        if (_rows.isEmpty) const Text('Nothing here yet.', style: TextStyle(color: Colors.white70)),
        ..._rows.map((row) {
          return ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(row['title']?.toString() ?? 'Room', style: const TextStyle(color: Colors.white)),
            subtitle: Text('${row['hostName'] ?? ''} · ${row['members'] ?? 0} in · ${row['hearts'] ?? 0} hearts', style: const TextStyle(color: Colors.white54)),
            trailing: TextButton(
              onPressed: () async {
                final result = await _api.join(widget.kind, row['id'].toString());
                if (!mounted) return;
                if (result['success'] == true && result['data'] is Map) {
                  final next = Map<String, dynamic>.from(result['data'] as Map);
                  setState(() {
                    _rows = _rows.map((item) => item['id'] == next['id'] ? next : item).toList();
                  });
                } else {
                  _toast(result['message']?.toString() ?? 'Could not join');
                }
              },
              child: Text(row['joined'] == true ? 'Joined' : 'Join'),
            ),
            onTap: () => setState(() => _open = Map<String, dynamic>.from(row)),
          );
        }),
        if (_open != null) _detail(me),
      ],
    );
  }

  Widget _detail(String? me) {
    final open = _open!;
    final messages = open['messages'] is List ? open['messages'] as List : [];
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF121318),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(open['title']?.toString() ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
          Text('Host ${open['hostName'] ?? ''} · ${open['members'] ?? 0} members', style: const TextStyle(color: Colors.white54)),
          if (widget.kind == 'live' || widget.kind == 'watch')
            Wrap(
              spacing: 8,
              children: [
                if (widget.kind == 'live')
                  TextButton(
                    onPressed: () async {
                      final result = await _api.heart(widget.kind, open['id'].toString());
                      final data = result['data'];
                      if (result['success'] == true && data is Map) {
                        setState(() => _open = {...open, 'hearts': data['hearts']});
                      }
                    },
                    child: Text('♥ ${open['hearts'] ?? 0}'),
                  ),
                if (widget.kind == 'live' && open['hostId'] != me)
                  TextButton(
                    onPressed: () async {
                      final result = await _api.gift(widget.kind, open['id'].toString(), num.tryParse(_gift.text) ?? 10);
                      if (result['success'] == true && result['data'] is Map) {
                        setState(() => _open = Map<String, dynamic>.from(result['data'] as Map));
                        _toast('Gift sent');
                      } else {
                        _toast(result['message']?.toString() ?? 'Gift failed');
                      }
                    },
                    child: const Text('Gift'),
                  ),
                TextButton(
                  onPressed: () async {
                    final result = await _api.watchEarn(widget.kind, open['id'].toString());
                    final data = result['data'];
                    if (result['success'] == true && data is Map) {
                      _toast((data['credited'] ?? 0) != 0 ? 'Watch reward added' : 'Already claimed');
                    } else {
                      _toast(result['message']?.toString() ?? 'Could not claim');
                    }
                  },
                  child: const Text('Watch earn'),
                ),
              ],
            ),
          if (widget.kind == 'clan' && open['hostId'] == me && open['status'] != 'war')
            Wrap(
              children: _rows.where((row) => row['id'] != open['id'] && row['tag'] != 'war').map((row) {
                return TextButton(
                  onPressed: () async {
                    final result = await _api.war(open['id'].toString(), row['id'].toString());
                    if (result['success'] == true && result['data'] is Map) {
                      setState(() => _open = Map<String, dynamic>.from(result['data'] as Map));
                      await _load();
                      _toast('War started');
                    } else {
                      _toast(result['message']?.toString() ?? 'War failed');
                    }
                  },
                  child: Text('War ${row['tag'] ?? row['title']}'),
                );
              }).toList(),
            ),
          if (widget.kind == 'fantasy' && open['hostId'] == me && open['status'] != 'scored')
            FilledButton(
              onPressed: () async {
                final result = await _api.score(open['id'].toString());
                if (result['success'] == true && result['data'] is Map) {
                  setState(() => _open = Map<String, dynamic>.from(result['data'] as Map));
                  await _load();
                  _toast('Scored');
                } else {
                  _toast(result['message']?.toString() ?? 'Could not score');
                }
              },
              child: const Text('Score'),
            ),
          if (widget.kind == 'duel' && open['hostId'] == me && open['status'] != 'complete')
            Wrap(
              children: [
                TextButton(
                  onPressed: me == null
                      ? null
                      : () async {
                          final result = await _api.resolveDuel(open['id'].toString(), me);
                          if (result['success'] == true && result['data'] is Map) {
                            setState(() => _open = Map<String, dynamic>.from(result['data'] as Map));
                            await _load();
                            _toast('Paid the host');
                          } else {
                            _toast(result['message']?.toString() ?? 'Could not resolve');
                          }
                        },
                  child: const Text('Pay me'),
                ),
                ...((open['memberIds'] as List?) ?? []).map((id) => id.toString()).where((id) => id != me).map(
                      (id) => TextButton(
                        onPressed: () async {
                          final result = await _api.resolveDuel(open['id'].toString(), id);
                          if (result['success'] == true && result['data'] is Map) {
                            setState(() => _open = Map<String, dynamic>.from(result['data'] as Map));
                            await _load();
                            _toast('Paid the opponent');
                          } else {
                            _toast(result['message']?.toString() ?? 'Could not resolve');
                          }
                        },
                        child: const Text('Pay opponent'),
                      ),
                    ),
              ],
            ),
          ...messages.whereType<Map>().map(
                (m) => Text('${m['username'] ?? ''}: ${m['body'] ?? ''}', style: const TextStyle(color: Colors.white)),
              ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _draft,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(hintText: 'Message'),
                ),
              ),
              TextButton(
                onPressed: () async {
                  final text = _draft.text.trim();
                  if (text.isEmpty) return;
                  final result = await _api.message(widget.kind, open['id'].toString(), text);
                  if (result['success'] == true && result['data'] is Map) {
                    final next = Map<String, dynamic>.from(result['data'] as Map);
                    setState(() {
                      _open = next;
                      _rows = _rows.map((item) => item['id'] == next['id'] ? next : item).toList();
                    });
                    _draft.clear();
                  } else {
                    _toast(result['message']?.toString() ?? 'Could not send');
                  }
                },
                child: const Text('Send'),
              ),
            ],
          ),
          TextButton(onPressed: () => setState(() => _open = null), child: const Text('Close')),
        ],
      ),
    );
  }
}
