import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/data/models/game_mode_model.dart';

class HowToPlaySection extends StatelessWidget {
  const HowToPlaySection({super.key});

  @override
  Widget build(BuildContext context) {
    final isMobile = AppUtils.isMobile(context);

    final gameModes = [
      GameModeModel(
        title: 'Solo Mode',
        description: 'Play alone and test your skills against other players',
        icon: '👤',
        color: 0xFF9333EA,
        features: [
          GameModeFeature(
            text:
                'Maps: Karakin, Nusa, Erangel, Miramar, Sanhok, Vikendi, Rondo',
            icon: '📍',
          ),
          GameModeFeature(
            text: 'Modes: Classic Matches, TDM, Gun Game',
            icon: '🎮',
          ),
          GameModeFeature(
            text: 'Play with random teammates or go fully solo',
            icon: '👥',
          ),
          GameModeFeature(
            text: 'Your history & stats depend on your own performance',
            icon: '📊',
          ),
        ],
      ),
      GameModeModel(
        title: 'Duo Mode',
        description: 'Team up with a partner for double the action',
        icon: '👥',
        color: 0xFF9333EA,
        features: [
          GameModeFeature(
            text: 'Invite a friend or get paired with a random teammate',
            icon: '🤝',
          ),
          GameModeFeature(
            text: 'Fight for the Chicken Dinner + Cash Rewards',
            icon: '🏆',
          ),
          GameModeFeature(
            text: 'Coordinate strategies for maximum effectiveness',
            icon: '💡',
          ),
          GameModeFeature(text: 'Split earnings with your partner', icon: '💰'),
        ],
      ),
      GameModeModel(
        title: 'Squad Mode',
        description: 'Form a team of four and dominate the battlefield',
        icon: '👥',
        color: 0xFFFF8C00,
        features: [
          GameModeFeature(text: 'Play with 3 random teammates', icon: '👥'),
          GameModeFeature(
            text: 'Create unforgettable history together',
            icon: '📜',
          ),
          GameModeFeature(
            text: 'Teamwork & skills make all the difference',
            icon: '⚡',
          ),
          GameModeFeature(
            text: 'Higher rewards for squad victories',
            icon: '⭐',
          ),
        ],
      ),
      GameModeModel(
        title: 'TDM Mode',
        description: 'Fast-paced Team Deathmatch action',
        icon: '⚡',
        color: 0xFFFF8C00,
        features: [
          GameModeFeature(text: 'Fast-paced 4v4 Team Deathmatch', icon: '🎯'),
          GameModeFeature(text: 'Play with random teammates', icon: '👥'),
          GameModeFeature(text: 'Win Cash + Victory Joy!', icon: '🏅'),
          GameModeFeature(
            text: 'Quick matches for instant rewards',
            icon: '⏱️',
          ),
        ],
      ),
    ];

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 16 : 40,
        vertical: isMobile ? 40 : 80,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.backgroundColor,
        // Uncomment when background image is added:
        // image: DecorationImage(
        //   image: AssetImage('assets/images/black_bg.webp'),
        //   fit: BoxFit.cover,
        // ),
      ),
      child: Column(
        children: [
          // Header
          Text(
            'HOW TO PLAY',
            style: AppTheme.heading2.copyWith(
              fontSize: isMobile ? 36 : 56,
              shadows: [
                Shadow(
                  offset: const Offset(0, 0),
                  blurRadius: 20,
                  color: Colors.white.withOpacity(0.5),
                ),
                Shadow(
                  offset: const Offset(0, 0),
                  blurRadius: 40,
                  color: Colors.white.withOpacity(0.3),
                ),
              ],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Container(
            width: 120,
            height: 3,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(1),
              boxShadow: [
                BoxShadow(color: Colors.white.withOpacity(0.5), blurRadius: 10),
              ],
            ),
          ),

          const SizedBox(height: 48),

          // Game Mode Cards
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: isMobile ? 1 : 2,
              crossAxisSpacing: 24,
              mainAxisSpacing: 24,
              childAspectRatio: isMobile ? 1.2 : 0.85,
            ),
            itemCount: gameModes.length,
            itemBuilder: (context, index) {
              return _buildGameModeCard(gameModes[index], isMobile);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildGameModeCard(GameModeModel mode, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16 : 24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor.withOpacity(0.95),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        boxShadow: [
          BoxShadow(
            color: Color(mode.color).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Color(mode.color).withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(
                color: Color(mode.color).withOpacity(0.5),
                width: 2,
              ),
            ),
            child: Center(
              child: Text(mode.icon, style: const TextStyle(fontSize: 40)),
            ),
          ),

          const SizedBox(height: 16),

          // Title
          Text(
            mode.title,
            style: AppTheme.heading3.copyWith(fontSize: isMobile ? 24 : 32),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 8),

          // Description
          Text(
            mode.description,
            style: AppTheme.bodySmall.copyWith(fontSize: isMobile ? 14 : 16),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 16),

          // Features
          Expanded(
            child: ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: mode.features.length,
              itemBuilder: (context, index) {
                final feature = mode.features[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(feature.icon, style: const TextStyle(fontSize: 20)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          feature.text,
                          style: AppTheme.bodySmall.copyWith(
                            fontSize: isMobile ? 12 : 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
