import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';

/// Shop pages require an authenticated BattleAsia session.
class ShopAuthGate extends StatefulWidget {
  const ShopAuthGate({
    super.key,
    required this.child,
    required this.afterLoginScreen,
  });

  final Widget child;
  final Widget afterLoginScreen;

  static bool _shopSessionActive = false;

  static void markShopSessionActive() {
    _shopSessionActive = true;
  }

  static void clearShopSession() {
    _shopSessionActive = false;
  }

  /// True when the user is already signed in — no extra shop password prompt.
  static Future<bool> ensureShopAccess(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      _shopSessionActive = true;
      return true;
    }
    return _shopSessionActive;
  }

  @override
  State<ShopAuthGate> createState() => _ShopAuthGateState();
}

class _ShopAuthGateState extends State<ShopAuthGate> {
  @override
  void initState() {
    super.initState();
    if (context.read<AuthProvider>().isAuthenticated) {
      ShopAuthGate.markShopSessionActive();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authed = context.watch<AuthProvider>().isAuthenticated;
    if (!authed) {
      return SignInScreen(
        afterLoginScreen: widget.afterLoginScreen,
        titleKey: 'shop.signInTitle',
        descriptionKey: 'shop.signInDesc',
      );
    }

    return widget.child;
  }
}
