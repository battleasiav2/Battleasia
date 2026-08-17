import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/home/home_screen.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

/// Player Pass auth layout — square charcoal card, no split hero on phone.
class AuthFormShell extends StatefulWidget {
  final String title;
  final String? description;
  final Widget child;
  final bool wide;
  final VoidCallback? onHome;

  const AuthFormShell({
    super.key,
    required this.title,
    this.description,
    required this.child,
    this.wide = false,
    this.onHome,
  });

  @override
  State<AuthFormShell> createState() => _AuthFormShellState();
}

class _AuthFormShellState extends State<AuthFormShell> {
  static bool _assetsWarmed = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_assetsWarmed) return;
    _assetsWarmed = true;
    precacheImage(const AssetImage('assets/images/auth_m.webp'), context);
    precacheImage(const AssetImage('assets/images/logo.webp'), context);
  }

  void _goHome() {
    if (widget.onHome != null) {
      widget.onHome!();
      return;
    }
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return;
    }
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final size = MediaQuery.sizeOf(context);
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final cacheW = (size.width * dpr).round().clamp(480, 1440);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.pageBg,
        resizeToAvoidBottomInset: true,
        body: Stack(
          fit: StackFit.expand,
          children: [
            const ColoredBox(color: Color(0xFF070707)),
            RepaintBoundary(
              child: Image.asset(
                'assets/images/auth_m.webp',
                fit: BoxFit.cover,
                alignment: Alignment.center,
                gaplessPlayback: true,
                filterQuality: FilterQuality.medium,
                cacheWidth: cacheW,
                errorBuilder: (_, __, ___) =>
                    const ColoredBox(color: Color(0xFF070707)),
              ),
            ),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x99000000),
                    Color(0xCC000000),
                    Color(0xF2000000),
                  ],
                  stops: [0.0, 0.45, 1.0],
                ),
              ),
            ),
            SafeArea(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: _AuthBackHome(onPressed: _goHome),
                    ),
                  ),
                  Expanded(
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return SingleChildScrollView(
                          physics: const ClampingScrollPhysics(),
                          keyboardDismissBehavior:
                              ScrollViewKeyboardDismissBehavior.onDrag,
                          padding: EdgeInsets.fromLTRB(
                            16,
                            8,
                            16,
                            20 + bottomInset,
                          ),
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minHeight: constraints.maxHeight - 8,
                            ),
                            child: Center(
                              child: ConstrainedBox(
                                constraints: BoxConstraints(
                                  maxWidth: widget.wide ? 520 : 500,
                                ),
                                child: _AuthPanel(
                                  title: widget.title,
                                  description: widget.description,
                                  child: widget.child,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthBackHome extends StatelessWidget {
  final VoidCallback onPressed;
  const _AuthBackHome({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.45),
      child: InkWell(
        onTap: onPressed,
        child: Container(
          height: 26,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.arrow_back, size: 12, color: AppColors.gold),
              const SizedBox(width: 6),
              Text(
                'auth.backHome'.tr(),
                style: const TextStyle(
                  color: AppColors.gold,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AuthPanel extends StatelessWidget {
  final String title;
  final String? description;
  final Widget child;

  const _AuthPanel({
    required this.title,
    this.description,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
      decoration: BoxDecoration(
        color: const Color(0xFF181614),
        border: Border.all(color: const Color(0xFF2B2B2B)),
        boxShadow: const [
          BoxShadow(
            color: Color(0xA6000000),
            blurRadius: 24,
            offset: Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Center(
            child: BattleAsiaLogo(
              logoSize: 86,
              showText: false,
              alignment: MainAxisAlignment.center,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'common.brandTagline'.tr(),
            style: AppTheme.labelUppercase.copyWith(
              color: AppColors.gold.withValues(alpha: 0.85),
              fontSize: 9,
              letterSpacing: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: AppTheme.heading2.copyWith(
              fontSize: 18,
              height: 1.2,
              fontWeight: FontWeight.w800,
            ),
            textAlign: TextAlign.center,
          ),
          if (description != null) ...[
            const SizedBox(height: 6),
            Text(
              description!,
              style: AppTheme.bodyMedium.copyWith(
                color: AppColors.textMuted,
                height: 1.45,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          const SizedBox(height: 12),
          const _GoldDiamondDivider(),
          const SizedBox(height: 16),
          child,
          const SizedBox(height: 16),
          const _AuthTrustRow(),
        ],
      ),
    );
  }
}

class _GoldDiamondDivider extends StatelessWidget {
  const _GoldDiamondDivider();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  AppColors.gold.withValues(alpha: 0.55),
                ],
              ),
            ),
          ),
        ),
        Transform.rotate(
          angle: 0.785398,
          child: Container(
            width: 6,
            height: 6,
            color: AppColors.gold,
          ),
        ),
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.gold.withValues(alpha: 0.55),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _AuthTrustRow extends StatelessWidget {
  const _AuthTrustRow();

  @override
  Widget build(BuildContext context) {
    final items = [
      ('auth.featureSecure'.tr(), Icons.verified_user_outlined),
      ('auth.featureFairPlay'.tr(), Icons.emoji_events_outlined),
      ('auth.featureCashPrizes'.tr(), Icons.account_balance_wallet_outlined),
    ];

    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 12,
      runSpacing: 6,
      children: items
          .map(
            (item) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(item.$2, size: 13, color: AppColors.gold),
                const SizedBox(width: 4),
                Text(
                  item.$1,
                  style: const TextStyle(
                    color: Color(0x9EFFFFFF),
                    fontWeight: FontWeight.w700,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          )
          .toList(),
    );
  }
}

class AuthPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;

  const AuthPrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return GoldButton(
      label: label,
      onPressed: onPressed,
      loading: loading,
      icon: icon,
    );
  }
}
