import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

/// Wide cinematic hero slides — distant establishing shots (not close-up portraits).
const _heroSlides = [
  'assets/images/hero/hero-pubg-wide.webp',
  'assets/images/hero/hero-free-fire-wide.png',
  'assets/images/hero/hero-cod-mobile-wide.png',
  'assets/images/hero/hero-valorant-wide.png',
  'assets/images/hero/hero-mobile-legends-wide.png',
];

const _rotateEvery = Duration(seconds: 90);

class HeroBannerSection extends StatefulWidget {
  const HeroBannerSection({super.key});

  @override
  State<HeroBannerSection> createState() => _HeroBannerSectionState();
}

class _HeroBannerSectionState extends State<HeroBannerSection> {
  int _activeIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(_rotateEvery, (_) {
      if (!mounted) return;
      setState(() => _activeIndex = (_activeIndex + 1) % _heroSlides.length);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _joinTournament(BuildContext context) {
    final authed = context.read<AuthProvider>().isAuthenticated;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => authed ? const PlayScreen() : const SignInScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = AppUtils.screenHeight(context);
    final isMobile = AppUtils.isMobile(context);

    return SizedBox(
      height: isMobile ? 520 : 720,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 1800),
            switchInCurve: Curves.easeInOut,
            switchOutCurve: Curves.easeInOut,
            child: Image.asset(
              _heroSlides[_activeIndex],
              key: ValueKey(_heroSlides[_activeIndex]),
              fit: BoxFit.cover,
              alignment: Alignment.center,
              width: double.infinity,
              height: double.infinity,
              filterQuality: FilterQuality.high,
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.55),
                  Colors.black.withValues(alpha: 0.25),
                  Colors.black.withValues(alpha: 0.8),
                ],
              ),
            ),
          ),
          Positioned(
            top: screenHeight * 0.18,
            left: 20,
            right: 20,
            child: Column(
              children: [
                Text(
                  'OFFICIAL PUBG ON MOBILE',
                  textAlign: TextAlign.center,
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.6,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'BATTLE ASIA',
                  textAlign: TextAlign.center,
                  style: AppTheme.heading1.copyWith(
                    fontSize: isMobile ? 36 : 56,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 1,
                    shadows: AppUtils.getTextShadow(
                      blurRadius: 8,
                      color: Colors.black87,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Win real cash via playing MOBILE tournaments for free. Get it now!',
                  textAlign: TextAlign.center,
                  style: AppTheme.bodyLarge.copyWith(
                    fontSize: isMobile ? 15 : 20,
                    color: Colors.white.withValues(alpha: 0.9),
                    shadows: AppUtils.getTextShadow(
                      blurRadius: 4,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 48,
            left: 24,
            right: 24,
            child: GoldButton(
              label: 'Join Tournament',
              onPressed: () => _joinTournament(context),
            ),
          ),
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_heroSlides.length, (index) {
                final active = index == _activeIndex;
                return GestureDetector(
                  onTap: () => setState(() => _activeIndex = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 350),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: active ? 22 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: active
                          ? AppColors.gold
                          : Colors.white.withValues(alpha: 0.35),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}
