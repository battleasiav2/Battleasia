import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';

/// Shop requires a valid login — mirrors web shop AuthGuard.
///
/// Re-validates the session every time a shop screen opens. Missing or expired
/// tokens show [SignInScreen] instead of shop content.
class ShopAuthGate extends StatefulWidget {
  const ShopAuthGate({
    super.key,
    required this.child,
    required this.afterLoginScreen,
  });

  final Widget child;
  final Widget afterLoginScreen;

  /// Validate session before entering shop. Returns false → caller should not proceed.
  static Future<bool> ensureShopAccess(BuildContext context) async {
    final auth = context.read<AuthProvider>();

    if (!auth.isAuthenticated) {
      return false;
    }

    final me = await UserService().getMe();
    if (me['success'] == true) {
      return true;
    }

    await auth.signOut();
    return false;
  }

  @override
  State<ShopAuthGate> createState() => _ShopAuthGateState();
}

class _ShopAuthGateState extends State<ShopAuthGate> {
  bool _checking = true;
  bool _allowed = false;

  @override
  void initState() {
    super.initState();
    _verify();
  }

  Future<void> _verify() async {
    final allowed = await ShopAuthGate.ensureShopAccess(context);
    if (mounted) {
      setState(() {
        _checking = false;
        _allowed = allowed;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) {
      return const Scaffold(
        backgroundColor: AppColors.pageBg,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.gold),
        ),
      );
    }

    if (!_allowed) {
      return SignInScreen(
        afterLoginScreen: widget.afterLoginScreen,
        titleKey: 'shop.signInTitle',
        descriptionKey: 'shop.signInDesc',
      );
    }

    return widget.child;
  }
}
