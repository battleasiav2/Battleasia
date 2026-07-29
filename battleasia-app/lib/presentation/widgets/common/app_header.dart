import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/widgets/common/account_drawer.dart';
import 'package:battleasia_app/presentation/widgets/common/animated_balance_display.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';

class AppHeader extends StatelessWidget {
  final ScrollController? scrollController;
  final String? currentSection;

  const AppHeader({super.key, this.scrollController, this.currentSection});

  @override
  Widget build(BuildContext context) {
    final isMobile = AppUtils.isMobile(context);

    // Responsive sizes
    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 9.0,
    ).clamp(8.0, 30.0);

    final logoSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(50.0, 90.0);

    final spacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(4.0, 16.0);

    final topPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(10.0, 20.0);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: horizontalPadding,
        vertical: 10,
      ),
      decoration: const BoxDecoration(
        color: Colors.transparent,
        image: DecorationImage(
          image: AssetImage('assets/images/nav-bg.webp'),
          fit: BoxFit.cover,
          alignment: Alignment.center,
          repeat: ImageRepeat.repeatX,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo Section
          Padding(
            padding: EdgeInsets.only(top: topPadding),
            child: BattleAsiaLogo(
              isMobile: isMobile,
              showText: true,
              logoSize: logoSize,
            ),
          ),

          // Spacer to push content to edges
          const Spacer(),

          // Balance Display (only when logged in)
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              if (authProvider.isAuthenticated) {
                return const AnimatedBalanceDisplay();
              }
              return const SizedBox.shrink();
            },
          ),

          SizedBox(width: spacing),

          // Account Drawer (if logged in) or Login Button (if not logged in)
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              if (authProvider.isAuthenticated) {
                return const AccountDrawer();
              } else {
                return _buildLoginButton(context);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildLoginButton(BuildContext context) {
    // Responsive button padding
    final buttonPaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(12.0, 24.0);

    final buttonPaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(6.0, 12.0);

    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 12.0,
      max: 18.0,
    );

    return ElevatedButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const SignInScreen()),
        );
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.accentColor,
        padding: EdgeInsets.symmetric(
          horizontal: buttonPaddingH,
          vertical: buttonPaddingV,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        minimumSize: Size.zero, // Allow button to shrink
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Text(
        'LOGIN',
        style: AppTheme.bodyMedium.copyWith(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: buttonFontSize,
        ),
      ),
    );
  }
}
