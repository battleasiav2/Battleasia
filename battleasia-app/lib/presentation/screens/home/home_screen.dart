import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/app_footer.dart';
import 'package:battleasia_app/presentation/widgets/home/hero_banner_section.dart';
import 'package:battleasia_app/presentation/widgets/home/about_section.dart';
import 'package:battleasia_app/presentation/widgets/home/how_to_play_section.dart';
import 'package:battleasia_app/presentation/widgets/home/rules_section.dart';

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
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Scrollable content
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Hero Banner Section (starts at top: 0)
              const SliverToBoxAdapter(child: HeroBannerSection()),

              // About Section
              const SliverToBoxAdapter(child: AboutSection()),

              // How to Play Section
              const SliverToBoxAdapter(child: HowToPlaySection()),

              // Rules Section
              const SliverToBoxAdapter(child: RulesSection()),

              // Footer
              const SliverToBoxAdapter(child: AppFooter()),
            ],
          ),

          // Header (transparent, overlays banner at top)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),

          // Floating Chat Button
          Positioned(
            bottom: 20,
            right: 20,
            child: FloatingActionButton(
              onPressed: () {
                // Open chat
              },
              backgroundColor: AppTheme.secondaryColor,
              child: const Icon(Icons.chat, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
