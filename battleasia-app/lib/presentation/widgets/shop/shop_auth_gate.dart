import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/network_utils.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';

/// Shop access:
/// - Logged in + online → enter (session persists, no repeat login)
/// - Not logged in → sign-in
/// - Offline → sign out + sign-in required
class ShopAuthGate extends StatefulWidget {
  const ShopAuthGate({
    super.key,
    required this.child,
    required this.afterLoginScreen,
  });

  final Widget child;
  final Widget afterLoginScreen;

  /// Returns true when shop may open. Offline clears the session.
  static Future<bool> ensureShopAccess(BuildContext context) async {
    final auth = context.read<AuthProvider>();
    final online = await isNetworkOnline();

    if (!online) {
      if (auth.isAuthenticated) {
        await auth.signOut();
      }
      return false;
    }

    return auth.isAuthenticated;
  }

  @override
  State<ShopAuthGate> createState() => _ShopAuthGateState();
}

class _ShopAuthGateState extends State<ShopAuthGate> with WidgetsBindingObserver {
  bool _checking = true;
  bool _allowed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _verify();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _allowed) {
      _verify();
    }
  }

  Future<void> _verify() async {
    if (mounted && !_checking) {
      setState(() => _checking = true);
    }
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
