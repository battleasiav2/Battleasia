import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Clean auth card — logo, title, form. No trust chrome clutter.
class AuthFormShell extends StatelessWidget {
  final String title;
  final String? description;
  final Widget child;
  final bool wide;
  final double? progress;
  final Widget? steps;
  final Widget? belowCard;
  final bool showTrustRow;
  // Kept so existing screens can still pass it. The native page does not show the hero image.
  // ignore: unused_field
  final bool heroAfter;

  const AuthFormShell({
    super.key,
    required this.title,
    this.description,
    required this.child,
    this.wide = false,
    this.progress,
    this.steps,
    this.belowCard,
    this.showTrustRow = false,
    this.heroAfter = true,
  });

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: const Color(0xFF0B0C10),
        resizeToAvoidBottomInset: true,
        body: Stack(
          fit: StackFit.expand,
          children: [
            const ColoredBox(color: Color(0xFF0B0C10)),
            SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    physics: const ClampingScrollPhysics(),
                    keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(minHeight: constraints.maxHeight - 46),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(maxWidth: wide ? 440 : 420),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              if (Navigator.of(context).canPop()) ...[
                                const Align(
                                  alignment: Alignment.centerLeft,
                                  child: _AuthBackButton(),
                                ),
                                const SizedBox(height: 8),
                              ],
                              const _AuthWordmark(),
                              const SizedBox(height: 28),
                              _AuthPanel(
                                title: title,
                                description: description,
                                progress: progress,
                                steps: steps,
                                showTrustRow: showTrustRow,
                                child: child,
                              ),
                              if (belowCard != null) ...[
                                const SizedBox(height: 12),
                                belowCard!,
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

class _AuthBackButton extends StatelessWidget {
  const _AuthBackButton();

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => Navigator.of(context).pop(),
      visualDensity: VisualDensity.compact,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
      icon: const Icon(Icons.arrow_back_rounded, size: 22, color: Colors.white),
      tooltip: 'auth.back'.tr(),
    );
  }
}

class _AuthWordmark extends StatelessWidget {
  const _AuthWordmark();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ClipOval(
          child: Image.asset(
            'assets/icon/icon.png',
            width: 28,
            height: 28,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Image.asset(
              'assets/images/logo.webp',
              width: 28,
              height: 28,
              fit: BoxFit.contain,
            ),
          ),
        ),
        const SizedBox(width: 8),
        const Text(
          'BattleAsia',
          style: TextStyle(
            color: Colors.white,
            fontSize: 17,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }
}

class _AuthPanel extends StatelessWidget {
  final String title;
  final String? description;
  final Widget child;
  final double? progress;
  final Widget? steps;
  final bool showTrustRow;

  const _AuthPanel({
    required this.title,
    this.description,
    required this.child,
    this.progress,
    this.steps,
    this.showTrustRow = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
          width: double.infinity,
          color: Colors.transparent,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (progress != null)
                SizedBox(
                  height: 2,
                  child: ColoredBox(
                    color: Colors.white.withValues(alpha: 0.08),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: FractionallySizedBox(
                        widthFactor: (progress! / 100).clamp(0.0, 1.0),
                        child: ColoredBox(color: AppColors.gold),
                      ),
                    ),
                  ),
                ),
              Padding(
                padding: EdgeInsets.zero,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      title,
                      style: AppTheme.heading2.copyWith(
                        fontSize: 22,
                        height: 1.25,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                    ),
                    if (description != null && description!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        description!,
                        style: AppTheme.bodyMedium.copyWith(
                          color: AppColors.textMuted,
                          height: 1.45,
                          fontSize: 14,
                        ),
                      ),
                    ],
                    if (steps != null) ...[
                      const SizedBox(height: 16),
                      steps!,
                      const SizedBox(height: 14),
                    ] else
                      const SizedBox(height: 16),
                    child,
                    if (showTrustRow) ...[
                      const SizedBox(height: 16),
                      Divider(
                        height: 1,
                        color: Colors.white.withValues(alpha: 0.08),
                      ),
                      const SizedBox(height: 12),
                      const _AuthTrustRow(),
                    ],
                  ],
                ),
              ),
            ],
          ),
    );
  }
}

/// Slim step indicator — number + short title only.
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
                margin: const EdgeInsets.symmetric(horizontal: 8),
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
          _StepDot(
            index: i + 1,
            title: steps[i].title,
            active: currentStep == i + 1,
            done: currentStep > i + 1,
          ),
        ],
      ],
    );
  }
}

class _StepDot extends StatelessWidget {
  final int index;
  final String title;
  final bool active;
  final bool done;

  const _StepDot({
    required this.index,
    required this.title,
    required this.active,
    required this.done,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor =
        done || active ? AppColors.gold : Colors.white.withValues(alpha: 0.14);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 26,
          height: 26,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done ? AppColors.gold : Colors.transparent,
            border: Border.all(color: borderColor),
          ),
          child: done
              ? const Icon(Icons.check, size: 13, color: Color(0xFF111111))
              : Text(
                  '$index',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: active ? AppColors.gold : AppColors.textMuted,
                  ),
                ),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: active || done ? Colors.white : AppColors.textMuted,
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
      spacing: 14,
      runSpacing: 6,
      children: items
          .map(
            (item) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(item.$2, size: 13, color: AppColors.gold),
                const SizedBox(width: 5),
                Text(
                  item.$1,
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w500,
                    fontSize: 12,
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
          foregroundColor: Colors.white,
          disabledForegroundColor: Colors.white.withValues(alpha: 0.32),
          backgroundColor: AppTheme.accentColor,
          disabledBackgroundColor: Colors.white.withValues(alpha: 0.08),
          side: BorderSide(color: AppTheme.accentColor),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(9),
          ),
          textStyle: const TextStyle(
            fontSize: 15.5,
            fontWeight: FontWeight.w700,
          ),
        ),
        child: loading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(
                label,
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
    return OutlinedButton(
      onPressed: onPressed,
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
      child: Text(label),
    );
  }
}
