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
    return Scaffold(
      backgroundColor: AppColors.pageBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0C10),
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        title: Text('nav.shop'.tr(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'shop.bacTitle'.tr(),
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                'shop.heroSubtitle'.tr(),
                style: const TextStyle(color: AppColors.textPlaceholder, fontSize: 14, height: 1.4),
              ),
              if (_note.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(_note, style: const TextStyle(color: Color(0xFF9A3B32))),
                ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: const Color(0xFF12140A),
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: _go,
                  child: Text('shop.goToBacShop'.tr(), style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
