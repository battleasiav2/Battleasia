import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class HeroBannerSection extends StatelessWidget {
  const HeroBannerSection({super.key});

  void _joinTournament(BuildContext context) {
    final authed = context.read<AuthProvider>().isAuthenticated;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) =>
            authed ? const PlayScreen() : const SignInScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = AppUtils.screenHeight(context);
    final isMobile = AppUtils.isMobile(context);

    return Container(
      height: isMobile ? 520 : 720,
      width: double.infinity,
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/images/banner.webp'),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
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
        ],
      ),
    );
  }
}
