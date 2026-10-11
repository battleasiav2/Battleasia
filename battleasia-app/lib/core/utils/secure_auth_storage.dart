import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// JWT access + refresh tokens — encrypted storage with one-time migration from prefs.
class SecureAuthStorage {
  SecureAuthStorage._();

  static const _accessKey = 'auth_token';
  static const _refreshKey = 'auth_refresh';
  static const _legacyAccess = 'auth_token';
  static const _legacyRefresh = 'auth_refresh';
  static const _migratedFlag = 'auth_tokens_migrated_secure_v1';

  static const FlutterSecureStorage _vault = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<void> _migrateFromPrefsIfNeeded() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(_migratedFlag) == true) return;

    final legacyAccess = prefs.getString(_legacyAccess);
    final legacyRefresh = prefs.getString(_legacyRefresh);
    if (legacyAccess != null && legacyAccess.isNotEmpty) {
      await _vault.write(key: _accessKey, value: legacyAccess);
    }
    if (legacyRefresh != null && legacyRefresh.isNotEmpty) {
      await _vault.write(key: _refreshKey, value: legacyRefresh);
    }
    await prefs.remove(_legacyAccess);
    await prefs.remove(_legacyRefresh);
    await prefs.setBool(_migratedFlag, true);
  }

  static Future<String?> readAccess() async {
    await _migrateFromPrefsIfNeeded();
    return _vault.read(key: _accessKey);
  }

  static Future<String?> readRefresh() async {
    await _migrateFromPrefsIfNeeded();
    return _vault.read(key: _refreshKey);
  }

  static Future<void> writeAccess(String token) async {
    await _migrateFromPrefsIfNeeded();
    await _vault.write(key: _accessKey, value: token);
  }

  static Future<void> writeRefresh(String token) async {
    await _migrateFromPrefsIfNeeded();
    await _vault.write(key: _refreshKey, value: token);
  }

  static Future<void> clearTokens() async {
    await _vault.delete(key: _accessKey);
    await _vault.delete(key: _refreshKey);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_legacyAccess);
    await prefs.remove(_legacyRefresh);
  }
}
