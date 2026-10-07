import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/bac_gate_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_wallet_screen.dart';
import 'package:battleasia_app/presentation/screens/earn/earn_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';

class FloatingBottomNav extends StatefulWidget {
  const FloatingBottomNav({super.key});

  @override
  State<FloatingBottomNav> createState() => _FloatingBottomNavState();
}

class _FloatingBottomNavState extends State<FloatingBottomNav> {
  static List<NavItem> navItems(BuildContext context) => [
    NavItem(label: 'nav.play'.tr(), route: '/play', icon: Icons.sports_esports),
    NavItem(label: 'nav.shop'.tr(), route: '/shop', icon: Icons.shopping_bag),
    NavItem(label: 'nav.earn'.tr(), route: '/earn', icon: Icons.bolt),
    NavItem(label: 'nav.transfer'.tr(), route: '/transfer', icon: Icons.swap_horiz),
    NavItem(label: 'nav.feed'.tr(), route: '/feed', icon: Icons.article),
  ];

  String _currentRoute = '/play';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateCurrentRoute();
  }

  void _updateCurrentRoute() {
    final newRoute = _getCurrentRoute(context);
    if (newRoute != _currentRoute) {
      if (mounted) {
        setState(() {
          _currentRoute = newRoute;
        });
      }
    }
  }

  String _getCurrentRoute(BuildContext context) {
    // Try to get route from ModalRoute first (most reliable)
    final route = ModalRoute.of(context);
    if (route != null) {
      final routeName = route.settings.name;
      if (routeName != null && routeName.isNotEmpty) {
        // Exact match first
        if (routeName == '/play') {
          return '/play';
        } else if (routeName == '/shop') {
          return '/shop';
        } else if (routeName == '/earn') {
          return '/earn';
        } else if (routeName == '/transfer') {
          return '/transfer';
        } else if (routeName == '/feed') {
          return '/feed';
        }
        if (routeName.contains('/play') || routeName.contains('match')) {
          return '/play';
        } else if (routeName.contains('/transfer')) {
          return '/transfer';
        } else if (routeName.contains('/shop')) {
          return '/shop';
        } else if (routeName.contains('/earn')) {
          return '/earn';
        } else if (routeName.contains('/feed')) {
          return '/feed';
        }
      }
    }

    // Try to detect from widget type by checking ancestor widgets
    // Check for PlayScreen or match-related screens
    try {
      final playScreen = context.findAncestorWidgetOfExactType<PlayScreen>();
      if (playScreen != null) return '/play';
    } catch (e) {
      // Continue
    }

    try {
      final shopScreen = context.findAncestorWidgetOfExactType<ShopScreen>();
      if (shopScreen != null) return '/shop';
    } catch (e) {
      // Continue
    }

    try {
      final earnScreen = context.findAncestorWidgetOfExactType<EarnScreen>();
      if (earnScreen != null) return '/earn';
    } catch (e) {
      // Continue
    }

    try {
      final transferScreen = context.findAncestorWidgetOfExactType<ShopWalletScreen>();
      if (transferScreen != null) return '/transfer';
    } catch (e) {
      // Continue
    }

    try {
      final feedScreen = context.findAncestorWidgetOfExactType<FeedScreen>();
      if (feedScreen != null) return '/feed';
    } catch (e) {
      // Continue
    }

    // Check by widget type name from state
    final state = context.findAncestorStateOfType();
    if (state != null) {
      final stateType = state.runtimeType.toString();
      if (stateType.contains('PlayScreen') ||
          stateType.contains('MatchScreen') ||
          stateType.contains('MatchDetailScreen')) {
        return '/play';
      } else if (stateType.contains('ShopWalletScreen')) {
        return '/transfer';
      } else if (stateType.contains('ShopScreen')) {
        return '/shop';
      } else if (stateType.contains('EarnScreen')) {
        return '/earn';
      } else if (stateType.contains('FeedScreen')) {
        return '/feed';
      }
    }

    // Return the stored current route if we can't determine
    return _currentRoute;
  }

  bool _isActive(String route, String currentRoute) {
    if (currentRoute == route || currentRoute.startsWith(route)) {
      return true;
    }
    // Also check if current route contains the route path
    if (route == '/play') {
      return currentRoute.contains('/play') ||
          currentRoute.contains('/match') ||
          currentRoute == '/play';
    }
    return currentRoute.contains(route);
  }

  void _handleNavigation(BuildContext context, String route) {
    HapticFeedback.selectionClick();
    setState(() {
      _currentRoute = route;
    });

    Widget targetScreen;
    switch (route) {
      case '/play':
        targetScreen = const PlayScreen();
        break;
      case '/shop':
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const BacGateScreen(),
            settings: const RouteSettings(name: '/shop'),
          ),
        );
        return;
      case '/earn':
        targetScreen = const EarnScreen();
        break;
      case '/transfer':
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const ShopWalletScreen(),
            settings: const RouteSettings(name: '/transfer'),
          ),
        );
        return;
      case '/feed':
        targetScreen = const FeedScreen();
        break;
      default:
        targetScreen = const PlayScreen();
    }

    // Navigate to the target screen with route name set
    Navigator.of(context)
        .pushReplacement(
          MaterialPageRoute(
            builder: (_) => targetScreen,
            settings: RouteSettings(name: route),
          ),
        )
        .then((_) {
          // Update route after navigation completes
          if (mounted) {
            _updateCurrentRoute();
          }
        });
  }

  @override
  Widget build(BuildContext context) {
    // Update route when building
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateCurrentRoute();
    });

    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: ClipRect(
        child: DecoratedBox(
            decoration: BoxDecoration(
              color: const Color(0xFF060607),
              border: Border(
                top: BorderSide(color: Colors.white.withValues(alpha: 0.09)),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.55),
                  blurRadius: 24,
                  offset: const Offset(0, -8),
                ),
              ],
            ),
            child: Padding(
              padding: EdgeInsets.fromLTRB(6, 8, 6, 8 + bottomInset),
              child: Row(
                children: navItems(context).map((item) {
                  final isActive = _isActive(item.route, _currentRoute);
                  return Expanded(child: _buildNavItem(context, item, isActive));
                }).toList(),
              ),
            ),
          ),
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, NavItem item, bool isActive) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => _handleNavigation(context, item.route),
      child: AnimatedScale(
        scale: isActive ? 1 : 0.96,
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 280),
          curve: Curves.easeOutCubic,
          margin: const EdgeInsets.symmetric(horizontal: 1),
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
          decoration: BoxDecoration(
            color: isActive ? AppColors.gold.withValues(alpha: 0.16) : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isActive ? AppColors.gold.withValues(alpha: 0.55) : Colors.transparent,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                item.icon,
                size: 18,
                color: isActive ? AppColors.gold : AppColors.textMuted,
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTheme.bodySmall.copyWith(
                  color: isActive ? AppColors.gold : AppColors.textMuted,
                  fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                  fontSize: 9,
                  letterSpacing: 0.3,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class NavItem {
  final String label;
  final String route;
  final IconData icon;

  const NavItem({required this.label, required this.route, required this.icon});
}
