import 'dart:ui';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

/// Minimal auth card — matches web zip-style signup shell.
class AuthFormShell extends StatefulWidget {
  final String title;
  final String? description;
  final Widget child;
  final bool wide;
  final double? progress;
  final Widget? steps;
  final Widget? belowCard;

  const AuthFormShell({
    super.key,
    required this.title,
    this.description,
    required this.child,
    this.wide = false,
    this.progress,
    this.steps,
    this.belowCard,
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
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    physics: const ClampingScrollPhysics(),
                    keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior.onDrag,
                    padding: EdgeInsets.fromLTRB(
                      16,
                      16,
                      16,
                      20 + bottomInset,
                    ),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight - 16,
                      ),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            maxWidth: widget.wide ? 440 : 420,
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _AuthPanel(
                                title: widget.title,
                                description: widget.description,
                                progress: widget.progress,
                                steps: widget.steps,
                                child: widget.child,
                              ),
                              if (widget.belowCard != null) ...[
                                const SizedBox(height: 14),
                                widget.belowCard!,
                              ],
                            ],
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
    );
  }
}

class _AuthPanel extends StatelessWidget {
  final String title;
  final String? description;
  final Widget child;
  final double? progress;
  final Widget? steps;

  const _AuthPanel({
    required this.title,
    this.description,
    required this.child,
    this.progress,
    this.steps,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: const Color(0xFF161618).withValues(alpha: 0.4),
            border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
          ),
          foregroundDecoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (progress != null)
                SizedBox(
                  height: 3,
                  child: ColoredBox(
                    color: Colors.white.withValues(alpha: 0.08),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: FractionallySizedBox(
                        widthFactor: (progress! / 100).clamp(0.0, 1.0),
                        child: Container(
                          color: AppColors.gold,
                        ),
                      ),
                    ),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 22, 22, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(
                      child: BattleAsiaLogo(
                        logoSize: 104,
                        showText: false,
                        alignment: MainAxisAlignment.center,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Center(
                      child: Container(
                        width: 40,
                        height: 2,
                        color: AppColors.gold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'common.brandTagline'.tr(),
                      style: AppTheme.labelUppercase.copyWith(
                        color: AppColors.gold.withValues(alpha: 0.88),
                        fontSize: 12,
                        letterSpacing: 2.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      title,
                      style: AppTheme.heading2.copyWith(
                        fontSize: 19,
                        height: 1.2,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.2,
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
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    if (steps != null) ...[
                      const SizedBox(height: 18),
                      steps!,
                    ] else
                      const SizedBox(height: 18),
                    child,
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.only(top: 16),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(
                            color: Colors.white.withValues(alpha: 0.08),
                          ),
                        ),
                      ),
                      child: const _AuthTrustRow(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AuthStepProgress extends StatelessWidget {
  final int currentStep;
  final List<({String title, String hint})> steps;

  const AuthStepProgress({
    super.key,
    required this.currentStep,
    required this.steps,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          if (i > 0)
            Expanded(
              child: Container(
                height: 1,
                margin: const EdgeInsets.only(left: 8, right: 4),
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
          Expanded(
            child: _StepItem(
              index: i + 1,
              title: steps[i].title,
              hint: steps[i].hint,
              active: currentStep == i + 1,
              done: currentStep > i + 1,
            ),
          ),
        ],
      ],
    );
  }
}

class _StepItem extends StatelessWidget {
  final int index;
  final String title;
  final String hint;
  final bool active;
  final bool done;

  const _StepItem({
    required this.index,
    required this.title,
    required this.hint,
    required this.active,
    required this.done,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor = done || active
        ? AppColors.gold
        : Colors.white.withValues(alpha: 0.14);

    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done ? AppColors.gold : Colors.transparent,
            border: Border.all(color: borderColor),
          ),
          child: done
              ? const Icon(Icons.check, size: 14, color: Color(0xFF111111))
              : Text(
                  '$index',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: active ? AppColors.gold : AppColors.textMuted,
                  ),
                ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: active || done
                      ? Colors.white
                      : AppColors.textMuted,
                ),
              ),
              Text(
                hint,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                ),
              ),
            ],
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
      spacing: 16,
      runSpacing: 8,
      children: items
          .map(
            (item) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(item.$2, size: 14, color: AppColors.gold),
                const SizedBox(width: 6),
                Text(
                  item.$1,
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
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
  final IconData? trailingIcon;

  const AuthPrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.trailingIcon,
  });

  @override
  Widget build(BuildContext context) {
    return GoldButton(
      label: label,
      onPressed: onPressed,
      loading: loading,
      icon: icon,
      trailingIcon: trailingIcon,
      uppercase: false,
      height: 46,
      fontSize: 14,
      borderRadius: 4,
      glow: false,
    );
  }
}

class AuthSecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  const AuthSecondaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon ?? Icons.arrow_back, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(0, 46),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        foregroundColor: Colors.white.withValues(alpha: 0.62),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.14)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    );
  }
}
