import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Global application configuration
/// Similar to CONFIG in the web version (global-config.ts)
class AppConfig {
  AppConfig._();

  /// Application name
  static const String appName = 'BattleAsia';

  /// Server base URL — use .env; Android emulator: http://10.0.2.2:5050
  static String get serverUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:5050';

  /// Frontend site URL (referral links)
  static String get siteUrl =>
      dotenv.env['SITE_URL'] ?? 'https://battleasia.gg';

  /// Assets directory path
  static String get assetsDir => dotenv.env['ASSETS_DIR'] ?? '';

  /// Currency icon path
  static const String currencyIcon = '/assets/images/currency.webp';

  /// Get full image URL
  /// Handles both absolute URLs and relative paths
  static String? getImageUrl(String? image) {
    if (image == null || image.isEmpty) {
      return null;
    }

    // If already a full URL (http/https/blob/data URI), return as is
    if (image.startsWith('http://') ||
        image.startsWith('https://') ||
        image.startsWith('blob:') ||
        image.startsWith('data:')) {
      return image;
    }

    // If no server URL configured, return the image path as is
    final baseUrl = serverUrl;
    if (baseUrl.isEmpty) {
      return image;
    }

    // Construct full URL with server base URL
    return '$baseUrl${image.startsWith('/') ? image : '/$image'}';
  }
}
