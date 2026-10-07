import 'dart:ui';

import 'package:shared_preferences/shared_preferences.dart';

const referralPrefKey = 'battleasia_ref';

Future<void> captureReferral() async {
  final raw = PlatformDispatcher.instance.defaultRouteName;
  final uri = Uri.tryParse(raw.startsWith('http') ? raw : 'https://battleasia.local$raw');
  final ref = uri?.queryParameters['ref']?.trim() ?? '';
  if (ref.isEmpty) return;
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(referralPrefKey, ref);
}

Future<String> readReferral() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString(referralPrefKey)?.trim() ?? '';
}
