import 'package:flutter/material.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';

/// Navigate to a shop screen — fresh login required each visit (web shop AuthGuard parity).
Future<void> openShopRoute(
  BuildContext context,
  Widget screen, {
  String? routeName,
}) async {
  ShopAuthGate.clearShopSession();

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

  await Navigator.of(context).pushReplacement(
    MaterialPageRoute(
      builder: (_) => screen,
      settings: RouteSettings(name: routeName),
    ),
  );
}
