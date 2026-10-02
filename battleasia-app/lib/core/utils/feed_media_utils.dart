import 'package:battleasia_app/core/utils/image_utils.dart';

/// Feed list / explore thumbnails — prefer `-sm.webp` when available.
class FeedMediaUtils {
  FeedMediaUtils._();

  static const feedListMemCacheWidth = 480;

  static String resolveListUrl(String? raw) {
    final resolved = ImageUtils.getImageUrl(raw);
    if (resolved == null || resolved.isEmpty) return '';
    if (_isVideo(resolved)) return resolved;

    final path = resolved.split('?').first;
    if (path.contains('/assets/images/shop/') ||
        path.contains('/assets/images/games/') ||
        path.endsWith('.png')) {
      return _stockFromLegacy(path);
    }

    if (path.endsWith('.webp') &&
        !path.contains('-sm.webp') &&
        !path.contains('/covers/maps/')) {
      final q = resolved.contains('?') ? '?${resolved.split('?').last}' : '';
      return '${path.replaceFirst('.webp', '-sm.webp')}$q';
    }
    return resolved;
  }

  static bool _isVideo(String url) =>
      RegExp(r'\.(mp4|webm)(\?|$)', caseSensitive: false).hasMatch(url);

  static String _stockFromLegacy(String href) {
    const stock = [
      '/covers/maps/Erangel.webp',
      '/covers/maps/Miramar.webp',
      '/covers/maps/Sanhok.webp',
      '/covers/maps/Livik.webp',
      '/covers/pubg.webp',
      '/covers/freefire.webp',
      '/covers/modes/solo.webp',
      '/covers/modes/squad.webp',
    ];
    var hash = 0;
    for (final c in href.codeUnits) {
      hash = (hash * 31 + c) & 0xffffffff;
    }
    return stock[hash % stock.length];
  }
}
