import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// A balance display widget that shows the user's current coin balance and
/// plays a slide-in animation whenever the balance changes, revealing the
/// delta amount (e.g. "+120" or "-50") in green/red for 2.5 seconds.
class AnimatedBalanceDisplay extends StatefulWidget {
  const AnimatedBalanceDisplay({super.key});

  @override
  State<AnimatedBalanceDisplay> createState() => _AnimatedBalanceDisplayState();
}

class _AnimatedBalanceDisplayState extends State<AnimatedBalanceDisplay>
    with TickerProviderStateMixin {
  // ── Animation controllers ────────────────────────────────────────────────

  /// Controls the delta badge sliding in from below and then fading out.
  late final AnimationController _deltaController;
  late final Animation<Offset> _deltaSlide;
  late final Animation<double> _deltaFade;

  /// Controls a brief "pulse" scale on the main balance text.
  late final AnimationController _pulseController;
  late final Animation<double> _pulseScale;

  // ── State ────────────────────────────────────────────────────────────────
  double _previousBalance = 0.0;
  double _delta = 0.0; // positive = gain, negative = loss
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

    _deltaFade = CurvedAnimation(
      parent: _deltaController,
      curve: Curves.easeIn,
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 180),
    );

    _pulseScale = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 1.0, end: 1.22)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1.22, end: 1.0)
            .chain(CurveTween(curve: Curves.easeIn)),
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

  /// Called by the Consumer rebuild when a new balance value arrives.
  void _onBalanceChanged(double newBalance) {
    if (newBalance == _previousBalance) return;

    final delta = newBalance - _previousBalance;
    _previousBalance = newBalance;

    setState(() {
      _delta = delta;
      _showDelta = true;
    });

    // Kick off animations.
    _deltaController.forward(from: 0);
    _pulseController.forward(from: 0);

    // Hide delta badge after 2.5 s.
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

        // Trigger animation whenever balance changes (detected via didUpdate).
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _onBalanceChanged(balance);
        });

        final iconSize = ResponsiveUtils.getResponsiveSpacing(
          context,
          baseSize: 24.0,
        ).clamp(18.0, 24.0);

        final iconHeight = ResponsiveUtils.getResponsiveSpacing(
          context,
          baseSize: 26.0,
        ).clamp(20.0, 26.0);

        final balanceFontSize = ResponsiveUtils.getResponsiveFontSize(
          context,
          baseSize: 18.0,
          min: 14.0,
          max: 20.0,
        );

        final deltaFontSize = ResponsiveUtils.getResponsiveFontSize(
          context,
          baseSize: 12.0,
          min: 10.0,
          max: 14.0,
        );

        final iconSpacing = ResponsiveUtils.getResponsiveSpacing(
          context,
          baseSize: 4.0,
        ).clamp(2.0, 8.0);

        final isGain = _delta >= 0;
        final deltaColor = isGain ? const Color(0xFF22C55E) : const Color(0xFFEF4444);
        final deltaPrefix = isGain ? '+' : '';
        final deltaText = '$deltaPrefix${_delta.toStringAsFixed(0)}';

        return Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            // ── Main balance row ──────────────────────────────────────────
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset(
                  'assets/images/currency.webp',
                  width: iconSize,
                  height: iconHeight,
                  errorBuilder: (_, __, ___) => Container(
                    width: iconSize,
                    height: iconHeight,
                    decoration: BoxDecoration(
                      color: AppTheme.textSecondary.withOpacity(0.3),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                SizedBox(width: iconSpacing),
                // Pulse the balance text on change.
                ScaleTransition(
                  scale: _pulseScale,
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, animation) =>
                        FadeTransition(opacity: animation, child: child),
                    child: Text(
                      balance.toStringAsFixed(2),
                      key: ValueKey(balance.toStringAsFixed(2)),
                      style: AppTheme.bodyLarge.copyWith(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: balanceFontSize,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // ── Delta badge (slides up from below the balance row) ────────
            if (_showDelta)
              Positioned(
                bottom: -(deltaFontSize + 10),
                child: SlideTransition(
                  position: _deltaSlide,
                  child: FadeTransition(
                    opacity: _deltaFade,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: deltaColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                            color: deltaColor.withOpacity(0.6), width: 1),
                      ),
                      child: Text(
                        deltaText,
                        style: TextStyle(
                          color: deltaColor,
                          fontSize: deltaFontSize,
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
