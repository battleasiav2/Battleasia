import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:intl/intl.dart';

class PublicProfileInfo extends StatelessWidget {
  final int gamesPlayed;
  final int totalKills;
  final double amountWon;
  final List<ActivityCard> activities;

  const PublicProfileInfo({
    super.key,
    required this.gamesPlayed,
    required this.totalKills,
    required this.amountWon,
    required this.activities,
  });

  String _formatCurrency(double amount) {
    return NumberFormat('#,##0.00').format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Statistics Cards
        Text(
          'STATISTICS',
          style: AppTheme.heading3.copyWith(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
          ),
        ),
        SizedBox(height: spacing16),
        _buildStatisticsRow(isMobile),
        SizedBox(height: spacing24),

        // Recent Activity
        if (activities.isNotEmpty) ...[
          Text(
            'RECENT ACTIVITY',
            style: AppTheme.heading3.copyWith(
              color: Colors.black,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
          SizedBox(height: spacing16),
          _buildActivities(isMobile),
        ],
      ],
    );
  }

  Widget _buildStatisticsRow(bool isMobile) {
    return isMobile
        ? Column(
            children: [
              _buildStatCard('Games Played', gamesPlayed.toString(), Icons.videogame_asset),
              const SizedBox(height: 12.0),
              _buildStatCard('Total Kills', totalKills.toString(), Icons.military_tech),
              const SizedBox(height: 12.0),
              _buildStatCard('Amount Won', 'BDT ${_formatCurrency(amountWon)}', Icons.monetization_on),
            ],
          )
        : Row(
            children: [
              Expanded(
                child: _buildStatCard('Games Played', gamesPlayed.toString(), Icons.videogame_asset),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard('Total Kills', totalKills.toString(), Icons.military_tech),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard('Amount Won', 'BDT ${_formatCurrency(amountWon)}', Icons.monetization_on),
              ),
            ],
          );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppTheme.primaryColor, size: 24),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  label,
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTheme.heading2.copyWith(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 24,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivities(bool isMobile) {
    return Column(
      children: activities.map((activity) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade300),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Activity Image or Icon
              if (activity.image != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    activity.image!,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          activity.icon,
                          color: AppTheme.primaryColor,
                          size: 30,
                        ),
                      );
                    },
                  ),
                )
              else
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    activity.icon,
                    color: AppTheme.primaryColor,
                    size: 30,
                  ),
                ),
              const SizedBox(width: 16),
              // Activity Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity.title,
                      style: AppTheme.heading3.copyWith(
                        color: Colors.black,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      activity.subtitle,
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class ActivityCard {
  final String title;
  final String subtitle;
  final String? image;
  final IconData icon;

  ActivityCard({
    required this.title,
    required this.subtitle,
    this.image,
    required this.icon,
  });
}
