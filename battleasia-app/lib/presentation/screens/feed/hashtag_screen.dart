import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/data/models/feed_model.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_detail_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_comments_sheet.dart';
import 'package:battleasia_app/presentation/widgets/feed/feed_item.dart';

/// Posts for one hashtag, same feed API the website uses.
class HashtagScreen extends StatefulWidget {
  final String tag;

  const HashtagScreen({super.key, required this.tag});

  @override
  State<HashtagScreen> createState() => _HashtagScreenState();
}

class _HashtagScreenState extends State<HashtagScreen> {
  final FeedService _feed = FeedService();
  final ScrollController _scroll = ScrollController();
  List<FeedModel> _posts = [];
  bool _loading = true;
  String? _error;

  String get _hash => widget.tag.replaceFirst(RegExp(r'^#'), '').toLowerCase();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final result = await _feed.getFeeds(limit: 24, feedMode: 'all', hashtag: _hash);
    if (!mounted) return;
    if (result['success'] != true) {
      setState(() {
        _loading = false;
        _error = result['message']?.toString() ?? 'tag.loadFail'.tr();
      });
      return;
    }
    final data = result['data'];
    final payload = data is Map ? (data['results'] ?? data) : data;
    final items = payload is List ? payload : (payload is Map ? (payload['results'] as List? ?? []) : []);
    setState(() {
      _loading = false;
      _posts = items.whereType<Map>().map((row) => FeedModel.fromJson(Map<String, dynamic>.from(row))).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          ListView(
            controller: _scroll,
            padding: const EdgeInsets.fromLTRB(16, 108, 16, 120),
            children: [
              Text('#$_hash', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text(
                '${_loading ? '—' : _posts.length} ${'tag.posts'.tr()}',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
              ),
              const SizedBox(height: 16),
              if (_loading)
                Center(child: Padding(padding: const EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2)))
              else if (_error != null)
                Text(_error!, style: const TextStyle(color: AppColors.error))
              else if (_posts.isEmpty) ...[
                Text('tag.empty'.tr(), style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                Text(
                  '${'tag.emptyLead'.tr()} #$_hash.',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FeedScreen()),
                  ),
                  child: Text('tag.openFeed'.tr()),
                ),
              ] else
                ..._posts.map(
                  (feed) => FeedItem(
                    feed: feed,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => FeedDetailScreen(feedId: feed.id)));
                    },
                    onComment: () => FeedCommentsSheet.show(context, feedId: feed.id),
                  ),
                ),
            ],
          ),
          Positioned(top: 0, left: 0, right: 0, child: AppHeader(scrollController: _scroll)),
          const FloatingBottomNav(),
        ],
      ),
    );
  }
}
