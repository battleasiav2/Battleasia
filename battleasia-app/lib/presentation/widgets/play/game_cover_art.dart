import 'package:battleasia_app/data/models/game_model.dart';

/// Unique Play-arena cover art + sort order (PUBG first).
class GameCoverArt {
  GameCoverArt._();

  static const pubg = 'assets/images/games/pubg-mobile.webp';
  static const freeFire = 'assets/images/games/free-fire.webp';
  static const cod = 'assets/images/games/cod-mobile.webp';
  static const valorant = 'assets/images/games/valorant.webp';
  static const mlbb = 'assets/images/games/mobile-legends.webp';

  static String _key(GameModel game) {
    final prefix = (game.idPrefix ?? '').toUpperCase();
    if (prefix == 'PUBG' || prefix == 'FF' || prefix == 'COD' || prefix == 'VAL' || prefix == 'ML') {
      return prefix;
    }
    final blob =
        '${game.name} ${game.packageName} ${game.idPrefix ?? ''}'.toLowerCase();
    if (blob.contains('pubg')) return 'PUBG';
    if (blob.contains('free fire') || blob.contains('freefire') || blob.contains('garena')) {
      return 'FF';
    }
    if (blob.contains('call of duty') || blob.contains('cod')) return 'COD';
    if (blob.contains('valorant')) return 'VAL';
    if (blob.contains('legend') || blob.contains('mlbb')) return 'ML';
    return '';
  }

  static String assetFor(GameModel game) {
    switch (_key(game)) {
      case 'PUBG':
        return pubg;
      case 'FF':
        return freeFire;
      case 'COD':
        return cod;
      case 'VAL':
        return valorant;
      case 'ML':
        return mlbb;
      default:
        return pubg;
    }
  }

  static int sortRank(GameModel game) {
    switch (_key(game)) {
      case 'PUBG':
        return 0;
      case 'FF':
        return 1;
      case 'COD':
        return 2;
      case 'VAL':
        return 3;
      case 'ML':
        return 4;
      default:
        return 99;
    }
  }

  static List<GameModel> sortForArena(List<GameModel> games) {
    final copy = List<GameModel>.from(games);
    copy.sort((a, b) {
      final d = sortRank(a).compareTo(sortRank(b));
      if (d != 0) return d;
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
    return copy;
  }
}
