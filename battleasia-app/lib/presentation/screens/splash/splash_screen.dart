import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/auth/auth_wrapper.dart';

/// Fast branded boot splash — arena HUD + gold pulse, ~0.5s then AuthWrapper.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _enter;
  late final AnimationController _ring;
  late final AnimationController _bar;
  late final Animation<double> _logoScale;
  late final Animation<double> _fade;
  late final Animation<double> _barFill;

  @override
  void initState() {
    super.initState();

    _enter = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );
    _ring = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
    _bar = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 420),
    );

    _logoScale = Tween<double>(begin: 0.78, end: 1).animate(
      CurvedAnimation(parent: _enter, curve: Curves.easeOutBack),
    );
    _fade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _enter, curve: Curves.easeOut),
    );
    _barFill = Tween<double>(begin: 0.08, end: 1).animate(
      CurvedAnimation(parent: _bar, curve: Curves.easeInOutCubic),
    );

    _enter.forward();
    _bar.forward();

    Future<void>.delayed(const Duration(milliseconds: 520), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder<void>(
          pageBuilder: (_, __, ___) => const AuthWrapper(),
          transitionDuration: const Duration(milliseconds: 180),
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      );
    });
  }

  @override
  void dispose() {
    _enter.dispose();
    _ring.dispose();
    _bar.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final logoSize = (size.width * 0.28).clamp(88.0, 120.0);

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Atmosphere
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(0, -0.15),
                radius: 1.05,
                colors: [
                  AppColors.gold.withValues(alpha: 0.12),
                  AppColors.pageBg,
                  const Color(0xFF030304),
                ],
                stops: const [0, 0.45, 1],
              ),
            ),
          ),
          // Soft scan lines (cheap, no blur)
          CustomPaint(painter: _ScanLinesPainter()),
          // Corner HUD brackets
          const Positioned(top: 48, left: 22, child: _HudCorner()),
          const Positioned(
            top: 48,
            right: 22,
            child: RotatedBox(quarterTurns: 1, child: _HudCorner()),
          ),
          const Positioned(
            bottom: 56,
            left: 22,
            child: RotatedBox(quarterTurns: 3, child: _HudCorner()),
          ),
          const Positioned(
            bottom: 56,
            right: 22,
            child: RotatedBox(quarterTurns: 2, child: _HudCorner()),
          ),

          Center(
            child: FadeTransition(
              opacity: _fade,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ScaleTransition(
                    scale: _logoScale,
                    child: SizedBox(
                      width: logoSize + 28,
                      height: logoSize + 28,
                      child: AnimatedBuilder(
                        animation: _ring,
                        builder: (context, child) {
                          return CustomPaint(
                            painter: _ArenaRingPainter(
                              progress: _ring.value,
                              color: AppColors.gold,
                            ),
                            child: child,
                          );
                        },
                        child: Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(22),
                            child: Image.asset(
                              'assets/icon/icon.png',
                              width: logoSize,
                              height: logoSize,
                              fit: BoxFit.contain,
                              gaplessPlayback: true,
                              filterQuality: FilterQuality.medium,
                              errorBuilder: (_, __, ___) => Image.asset(
                                'assets/images/logo.webp',
                                width: logoSize,
                                height: logoSize,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 22),
                  Text(
                    'BATTLEASIA',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.96),
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4.2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'ENTER THE ARENA',
                    style: TextStyle(
                      color: AppColors.gold.withValues(alpha: 0.85),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.4,
                    ),
                  ),
                  const SizedBox(height: 28),
                  SizedBox(
                    width: 132,
                    child: AnimatedBuilder(
                      animation: _barFill,
                      builder: (context, _) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(99),
                          child: SizedBox(
                            height: 3,
                            child: LinearProgressIndicator(
                              value: _barFill.value,
                              backgroundColor:
                                  Colors.white.withValues(alpha: 0.08),
                              color: AppColors.gold,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HudCorner extends StatelessWidget {
  const _HudCorner();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 28,
      height: 28,
      child: CustomPaint(
        painter: _CornerBracketPainter(color: AppColors.gold.withValues(alpha: 0.55)),
      ),
    );
  }
}

class _CornerBracketPainter extends CustomPainter {
  final Color color;
  const _CornerBracketPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.square;
    final path = Path()
      ..moveTo(0, size.height * 0.55)
      ..lineTo(0, 0)
      ..lineTo(size.width * 0.55, 0);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CornerBracketPainter oldDelegate) =>
      oldDelegate.color != color;
}

class _ArenaRingPainter extends CustomPainter {
  final double progress;
  final Color color;

  const _ArenaRingPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 2;
    final track = Paint()
      ..color = color.withValues(alpha: 0.14)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    final sweep = Paint()
      ..color = color.withValues(alpha: 0.9)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, track);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2 + progress * math.pi * 2,
      math.pi * 0.55,
      false,
      sweep,
    );
  }

  @override
  bool shouldRepaint(covariant _ArenaRingPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.color != color;
}

class _ScanLinesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.018)
      ..strokeWidth = 1;
    for (var y = 0.0; y < size.height; y += 4) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
