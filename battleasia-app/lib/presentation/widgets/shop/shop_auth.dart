import 'package:flutter/material.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';

/// Open a shop screen. Already signed-in users skip the login prompt.
Future<void> openShopRoute(
  BuildContext context,
  Widget screen, {
  String? routeName,
}) async {
  final allowed = await ShopAuthGate.ensureShopAccess(context);
  if (!context.mounted) return;

  if (!allowed) {
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        fullscreenDialog: true,
        settings: const RouteSettings(name: '/auth/shop-sign-in'),
        builder: (_) => SignInScreen(
          afterLoginScreen: screen,
          titleKey: 'shop.signInTitle',
          descriptionKey: 'shop.signInDesc',
        ),
      ),
    );
    return;
  }

  ShopAuthGate.markShopSessionActive();
  await Navigator.of(context).pushReplacement(
    MaterialPageRoute(
      builder: (_) => screen,
      settings: RouteSettings(name: routeName),
    ),
  );
}
