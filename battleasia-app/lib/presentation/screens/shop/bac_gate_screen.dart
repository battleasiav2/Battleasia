import 'dart:ui' as ui;

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
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            const _BacMark(),
            const SizedBox(height: 14),
            Text(
              'shop.bacTitle'.tr(),
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              'shop.heroSubtitle'.tr(),
              style: const TextStyle(color: AppColors.textPlaceholder, fontSize: 14, height: 1.45),
            ),
            const SizedBox(height: 18),
            const _BacFact(titleKey: 'shop.bacFactRoom', bodyKey: 'shop.bacFactRoomBody'),
            const _BacFact(titleKey: 'shop.bacFactPrize', bodyKey: 'shop.bacFactPrizeBody'),
            const _BacFact(titleKey: 'shop.bacFactHour', bodyKey: 'shop.bacFactHourBody'),
            if (_note.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(_note, style: const TextStyle(color: Color(0xFF9A3B32))),
              ),
            const SizedBox(height: 20),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: const Color(0xFF12140A),
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _go,
              child: Text('shop.goToBacShop'.tr(), style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}

class _BacMark extends StatefulWidget {
  const _BacMark();

  @override
  State<_BacMark> createState() => _BacMarkState();
}

class _BacMarkState extends State<_BacMark> with SingleTickerProviderStateMixin {
  late final AnimationController _spin = AnimationController(vsync: this, duration: const Duration(seconds: 7))..repeat();

  @override
  void dispose() {
    _spin.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduce = MediaQuery.disableAnimationsOf(context);
    final ring = RotationTransition(
      turns: reduce ? const AlwaysStoppedAnimation(0) : _spin,
      child: CustomPaint(size: const Size(64, 64), painter: _BacRingPainter(AppColors.gold)),
    );
    return SizedBox(
      width: 64,
      height: 64,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ring,
          CustomPaint(size: const Size(64, 64), painter: _BacFacePainter(AppColors.gold)),
        ],
      ),
    );
  }
}

class _BacRingPainter extends CustomPainter {
  _BacRingPainter(this.ring);

  final Color ring;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - 1.6),
      -0.6,
      5.3,
      false,
      Paint()
        ..color = ring
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.4
        ..strokeCap = StrokeCap.round,
    );
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius * 0.72),
      0.4,
      4.2,
      false,
      Paint()
        ..color = ring.withValues(alpha: 0.55)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2,
    );
  }

  @override
  bool shouldRepaint(covariant _BacRingPainter oldDelegate) => oldDelegate.ring != ring;
}

class _BacFacePainter extends CustomPainter {
  _BacFacePainter(this.ring);

  final Color ring;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(center, size.width * 0.36, Paint()..color = const Color(0xFF12140A));
    final label = TextPainter(
      text: TextSpan(
        text: 'B',
        style: TextStyle(color: ring, fontSize: 26, fontWeight: FontWeight.w800, height: 1),
      ),
      textDirection: ui.TextDirection.ltr,
    )..layout();
    label.paint(canvas, center - Offset(label.width / 2, label.height / 2));
  }

  @override
  bool shouldRepaint(covariant _BacFacePainter oldDelegate) => oldDelegate.ring != ring;
}

class _BacFact extends StatelessWidget {
  const _BacFact({required this.titleKey, required this.bodyKey});

  final String titleKey;
  final String bodyKey;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 6, right: 10),
            decoration: BoxDecoration(color: AppColors.gold, shape: BoxShape.circle),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(titleKey.tr(), style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 2),
                Text(bodyKey.tr(), style: const TextStyle(color: AppColors.textPlaceholder, fontSize: 13, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
