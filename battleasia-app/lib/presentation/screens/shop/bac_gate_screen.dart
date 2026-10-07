import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';
import 'package:provider/provider.dart';

class BacGateScreen extends StatefulWidget {
  const BacGateScreen({super.key});

  @override
  State<BacGateScreen> createState() => _BacGateScreenState();
}

class _BacGateScreenState extends State<BacGateScreen> {
  static const _slides = [
    ('assets/images/games/pubg-mobile.webp', 'PUBG Mobile'),
    ('assets/images/games/free-fire.webp', 'Free Fire'),
    ('assets/images/games/cod-mobile.webp', 'COD Mobile'),
    ('assets/images/games/mobile-legends.webp', 'Mobile Legends'),
    ('assets/images/games/valorant.webp', 'Valorant'),
  ];

  int _index = 0;
  String _note = '';

  Future<void> _go() async {
    final online = await shopHasInternet();
    if (!mounted) return;
    if (!online) {
      setState(() => _note = 'shop.bacNeedNet'.tr());
      return;
    }
    setState(() => _note = '');
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      ShopAuthGate.markShopSessionActive();
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => const ShopScreen(),
          settings: const RouteSettings(name: '/shop'),
        ),
      );
      return;
    }
    final allowed = await ShopAuthGate.ensureShopAccess(context);
    if (!mounted) return;
    if (allowed) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => const ShopScreen(),
          settings: const RouteSettings(name: '/shop'),
        ),
      );
      return;
    }
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        fullscreenDialog: true,
        settings: const RouteSettings(name: '/auth/shop-sign-in'),
        builder: (_) => const SignInScreen(
          afterLoginScreen: ShopScreen(),
          titleKey: 'shop.signInTitle',
          descriptionKey: 'shop.signInDesc',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_index];
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF161618),
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        title: Row(
          children: [
            Image.asset('assets/images/logo.webp', width: 32, height: 32),
            const SizedBox(width: 8),
            const Text('Battle Asia', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          ],
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 28, 16, 32),
          children: [
            Text(
              'shop.bacTitle'.tr(),
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 28, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            Text(
              'shop.bacLead'.tr(),
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textPlaceholder, fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 18),
            DecoratedBox(
              decoration: BoxDecoration(
                color: AppColors.panel,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: AspectRatio(
                        aspectRatio: 16 / 9,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.asset(slide.$1, fit: BoxFit.cover),
                            Positioned(
                              left: 16,
                              bottom: 16,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'shop.bacNewSkins'.tr().toUpperCase(),
                                    style: const TextStyle(color: Color(0xFFD4E82A), fontWeight: FontWeight.w800, fontSize: 12),
                                  ),
                                  Text(
                                    slide.$2.toUpperCase(),
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 28, height: 1),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        for (var i = 0; i < _slides.length; i++)
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 3),
                              child: GestureDetector(
                                onTap: () => setState(() => _index = i),
                                child: DecoratedBox(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: i == _index ? const Color(0xFFD4E82A) : Colors.transparent,
                                      width: 2,
                                    ),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: Image.asset(_slides[i].$1, height: 46, fit: BoxFit.cover),
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            if (_note.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(_note, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF9A3B32))),
              ),
            const SizedBox(height: 18),
            Center(
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFD4E82A),
                  foregroundColor: const Color(0xFF12140A),
                  minimumSize: const Size(180, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _go,
                child: Text('shop.goToBacShop'.tr(), style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
