import 'dart:convert';
import 'dart:typed_data';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

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

  /// Disk-cached network image with optional decode size limits.
  /// Prefer this over raw [Image.network] on feed/shop/play lists.
  static Widget networkImage(
    String? url, {
    BoxFit fit = BoxFit.cover,
    double? width,
    double? height,
    int? memCacheWidth,
    int? memCacheHeight,
    Widget? placeholder,
    Widget? errorWidget,
  }) {
    final resolved = getImageUrl(url);
    if (resolved == null || resolved.isEmpty) {
      return errorWidget ?? const SizedBox.shrink();
    }

    if (isBase64DataUri(resolved)) {
      final bytes = decodeBase64DataUri(resolved);
      if (bytes == null) {
        return errorWidget ?? const SizedBox.shrink();
      }
      return Image.memory(
        bytes,
        fit: fit,
        width: width,
        height: height,
        cacheWidth: memCacheWidth,
        cacheHeight: memCacheHeight,
        errorBuilder: (_, __, ___) =>
            errorWidget ?? const SizedBox.shrink(),
      );
    }

    return CachedNetworkImage(
      imageUrl: resolved,
      fit: fit,
      width: width,
      height: height,
      memCacheWidth: memCacheWidth,
      memCacheHeight: memCacheHeight,
      fadeInDuration: const Duration(milliseconds: 120),
      placeholder: (_, __) =>
          placeholder ??
          ColoredBox(
            color: AppColors.surfaceElevated,
            child: SizedBox(width: width, height: height),
          ),
      errorWidget: (_, __, ___) =>
          errorWidget ??
          ColoredBox(
            color: AppColors.surfaceElevated,
            child: SizedBox(
              width: width,
              height: height,
              child: const Icon(Icons.broken_image_outlined, color: AppColors.textMuted),
            ),
          ),
    );
  }

  /// Cached provider for [CircleAvatar] / [DecorationImage].
  static ImageProvider? networkProvider(String? url) {
    final resolved = getImageUrl(url);
    if (resolved == null || resolved.isEmpty) return null;
    if (isBase64DataUri(resolved)) {
      final bytes = decodeBase64DataUri(resolved);
      return bytes != null ? MemoryImage(bytes) : null;
    }
    return CachedNetworkImageProvider(resolved);
  }
}
