import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Matches web `localStorage` key `ba-hide-balance` (UserShell / ShopShell).
class BalanceHidePrefs {
  BalanceHidePrefs._();

  static const _key = 'ba-hide-balance';

  /// Shared across header pill and account drawer.
  static final ValueNotifier<bool> hidden = ValueNotifier(false);

  static Future<void> ensureLoaded() async {
    hidden.value = await isHidden();
  }

  static Future<bool> isHidden() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key) == '1';
  }

  static Future<bool> toggle() async {
    final prefs = await SharedPreferences.getInstance();
    final next = prefs.getString(_key) != '1';
    await prefs.setString(_key, next ? '1' : '0');
    hidden.value = next;
    return next;
  }

  static String formatBalance(double balance, {required bool hide}) {
    if (hide) return '••••';
    if (balance >= 1000) return balance.toStringAsFixed(0);
    return balance.toStringAsFixed(balance.truncateToDouble() == balance ? 0 : 2);
  }
}
