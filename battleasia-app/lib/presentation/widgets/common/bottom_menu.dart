import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/screens/shop/shop_screen.dart';
import 'package:battleasia_app/presentation/screens/referral/referral_screen.dart';
import 'package:battleasia_app/presentation/screens/feed/feed_screen.dart';
import 'package:battleasia_app/presentation/widgets/shop/shop_auth.dart';

class FloatingBottomNav extends StatefulWidget {
  const FloatingBottomNav({super.key});

  @override
  State<FloatingBottomNav> createState() => _FloatingBottomNavState();
}

class _FloatingBottomNavState extends State<FloatingBottomNav> {
  static List<NavItem> navItems(BuildContext context) => [
    NavItem(label: 'nav.play'.tr(), route: '/play', icon: Icons.sports_esports),
    NavItem(label: 'nav.shop'.tr(), route: '/shop', icon: Icons.shopping_bag),
    NavItem(label: 'nav.referral'.tr(), route: '/referral', icon: Icons.people),
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
        } else if (routeName == '/referral') {
          return '/referral';
        } else if (routeName == '/feed') {
          return '/feed';
        }
        // Contains match
        if (routeName.contains('/play') || routeName.contains('match')) {
          return '/play';
        } else if (routeName.contains('/shop')) {
          return '/shop';
        } else if (routeName.contains('/referral')) {
          return '/referral';
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
      final referralScreen = context
          .findAncestorWidgetOfExactType<ReferralScreen>();
      if (referralScreen != null) return '/referral';
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
      } else if (stateType.contains('ShopScreen')) {
        return '/shop';
      } else if (stateType.contains('ReferralScreen')) {
        return '/referral';
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
    // Update current route immediately
    setState(() {
      _currentRoute = route;
    });

    Widget targetScreen;
    switch (route) {
      case '/play':
        targetScreen = const PlayScreen();
        break;
      case '/shop':
        openShopRoute(context, const ShopScreen(), routeName: '/shop');
        return;
      case '/referral':
        targetScreen = const ReferralScreen();
        break;
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

    // Bottom offset = system navigation bar height + 5 px spacing.
    // This keeps the pill above the device's launch bar on all devices
    // (physical buttons, gesture bar, or tall virtual nav bars).
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Positioned(
      bottom: bottomInset + 5,
      left: 0,
      right: 0,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: AppColors.surface.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border(0.14)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.45),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: navItems(context).map((item) {
              final isActive = _isActive(item.route, _currentRoute);
              return _buildNavItem(context, item, isActive);
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, NavItem item, bool isActive) {
    return GestureDetector(
      onTap: () => _handleNavigation(context, item.route),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: EdgeInsets.symmetric(
          horizontal: isActive ? 16 : 12,
          vertical: isActive ? 8 : 12,
        ),
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          gradient: isActive ? AppColors.goldGradient : null,
          color: isActive ? null : Colors.transparent,
          borderRadius: BorderRadius.circular(isActive ? 10 : 22),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              item.icon,
              size: isActive ? 18 : 22,
              color: isActive ? Colors.black : AppColors.textMuted,
            ),
            if (isActive) ...[
              const SizedBox(width: 6),
              Text(
                item.label,
                style: AppTheme.bodySmall.copyWith(
                  color: Colors.black,
                  fontWeight: FontWeight.w600,
                  fontSize: 11,
                ),
              ),
            ],
          ],
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
