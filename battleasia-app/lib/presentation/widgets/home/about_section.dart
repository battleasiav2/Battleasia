import 'package:flutter/material.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/data/models/statistic_model.dart';

class AboutSection extends StatelessWidget {
  const AboutSection({super.key});

  @override
  Widget build(BuildContext context) {
    final isMobile = AppUtils.isMobile(context);

    final statistics = [
      StatisticModel(
        value: AppConstants.statistics['activePlayers']!,
        label: 'Active Players',
      ),
      StatisticModel(
        value: AppConstants.statistics['prizeMoney']!,
        label: 'Prize Money',
      ),
      StatisticModel(
        value: AppConstants.statistics['gamesSupported']!,
        label: 'Games Supported',
      ),
      StatisticModel(
        value: AppConstants.statistics['tournaments']!,
        label: 'Tournaments',
      ),
    ];

    return Container(
      height: isMobile ? 464 : 890,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.grey.shade100, Colors.white],
        ),
        // Uncomment when background image is added:
        // image: DecorationImage(
        //   image: AssetImage('assets/images/gs-bg.webp'),
        //   fit: BoxFit.cover,
        // ),
      ),
      child: Container(
        margin: const EdgeInsets.only(top: 37),
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 16 : 40,
          vertical: isMobile ? 20 : 40,
        ),
        child: Column(
          children: [
            // Header
            Column(
              children: [
                Text(
                  'ABOUT BATTLEASIA',
                  style: AppTheme.heading2.copyWith(
                    fontSize: isMobile ? 32 : 48,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Container(
                  width: 200,
                  height: 2,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 40),

            // Content
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Side - Text Content
                  Expanded(
                    flex: isMobile ? 1 : 7,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildParagraph(
                          'BattleAsia is a premier mobile gaming tournament platform where players compete in exciting tournaments and win real cash prizes. Our platform brings together the best mobile gamers from around the world to participate in competitive gaming events.',
                          isMobile,
                        ),
                        const SizedBox(height: 24),
                        _buildParagraph(
                          "We support popular mobile games including PUBG Mobile, Free Fire, Mobile Legends, and many more. Whether you're a casual player or a competitive pro, BattleAsia offers tournaments suitable for all skill levels.",
                          isMobile,
                        ),
                        const SizedBox(height: 24),
                        _buildParagraph(
                          'With secure payment systems, fair play policies, and a thriving community of gamers, BattleAsia is the ultimate destination for mobile esports. Join thousands of players who are already competing and winning on our platform!',
                          isMobile,
                        ),
                      ],
                    ),
                  ),

                  if (!isMobile) const SizedBox(width: 40),

                  // Right Side - Statistics Grid
                  if (!isMobile)
                    Expanded(
                      flex: 5,
                      child: GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 24,
                              mainAxisSpacing: 24,
                              childAspectRatio: 1,
                            ),
                        itemCount: statistics.length,
                        itemBuilder: (context, index) {
                          return _buildStatCard(statistics[index]);
                        },
                      ),
                    ),
                ],
              ),
            ),

            // Mobile Statistics
            if (isMobile) ...[
              const SizedBox(height: 24),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                itemCount: statistics.length,
                itemBuilder: (context, index) {
                  return _buildStatCard(statistics[index], isMobile: true);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildParagraph(String text, bool isMobile) {
    return Text(
      text,
      style: AppTheme.bodyMedium.copyWith(
        fontSize: isMobile ? 14 : 24,
        color: Colors.black,
        height: 1.8,
      ),
    );
  }

  Widget _buildStatCard(StatisticModel stat, {bool isMobile = false}) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceColor.withOpacity(0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        boxShadow: AppUtils.getBoxShadow(),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            stat.value,
            style: AppTheme.heading3.copyWith(fontSize: isMobile ? 28 : 42),
          ),
          const SizedBox(height: 8),
          Text(
            stat.label,
            style: AppTheme.bodySmall.copyWith(fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
