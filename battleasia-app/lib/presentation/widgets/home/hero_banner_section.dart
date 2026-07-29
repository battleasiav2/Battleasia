import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';

class HeroBannerSection extends StatelessWidget {
  const HeroBannerSection({super.key});

  @override
  Widget build(BuildContext context) {
    final screenHeight = AppUtils.screenHeight(context);
    final screenWidth = AppUtils.screenWidth(context);
    final isMobile = AppUtils.isMobile(context);

    return Container(
      height: isMobile ? 500 : 892,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.black, Colors.grey.shade900],
        ),
        image: const DecorationImage(
          image: AssetImage('assets/images/banner.webp'),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        children: [
          // Text Overlay
          Positioned(
            top: screenHeight * 0.3,
            right: isMobile ? 20 : screenWidth * 0.07,
            child: Container(
              constraints: BoxConstraints(maxWidth: isMobile ? 300 : 500),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "It's all about Gaming means BattleAsia",
                    style: AppTheme.heading1.copyWith(
                      fontSize: isMobile ? 32 : 58,
                      shadows: AppUtils.getTextShadow(
                        blurRadius: 4.0,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Win real cash via playing MOBILE tournaments for free. Get it now!',
                    style: AppTheme.bodyLarge.copyWith(
                      fontSize: isMobile ? 20 : 28,
                      shadows: AppUtils.getTextShadow(
                        blurRadius: 3.0,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Button at bottom
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Center(
              child: ElevatedButton(
                onPressed: () {
                  // Navigate to play/matches screen
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentColor,
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 40 : 60,
                    vertical: isMobile ? 16 : 20,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  'Get Started',
                  style: AppTheme.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
