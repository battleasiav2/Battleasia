import 'dart:async';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';

const _shopUntilKey = 'ba_shop_until';
const _shopHourMs = 60 * 60 * 1000;

/// Shop pages require an email/password login that lasts one hour.
class ShopAuthGate extends StatefulWidget {
  const ShopAuthGate({
    super.key,
    required this.child,
    required this.afterLoginScreen,
  });

  final Widget child;
  final Widget afterLoginScreen;

  static bool _shopSessionActive = false;

  static Future<int> _until() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_shopUntilKey) ?? 0;
  }

  static Future<bool> hourAlive() async {
    final until = await _until();
    return until > DateTime.now().millisecondsSinceEpoch;
  }

  /// Call only after a successful shop-domain sign-in (starts / renews 1-hour window).
  static Future<void> markShopSessionActive() async {
    _shopSessionActive = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(
      _shopUntilKey,
      DateTime.now().millisecondsSinceEpoch + _shopHourMs,
    );
  }

  static void clearShopSession() {
    _shopSessionActive = false;
    unawaited(SharedPreferences.getInstance().then((prefs) => prefs.remove(_shopUntilKey)));
  }

  /// True only inside the one-hour shop window, and only while signed in.
  static Future<bool> ensureShopAccess(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      _shopSessionActive = false;
      return false;
    }
    final alive = await hourAlive();
    _shopSessionActive = alive;
    return alive;
  }

  @override
  State<ShopAuthGate> createState() => _ShopAuthGateState();
}

class _ShopAuthGateState extends State<ShopAuthGate> with WidgetsBindingObserver {
  Timer? _timer;
  bool _ready = false;
  bool _allowed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _refresh();
    _timer = Timer.periodic(const Duration(seconds: 20), (_) => _refresh());
  }

  Future<void> _refresh() async {
    if (!mounted) return;
    final auth = context.read<AuthProvider>();
    final allowed = auth.isAuthenticated && await ShopAuthGate.hourAlive();
    if (!mounted) return;
    setState(() {
      _ready = true;
      _allowed = allowed;
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _refresh();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authed = context.watch<AuthProvider>().isAuthenticated;
    if (!_ready) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (!authed || !_allowed) {
      return SignInScreen(
        afterLoginScreen: widget.afterLoginScreen,
        titleKey: 'shop.signInTitle',
        descriptionKey: 'shop.signInDesc',
      );
    }
    return widget.child;
  }
}

Future<bool> shopHasInternet() async {
  try {
    final uri = Uri.parse('${AppConfig.serverUrl}/api/health');
    final res = await ApiClient.get(uri).timeout(const Duration(seconds: 4));
    return res.statusCode >= 200 && res.statusCode < 500;
  } catch (_) {
    return false;
  }
}
