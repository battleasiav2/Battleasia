import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battleasia_app/core/theme/accent_palette.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

class AccentProvider extends ChangeNotifier {
  static const _storageKey = 'ba-accent';

  AccentId _id = AccentId.gold;

  AccentProvider() {
    AppColors.bind(palette);
  }

  AccentId get id => _id;
  AccentPalette get palette => accentPalettes[_id]!;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    final match = AccentId.values.where((value) => value.name == raw);
    if (match.isNotEmpty) {
      _id = match.first;
      AppColors.bind(palette);
      notifyListeners();
    }
  }

  Future<void> setAccent(AccentId id) async {
    if (_id == id) return;
    _id = id;
    AppColors.bind(palette);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, id.name);
  }
}
