import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/app_footer.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/home/hero_banner_section.dart';
import 'package:battleasia_app/presentation/widgets/home/home_dashboard_section.dart';
import 'package:battleasia_app/presentation/widgets/home/about_section.dart';
import 'package:battleasia_app/presentation/widgets/home/how_to_play_section.dart';
import 'package:battleasia_app/presentation/widgets/home/rules_section.dart';

/// Marketing + live pulse home — mirrors web `/dashboard`.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authed = context.watch<AuthProvider>().isAuthenticated;

    return Scaffold(
      backgroundColor: AppColors.pageBg,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              const SliverToBoxAdapter(child: HeroBannerSection()),
              const SliverToBoxAdapter(child: HomeDashboardSection()),
              const SliverToBoxAdapter(child: AboutSection()),
              const SliverToBoxAdapter(child: HowToPlaySection()),
              const SliverToBoxAdapter(child: RulesSection()),
              const SliverToBoxAdapter(child: AppFooter()),
              SliverToBoxAdapter(child: SizedBox(height: authed ? 90 : 24)),
            ],
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),
          if (authed) const FloatingBottomNav(),
        ],
      ),
    );
  }
}
