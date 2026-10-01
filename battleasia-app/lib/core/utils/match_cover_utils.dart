import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/data/models/match_model.dart';

/// Match list / detail banner resolution (parity with web `coverForMatch`).
class MatchCoverUtils {
  MatchCoverUtils._();

  static const _knownMaps = [
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

  static String? _mapAsset(String? map) {
    final raw = map?.trim() ?? '';
    if (raw.isEmpty) return null;
    final hit = _knownMaps.where((m) => m.toLowerCase() == raw.toLowerCase());
    if (hit.isEmpty) return null;
    return 'assets/images/map/${hit.first}.webp';
  }

  static String? _arenaFromName(String? name) {
    final n = (name ?? '').toLowerCase();
    if (n.contains('warehouse')) return 'assets/images/map/Warehouse.webp';
    if (n.contains('hanger') || n.contains('hangar')) {
      return 'assets/images/map/Hanger.webp';
    }
    if (n.contains('gun game') || RegExp(r'\bgun\b').hasMatch(n)) {
      return 'assets/images/map/Gun.webp';
    }
    return null;
  }

  static String resolve(MatchModel match) {
    final banner = match.banner?.trim() ?? '';
    if (banner.isNotEmpty) {
      final mapHit = RegExp(r'/assets/images/map/([^/?#]+)', caseSensitive: false)
          .firstMatch(banner);
      if (mapHit != null) {
        final asset = _mapAsset(mapHit.group(1));
        if (asset != null) return asset;
      }
      final remote = ImageUtils.getImageUrl(banner);
      if (remote != null && remote.isNotEmpty) return remote;
    }

    final fromMap = _mapAsset(match.map);
    if (fromMap != null) return fromMap;

    final fromArena = _arenaFromName(match.matchName);
    if (fromArena != null) return fromArena;

    return 'assets/images/game.webp';
  }
}
