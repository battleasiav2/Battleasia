import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/presentation/screens/earn/earn_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/screens/labs/labs_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/referral/referral_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/bac_gate_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/wallet/wallet_screen.dart';

final appNavigatorKey = GlobalKey<NavigatorState>();

/// Same announcement card the website shows, including dismiss-by-version.
class SiteNoticeHost extends StatefulWidget {
  const SiteNoticeHost({super.key});

  @override
  State<SiteNoticeHost> createState() => _SiteNoticeHostState();
}

class _SiteNoticeHostState extends State<SiteNoticeHost> {
  static const _dismissKey = 'ba-site-notice-v';
  final UserService _users = UserService();
  Map<String, dynamic>? _notice;

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 600), _load);
  }

  Future<void> _load() async {
    final result = await _users.getSiteNotice();
    if (!mounted || result['success'] != true || result['data'] is! Map) return;
    final notice = Map<String, dynamic>.from(result['data'] as Map);
    if (notice['enabled'] != true) return;
    final title = notice['title']?.toString().trim() ?? '';
    final message = notice['message']?.toString().trim() ?? '';
    final image = notice['imageUrl']?.toString().trim() ?? '';
    if (title.isEmpty && message.isEmpty && image.isEmpty) return;
    final version = (notice['version'] as num?)?.toInt() ?? 1;
    final dismissible = notice['dismissible'] != false;
    if (dismissible) {
      final prefs = await SharedPreferences.getInstance();
      final dismissed = prefs.getInt(_dismissKey) ?? 0;
      if (dismissed >= version) return;
    }
    if (!mounted) return;
    setState(() => _notice = notice);
  }

  Future<void> _dismiss({required bool persist}) async {
    final notice = _notice;
    if (notice == null) return;
    if (persist && notice['dismissible'] != false) {
      final version = (notice['version'] as num?)?.toInt() ?? 1;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_dismissKey, version);
    }
    if (mounted) setState(() => _notice = null);
  }

  Future<void> _openCta(String url) async {
    await _dismiss(persist: true);
    if (url.startsWith('/') && !url.startsWith('//')) {
      final page = _pageFor(url);
      final nav = appNavigatorKey.currentState;
      if (page != null && nav != null) {
        nav.push(MaterialPageRoute(builder: (_) => page));
        return;
      }
      final site = AppConfig.siteUrl.replaceAll(RegExp(r'/$'), '');
      final uri = Uri.tryParse('$site$url');
      if (uri != null) await launchUrl(uri, mode: LaunchMode.externalApplication);
      return;
    }
    final uri = Uri.tryParse(url);
    if (uri != null) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Widget? _pageFor(String path) {
    if (path.startsWith('/user/play')) return const PlayScreen();
    if (path.startsWith('/user/earn')) return const EarnScreen();
    if (path.startsWith('/user/feed')) return const FeedScreen();
    if (path.startsWith('/user/shop')) return const BacGateScreen();
    if (path.startsWith('/user/wallet')) return const WalletScreen();
    if (path.startsWith('/user/transfer')) return const ShopWalletScreen();
    if (path.startsWith('/user/referral')) return const ReferralScreen();
    if (path.startsWith('/user/labs')) return const LabsScreen();
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final notice = _notice;
    if (notice == null) return const SizedBox.shrink();
    final title = notice['title']?.toString().trim() ?? '';
    final message = notice['message']?.toString().trim() ?? '';
    final image = ImageUtils.getImageUrl(notice['imageUrl']?.toString());
    final ctaLabel = notice['ctaLabel']?.toString().trim() ?? '';
    final ctaUrl = notice['ctaUrl']?.toString().trim() ?? '';
    final hasCta = ctaLabel.isNotEmpty && ctaUrl.isNotEmpty;
    final dismissible = notice['dismissible'] != false;
    final showGotIt = dismissible || !hasCta;

    return Material(
      color: Colors.black.withValues(alpha: 0.62),
      child: GestureDetector(
        onTap: dismissible ? () => _dismiss(persist: true) : null,
        child: SafeArea(
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Container(
                margin: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF121318),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (image != null && image.isNotEmpty)
                      Image.network(image, height: 160, fit: BoxFit.cover),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('NOTICE', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w800, letterSpacing: 1)),
                          const SizedBox(height: 8),
                          Text(
                            title.isEmpty ? 'Notice' : title,
                            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                          ),
                          if (message.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(message, style: const TextStyle(color: Colors.white70, height: 1.4)),
                          ],
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (hasCta)
                                FilledButton(onPressed: () => _openCta(ctaUrl), child: Text(ctaLabel)),
                              if (showGotIt)
                                OutlinedButton(
                                  onPressed: () => _dismiss(persist: dismissible),
                                  child: const Text('Got it'),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        ),
      ),
    );
  }
}
