import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/auth/auth_wrapper.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    // Initialize animation controller
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Fade animation
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    // Scale animation with bounce effect
    _scaleAnimation = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.8, curve: Curves.elasticOut),
      ),
    );

    // Start animation
    _controller.forward();

    // Navigate to auth wrapper after animation completes
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        // Wait a bit before navigating
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(
                builder: (context) => const AuthWrapper(),
              ),
            );
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final logoSize = screenSize.width * 0.4; // 40% of screen width

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Container(
        decoration: const BoxDecoration(
          color: Colors.black,
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Opacity(
                opacity: _fadeAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: child,
                ),
              );
            },
            child: Image.asset(
              'assets/images/logo.webp',
              width: logoSize,
              height: logoSize,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                // Fallback if logo is not found
                return Container(
                  width: logoSize,
                  height: logoSize,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.sports_esports,
                    size: 80,
                    color: Colors.white,
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

