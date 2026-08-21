import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/widgets/common/account_drawer.dart';
import 'package:battleasia_app/presentation/widgets/common/animated_balance_display.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';
import 'package:battleasia_app/presentation/widgets/common/locale_toggle.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';

class AppHeader extends StatelessWidget {
  final ScrollController? scrollController;
  final String? currentSection;

  const AppHeader({super.key, this.scrollController, this.currentSection});

  @override
  Widget build(BuildContext context) {
    final isMobile = AppUtils.isMobile(context);
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(10.0, 24.0);
    final logoSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 72.0,
    ).clamp(48.0, 80.0);
    final topInset = MediaQuery.of(context).padding.top;

    return Container(
      padding: EdgeInsets.fromLTRB(
        horizontalPadding,
        topInset + 8,
        horizontalPadding,
        10,
      ),
      decoration: BoxDecoration(
        // Opaque-enough bar — no BackdropFilter (major scroll GPU win).
        color: const Color(0xF00B0204),
        border: Border(
          bottom: BorderSide(color: AppColors.border(0.1)),
        ),
      ),
      child: Row(
        children: [
          BattleAsiaLogo(
            isMobile: isMobile,
            showText: !isMobile,
            logoSize: logoSize,
          ),
          const Spacer(),
          const LocaleToggle(),
          const SizedBox(width: 12),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isAuthenticated) {
                return const AnimatedBalanceDisplay();
              }
              return const SizedBox.shrink();
            },
          ),
          const SizedBox(width: 12),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isAuthenticated) {
                return const AccountDrawer();
              }
              return GoldButton(
                label: 'nav.login'.tr(),
                expanded: false,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SignInScreen(),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
