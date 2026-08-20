import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Global application configuration
/// Similar to CONFIG in the web version (global-config.ts)
class AppConfig {
  AppConfig._();

  /// Application name
  static const String appName = 'BattleAsia';

  /// Live API. A build only talks to a dev machine when it is asked to, so an
  /// APK that ships without (or with a stale) .env still reaches the domain.
  static const String defaultServerUrl = 'https://battleasia.gg';

  /// `--dart-define=API_BASE_URL=...` wins, then the bundled .env profile.
  static const String _serverUrlOverride =
      String.fromEnvironment('API_BASE_URL');
  static const String _siteUrlOverride = String.fromEnvironment('SITE_URL');

  static String get serverUrl {
    if (_serverUrlOverride.isNotEmpty) {
      return _serverUrlOverride;
    }

    final fromEnv = dotenv.env['API_BASE_URL'];
    if (fromEnv != null && fromEnv.isNotEmpty) {
      return fromEnv;
    }

    return defaultServerUrl;
  }

  /// Frontend site URL (referral + public profile links)
  static String get siteUrl {
    if (_siteUrlOverride.isNotEmpty) {
      return _siteUrlOverride;
    }

    final fromEnv = dotenv.env['SITE_URL'];
    if (fromEnv != null && fromEnv.isNotEmpty) {
      return fromEnv;
    }

    return 'https://battleasia.gg';
  }

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
