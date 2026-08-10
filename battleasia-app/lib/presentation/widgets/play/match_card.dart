import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/date_utils.dart' as date_utils;
import 'package:battleasia_app/data/models/match_model.dart';

class MatchCard extends StatefulWidget {
  final MatchModel match;
  final VoidCallback? onWatchLive;
  final VoidCallback onJoin;
  final VoidCallback? onShowRoomDetails;
  final VoidCallback? onMatchNameTap;
  final bool joining;
  final bool canJoin;
  final bool isJoined;
  final bool showLive;
  final bool isPremiumUser;

  const MatchCard({
    super.key,
    required this.match,
    this.onWatchLive,
    required this.onJoin,
    this.onShowRoomDetails,
    this.onMatchNameTap,
    this.joining = false,
    this.canJoin = true,
    this.isJoined = false,
    this.showLive = false,
    this.isPremiumUser = false,
  });

  @override
  State<MatchCard> createState() => _MatchCardState();
}

class _MatchCardState extends State<MatchCard> {
  Widget _buildMaskedBanner(String bannerUrl) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Banner image
        ImageUtils.networkImage(
          bannerUrl,
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
          memCacheWidth: 900,
          errorWidget: Image.asset(
            'assets/images/game.webp',
            fit: BoxFit.cover,
            width: double.infinity,
            height: double.infinity,
          ),
        ),
        // Mask image overlay - positioned on the right center (100% 50% like web version)
        // The mask creates the decorative edge effect on the right side
        // Using ShaderMask to apply proper masking effect similar to CSS mask
        Positioned(
          right: -50,
          top: 0,
          bottom: 0,
          child: ShaderMask(
            shaderCallback: (bounds) {
              return const LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [Colors.transparent, Colors.white],
              ).createShader(bounds);
            },
            blendMode: BlendMode.dstIn,
            child: Image.asset(
              'assets/images/bounty-mask.webp',
              fit: BoxFit.cover,
              alignment: Alignment.centerRight,
              width: 100, // Adjust based on mask image size
              errorBuilder: (context, error, stackTrace) {
                // If mask image doesn't exist, use a gradient as fallback
                return Container(
                  width: 100,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.2),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return _buildCard();
  }

  Widget _buildCard() {
    final bannerUrl =
        ImageUtils.getImageUrl(widget.match.banner) ?? 'assets/images/game.webp';
    final buttonDisabled = widget.joining || widget.isJoined || !widget.canJoin;

    // Responsive sizes
    final topPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final cardHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 250.0,
    ).clamp(220.0, 250.0);

    final killIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 45.0,
    ).clamp(38.0, 45.0);

    final killIconTop = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: -18.0,
    ).clamp(-18.0, -16.0);

    return Container(
      // Add minimal top padding to accommodate the kill icon
      padding: EdgeInsets.only(top: topPadding),
      child: Card(
        color: AppTheme.surfaceColor,
        clipBehavior: Clip.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Main content - Row layout like web version
            Container(
              height: cardHeight,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: const AssetImage('assets/images/bounty-bg.webp'),
                  fit: BoxFit.cover,
                  onError: (_, __) {},
                ),
              ),
              child: Row(
                children: [
                  // Banner section (left) - with mask
                  Expanded(flex: 1, child: _buildBannerSection(bannerUrl)),
                  // Match info section (right)
                  Expanded(
                    flex: 1,
                    child: _buildMatchInfoSection(buttonDisabled),
                  ),
                ],
              ),
            ),

            // Kill icon at top - positioned outside card bounds
            Positioned(
              top: killIconTop,
              left: 0,
              right: 0,
              child: Center(
                child: Image.asset(
                  'assets/images/bounty-kill-icon.webp',
                  width: killIconSize,
                  height: killIconSize,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),

            // PREMIUM badge (top-right corner) – shown when match is premium-only
            if (widget.match.premiumOnly)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade700,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.workspace_premium,
                        color: Colors.white,
                        size: 12,
                      ),
                      SizedBox(width: 3),
                      Text(
                        'PREMIUM',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBannerSection(String bannerUrl) {
    return ClipRRect(
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(8),
        bottomLeft: Radius.circular(8),
      ),
      child: _buildMaskedBanner(bannerUrl),
    );
  }

  Widget _buildMatchInfoSection(bool buttonDisabled) {
    // Responsive sizes
    final contentPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final contentPaddingTop = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 30.0,
    ).clamp(24.0, 30.0);

    final contentPaddingRight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(12.0, 20.0);

    final contentPaddingBottom = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(12.0, 20.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 20.0,
    );

    final linkFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    final dateFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 10.0,
      min: 9.0,
      max: 12.0,
    );

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 10.0,
      max: 13.0,
    );

    final perKillLabelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 11.0,
      min: 10.0,
      max: 13.0,
    );

    final perKillValueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 13.0,
      min: 11.0,
      max: 15.0,
    );

    final buttonPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final bulletSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 6.0,
    ).clamp(4.0, 6.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(4.0, 8.0);

    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(2.0, 4.0);

    final spacing12 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final currencyIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(14.0, 16.0);

    final loadingIndicatorSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 20.0);

    return Container(
      padding: EdgeInsets.fromLTRB(
        contentPadding,
        contentPaddingTop,
        contentPaddingRight,
        contentPaddingBottom,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Top section
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Match name with bullet
              Row(
                children: [
                  Container(
                    width: bulletSize,
                    height: bulletSize,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                  ),
                  SizedBox(width: spacing8),
                  Expanded(
                    child: GestureDetector(
                      onTap: widget.onMatchNameTap,
                      child: Text(
                        widget.match.matchName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.heading3.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: titleFontSize,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: spacing8),

              // ID & Password link
              GestureDetector(
                onTap: widget.onShowRoomDetails,
                child: Text(
                  'ID & PASSWORD',
                  style: AppTheme.bodySmall.copyWith(
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                    fontSize: linkFontSize,
                  ),
                ),
              ),
              SizedBox(height: spacing4),

              // Date and time
              Text(
                date_utils.DateUtils.formatDateTime(widget.match.matchSchedule),
                style: AppTheme.bodySmall.copyWith(
                  color: AppTheme.accentColor,
                  fontSize: dateFontSize,
                ),
              ),
              SizedBox(height: spacing12),

              // Statistics row
              Row(
                children: [
                  // Prize Pool
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PRIZE POOL',
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.green,
                            fontWeight: FontWeight.w600,
                            fontSize: labelFontSize,
                          ),
                        ),
                        SizedBox(height: spacing4),
                        Text(
                          widget.match.prizeDescription ?? 'N/A',
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.green,
                            fontSize: valueFontSize,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: 12.0,
                    ).clamp(8.0, 12.0),
                  ),
                  // Per Kill
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PER KILL',
                          style: AppTheme.bodySmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: perKillLabelFontSize,
                          ),
                        ),
                        SizedBox(height: spacing4),
                        Text(
                          '${widget.match.perKill.toStringAsFixed(0)}',
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: perKillValueFontSize,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Join button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: buttonDisabled ? null : widget.onJoin,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFff6b7a),
                padding: EdgeInsets.symmetric(vertical: buttonPadding),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
                disabledBackgroundColor: Colors.grey,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: widget.joining
                  ? SizedBox(
                      height: loadingIndicatorSize,
                      width: loadingIndicatorSize,
                      child: const CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : widget.isJoined
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Image.asset(
                          'assets/images/currency.webp',
                          width: currencyIconSize,
                          height: currencyIconSize,
                          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                        ),
                        SizedBox(width: spacing8),
                        Text(
                          '${widget.match.entryFee.toStringAsFixed(0)} SPECTATE',
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: buttonFontSize,
                          ),
                        ),
                      ],
                    )
                  : Text(
                      'JOIN MATCH',
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: buttonFontSize,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
