import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Balance pill in header — gold accent, animated delta on change.
class AnimatedBalanceDisplay extends StatefulWidget {
  const AnimatedBalanceDisplay({super.key});

  @override
  State<AnimatedBalanceDisplay> createState() => _AnimatedBalanceDisplayState();
}

class _AnimatedBalanceDisplayState extends State<AnimatedBalanceDisplay>
    with TickerProviderStateMixin {
  late final AnimationController _deltaController;
  late final Animation<Offset> _deltaSlide;
  late final Animation<double> _deltaFade;
  late final AnimationController _pulseController;
  late final Animation<double> _pulseScale;

  double _previousBalance = 0.0;
  double _delta = 0.0;
  bool _showDelta = false;

  @override
  void initState() {
    super.initState();
    _deltaController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
      reverseDuration: const Duration(milliseconds: 300),
    );
    _deltaSlide = Tween<Offset>(
      begin: const Offset(0, 0.8),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _deltaController, curve: Curves.easeOut));
    _deltaFade = CurvedAnimation(parent: _deltaController, curve: Curves.easeIn);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 180),
    );
    _pulseScale = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 1.0, end: 1.12).chain(CurveTween(curve: Curves.easeOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1.12, end: 1.0).chain(CurveTween(curve: Curves.easeIn)),
        weight: 50,
      ),
    ]).animate(_pulseController);
  }

  @override
  void dispose() {
    _deltaController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _onBalanceChanged(double newBalance) {
    if (newBalance == _previousBalance) return;
    final delta = newBalance - _previousBalance;
    _previousBalance = newBalance;
    setState(() {
      _delta = delta;
      _showDelta = true;
    });
    _deltaController.forward(from: 0);
    _pulseController.forward(from: 0);
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        _deltaController.reverse().then((_) {
          if (mounted) setState(() => _showDelta = false);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (!authProvider.isAuthenticated) return const SizedBox.shrink();

        final balance = authProvider.user?.balance ?? 0.0;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _onBalanceChanged(balance);
        });

        final balanceFontSize = ResponsiveUtils.getResponsiveFontSize(
          context,
          baseSize: 14.0,
          min: 12.0,
          max: 16.0,
        );
        final isGain = _delta >= 0;
        final deltaColor = isGain ? AppColors.success : AppColors.error;

        return Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surface.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.45)),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.goldGlow(0.12),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(
                    'assets/images/currency.webp',
                    width: 20,
                    height: 20,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.monetization_on,
                      size: 20,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(width: 6),
                  ScaleTransition(
                    scale: _pulseScale,
                    child: Text(
                      balance.toStringAsFixed(2),
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w700,
                        fontSize: balanceFontSize,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (_showDelta)
              Positioned(
                bottom: -22,
                child: SlideTransition(
                  position: _deltaSlide,
                  child: FadeTransition(
                    opacity: _deltaFade,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: deltaColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: deltaColor.withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        '${isGain ? '+' : ''}${_delta.toStringAsFixed(0)}',
                        style: TextStyle(
                          color: deltaColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
