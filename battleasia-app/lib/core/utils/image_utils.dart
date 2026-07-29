import 'dart:convert';
import 'dart:typed_data';
import 'package:battleasia_app/core/config/app_config.dart';

/// Utility functions for handling images
/// Similar to get-image-url.ts in the web version
class ImageUtils {
  ImageUtils._();

  /// Get image URL with proper base URL handling
  ///
  /// Returns:
  /// - null if image is null or empty
  /// - image as-is if it's already a full URL (http/https/blob/data)
  /// - Full URL with server base URL if it's a relative path
  static String? getImageUrl(String? image) {
    return AppConfig.getImageUrl(image);
  }

  /// Get image URL with fallback to empty string
  /// Useful for widgets that require non-null String
  static String getImageUrlOrEmpty(String? image) {
    return getImageUrl(image) ?? '';
  }

  /// Returns true if the URL is a base64 data URI (e.g. "data:image/jpeg;base64,...")
  static bool isBase64DataUri(String? url) =>
      url != null && url.startsWith('data:');

  /// Decodes a base64 data URI to raw bytes for use with [MemoryImage] / [Image.memory].
  /// Returns null if decoding fails.
  static Uint8List? decodeBase64DataUri(String dataUri) {
    final comma = dataUri.indexOf(',');
    if (comma == -1) return null;
    try {
      return base64Decode(dataUri.substring(comma + 1));
    } catch (_) {
      return null;
    }
  }
}
