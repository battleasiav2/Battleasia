import 'dart:ui';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';

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
  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: const Color(0xFF060607),
        resizeToAvoidBottomInset: true,
        body: Stack(
          fit: StackFit.expand,
          children: [
            const ColoredBox(color: Color(0xFF060607)),
            // Zip soft gold wash — no photo BG
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0, -1.05),
                  radius: 1.05,
                  colors: [
                    AppColors.gold.withValues(alpha: 0.06),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.55],
                ),
              ),
            ),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF060607).withValues(alpha: 0.18),
                    Colors.transparent,
                    const Color(0xFF060607).withValues(alpha: 0.42),
                  ],
                  stops: const [0.0, 0.42, 1.0],
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
                      20,
                      24,
                      20,
                      20 + bottomInset,
                    ),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight - 16,
                      ),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            maxWidth: widget.wide ? 460 : 430,
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
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppColors.radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.panelFill(),
            borderRadius: BorderRadius.circular(AppColors.radius),
            border: Border.all(color: AppColors.hair()),
            boxShadow: const [
              BoxShadow(
                color: Color(0x70000000),
                blurRadius: 40,
                offset: Offset(0, 24),
              ),
            ],
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
                        color: Colors.white.withValues(alpha: 0.42),
                        fontSize: 11,
                        letterSpacing: 1.6,
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      title,
                      style: AppTheme.heading2.copyWith(
                        fontSize: 18,
                        height: 1.25,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -0.3,
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
                          fontSize: 13.5,
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
    return SizedBox(
          height: 48,
          width: double.infinity,
          child: ElevatedButton(
            onPressed: loading ? null : onPressed,
            style: ElevatedButton.styleFrom(
              elevation: 0,
              foregroundColor: AppColors.goldInk,
              disabledForegroundColor: Colors.white.withValues(alpha: 0.32),
              backgroundColor: AppTheme.accentColor,
              disabledBackgroundColor: Colors.white.withValues(alpha: 0.08),
              side: BorderSide(color: AppTheme.accentColor),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppColors.radiusSm),
              ),
              textStyle: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.1,
              ),
            ),
        child: loading
            ? SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.goldInk,
                ),
              )
            : Text(
                label.toUpperCase(),
                textAlign: TextAlign.center,
              ),
      ),
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
      label: Text(label.toUpperCase()),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(0, 42),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        foregroundColor: Colors.white.withValues(alpha: 0.88),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
        backgroundColor: Colors.white.withValues(alpha: 0.05),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusSm),
        ),
        textStyle: const TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
