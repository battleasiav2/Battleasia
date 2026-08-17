import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: const Color(0xF2141414),
          border: Border(
            top: BorderSide(color: AppColors.gold.withValues(alpha: 0.28)),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.45),
              blurRadius: 16,
              offset: const Offset(0, -4),
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
    );
  }

  Widget _buildNavItem(BuildContext context, NavItem item, bool isActive) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => _handleNavigation(context, item.route),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            item.icon,
            size: 20,
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
              fontSize: 10,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 5),
          AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            height: 2,
            width: isActive ? 22 : 0,
            color: AppColors.gold,
          ),
        ],
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
