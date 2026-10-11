import 'package:shared_preferences/shared_preferences.dart';

/// Matches web `localStorage` key `ba-hide-balance` (UserShell / ShopShell).
class BalanceHidePrefs {
  BalanceHidePrefs._();

  static const _key = 'ba-hide-balance';

  static Future<bool> isHidden() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key) == '1';
  }

  static Future<bool> toggle() async {
    final prefs = await SharedPreferences.getInstance();
    final next = prefs.getString(_key) != '1';
    await prefs.setString(_key, next ? '1' : '0');
    return next;
  }
}
