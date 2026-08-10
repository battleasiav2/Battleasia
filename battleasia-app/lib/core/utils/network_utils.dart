import 'dart:io';

import 'package:battleasia_app/core/config/app_config.dart';

/// Lightweight online check for shop access rules.
Future<bool> isNetworkOnline() async {
  try {
    final host = Uri.tryParse(AppConfig.serverUrl)?.host;
    if (host == null || host.isEmpty) {
      return false;
    }
    final result = await InternetAddress.lookup(host)
        .timeout(const Duration(seconds: 3));
    return result.isNotEmpty && result.first.rawAddress.isNotEmpty;
  } catch (_) {
    return false;
  }
}
