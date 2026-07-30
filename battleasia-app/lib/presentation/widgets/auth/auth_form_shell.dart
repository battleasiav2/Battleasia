import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_scroll_behavior.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/widgets/common/glass_card.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_divider.dart';

class AuthFormShell extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      resizeToAvoidBottomInset: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/auth_m.webp',
            fit: BoxFit.cover,
            alignment: Alignment.center,
            errorBuilder: (_, __, ___) => Container(color: AppColors.pageBg),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.5),
                  Colors.black.withValues(alpha: 0.9),
                ],
              ),
            ),
          ),
          SafeArea(
            child: ScrollConfiguration(
              behavior: const AppScrollBehavior(),
              child: CustomScrollView(
                physics: appScrollPhysics,
                slivers: [
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16, 12, 16, 16 + bottomInset),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Align(
                            alignment: Alignment.centerRight,
                            child: GoldButton(
                              label: 'footer.home'.tr(),
                              icon: Icons.home_outlined,
                              expanded: false,
                              uppercase: true,
                              onPressed: onHome ??
                                  () {
                                    if (Navigator.of(context).canPop()) {
                                      Navigator.of(context).pop();
                                    }
                                  },
                            ),
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: Align(
                              alignment: Alignment.topCenter,
                              child: ConstrainedBox(
                                constraints: BoxConstraints(
                                  maxWidth: wide ? 620 : 520,
                                ),
                                child: GlassCard(
                                  borderRadius: 0,
                                  padding: EdgeInsets.symmetric(
                                    horizontal: wide ? 28 : 22,
                                    vertical: wide ? 28 : 24,
                                  ),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      const Center(
                                        child: BattleAsiaLogo(
                                          logoSize: 120,
                                          showText: false,
                                          alignment: MainAxisAlignment.center,
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        'common.brandTagline'.tr(),
                                        style: AppTheme.labelUppercase.copyWith(
                                          color: AppColors.gold.withValues(alpha: 0.85),
                                          fontSize: 10,
                                          letterSpacing: 1.6,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        title,
                                        style: AppTheme.heading2.copyWith(
                                          fontSize: 22,
                                          height: 1.3,
                                          letterSpacing: 0.4,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      if (description != null) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          description!,
                                          style: AppTheme.bodyMedium.copyWith(
                                            color: AppColors.textMuted,
                                            height: 1.55,
                                            fontSize: 13,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                      const SizedBox(height: 14),
                                      const Center(
                                        child: GoldDivider(width: 180),
                                      ),
                                      const SizedBox(height: 22),
                                      child,
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
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
