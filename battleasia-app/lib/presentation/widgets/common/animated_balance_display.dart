import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Balance pill in header — gold accent, short delta flash on change only.
class AnimatedBalanceDisplay extends StatefulWidget {
  const AnimatedBalanceDisplay({super.key});

  @override
  State<AnimatedBalanceDisplay> createState() => _AnimatedBalanceDisplayState();
}

class _AnimatedBalanceDisplayState extends State<AnimatedBalanceDisplay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _deltaController;
  late final Animation<Offset> _deltaSlide;
  late final Animation<double> _deltaFade;

  double _previousBalance = 0.0;
  double _delta = 0.0;
  bool _showDelta = false;
  bool _seeded = false;

  @override
  void initState() {
    super.initState();
    _deltaController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
      reverseDuration: const Duration(milliseconds: 220),
    );
    _deltaSlide = Tween<Offset>(
      begin: const Offset(0, 0.6),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _deltaController, curve: Curves.easeOut));
    _deltaFade = CurvedAnimation(parent: _deltaController, curve: Curves.easeIn);
  }

  @override
  void dispose() {
    _deltaController.dispose();
    super.dispose();
  }

  void _onBalanceChanged(double newBalance) {
    if (!_seeded) {
      _previousBalance = newBalance;
      _seeded = true;
      return;
    }
    if (newBalance == _previousBalance) return;
    final delta = newBalance - _previousBalance;
    _previousBalance = newBalance;
    setState(() {
      _delta = delta;
      _showDelta = true;
    });
    _deltaController.forward(from: 0);
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (!mounted) return;
      _deltaController.reverse().then((_) {
        if (mounted) setState(() => _showDelta = false);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (!authProvider.isAuthenticated) return const SizedBox.shrink();

        final balance = authProvider.user?.balance ?? 0.0;
        if (!_seeded || balance != _previousBalance) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) _onBalanceChanged(balance);
          });
        }

        final balanceFontSize = ResponsiveUtils.getResponsiveFontSize(
          context,
          baseSize: 14.0,
          min: 12.0,
          max: 16.0,
        );
        final isMobile = MediaQuery.sizeOf(context).width < 600;
        final isGain = _delta >= 0;
        final deltaColor = isGain ? AppColors.success : AppColors.error;

        return Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 8 : 12,
                vertical: isMobile ? 6 : 8,
              ),
              constraints: BoxConstraints(maxWidth: isMobile ? 108 : double.infinity),
              decoration: BoxDecoration(
                color: const Color(0xB8161618),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(
                    'assets/images/currency.webp',
                    width: isMobile ? 16 : 20,
                    height: isMobile ? 16 : 20,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.monetization_on,
                      size: isMobile ? 16 : 20,
                      color: AppColors.gold,
                    ),
                  ),
                  SizedBox(width: isMobile ? 4 : 6),
                  Text(
                    balance >= 1000
                        ? balance.toStringAsFixed(0)
                        : balance.toStringAsFixed(balance.truncateToDouble() == balance ? 0 : 2),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTheme.bodyMedium.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: isMobile ? 12.5 : balanceFontSize,
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
