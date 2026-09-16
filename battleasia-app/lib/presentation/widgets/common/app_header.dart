import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/widgets/common/account_drawer.dart';
import 'package:battleasia_app/presentation/widgets/common/animated_balance_display.dart';
import 'package:battleasia_app/presentation/widgets/common/locale_toggle.dart';
import 'package:battleasia_app/presentation/widgets/common/accent_toggle.dart';
import 'package:battleasia_app/presentation/widgets/notifications/notifications_drawer_button.dart';
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
      baseSize: isMobile ? 8.0 : 12.0,
    ).clamp(isMobile ? 8.0 : 10.0, 24.0);
    final logoSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: isMobile ? 44.0 : 64.0,
    ).clamp(isMobile ? 40.0 : 48.0, 72.0);
    final topInset = MediaQuery.of(context).padding.top;
    final gap = isMobile ? 6.0 : 12.0;

    return Container(
      padding: EdgeInsets.fromLTRB(
        horizontalPadding,
        topInset + (isMobile ? 6 : 10),
        horizontalPadding,
        isMobile ? 8 : 12,
      ),
      decoration: BoxDecoration(
        color: const Color(0xF00A0A0A),
        border: Border(
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
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
          const AccentToggle(),
          SizedBox(width: gap),
          const LocaleToggle(),
          SizedBox(width: gap),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isAuthenticated) {
                return const AnimatedBalanceDisplay();
              }
              return const SizedBox.shrink();
            },
          ),
          SizedBox(width: gap),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isAuthenticated) {
                return const NotificationsDrawerButton();
              }
              return const SizedBox.shrink();
            },
          ),
          SizedBox(width: gap),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              if (authProvider.isAuthenticated) {
                return const AccountDrawer();
              }
              return IconButton(
                tooltip: 'nav.login'.tr(),
                visualDensity: isMobile ? VisualDensity.compact : VisualDensity.standard,
                padding: EdgeInsets.all(isMobile ? 8 : 10),
                constraints: BoxConstraints(
                  minWidth: isMobile ? 42 : 48,
                  minHeight: isMobile ? 42 : 48,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SignInScreen(),
                    ),
                  );
                },
                icon: Icon(
                  Icons.login_rounded,
                  color: Colors.white.withValues(alpha: 0.88),
                  size: 26,
                ),
                style: IconButton.styleFrom(
                  minimumSize: const Size(42, 42),
                  padding: EdgeInsets.zero,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
