import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';

class ReferralScreen extends StatefulWidget {
  const ReferralScreen({super.key});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();
  bool _copied = false;
  int _commissionRate = 10; // Default 10%

  @override
  void initState() {
    super.initState();
    _fetchReferralSettings();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchReferralSettings() async {
    try {
      final result = await _userService.getReferralSettings();
      if (result['success'] == true && mounted) {
        setState(() {
          _commissionRate = (result['commissionRate'] as num?)?.toInt() ?? 10;
        });
      }
    } catch (e) {
      // Keep default 10% on error
    }
  }

  void _handleCopy(String referralCode) {
    Clipboard.setData(ClipboardData(text: referralCode));
    setState(() {
      _copied = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _copied = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final referralUrl = user != null
        ? '${AppConfig.siteUrl}/auth/sign-up?ref=${user.id}'
        : '';
    final isMobile = ResponsiveUtils.isMobile(context);
    final horizontalPadding = isMobile ? 16.0 : 24.0;
    final bottomPadding = 80.0 + MediaQuery.of(context).padding.bottom;
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);
    final containerPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(16.0, 24.0);
    final sectionSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 40.0,
    ).clamp(32.0, 48.0);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Column(
                    children: [
                      SizedBox(height: spacing16),
                      // Main Container with gradient background
                      Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Color(0xFF444444), Color(0xFF04040B)],
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.all(containerPadding),
                        child: Column(
                          children: [
                            // Header Section
                            _buildHeaderSection(),
                            SizedBox(height: sectionSpacing),

                            // Referral Code Section
                            _buildReferralLinkSection(referralUrl),
                            SizedBox(height: sectionSpacing),

                            // How It Works Section
                            _buildHowItWorksSection(),
                          ],
                        ),
                      ),
                      SizedBox(height: spacing24),
                    ],
                  ),
                ),
              ),
              // Bottom padding for floating nav
              SliverToBoxAdapter(child: SizedBox(height: bottomPadding)),
            ],
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppHeader(scrollController: _scrollController),
          ),

          // Bottom menu
          const FloatingBottomNav(),
        ],
      ),
    );
  }

  Widget _buildHeaderSection() {
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 36.0,
    );
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);

    return Column(
      children: [
        Text(
          'REFER MORE TO EARN MORE',
          style: AppTheme.heading2.copyWith(
            color: const Color(0xFF10b981),
            fontWeight: FontWeight.bold,
            fontSize: titleFontSize,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: spacing16),
        Column(
          children: [
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontSize: bodyFontSize,
                  height: 1.8,
                ),
                children: [
                  const TextSpan(
                    text:
                        'Invite your friends on App using your Referral Code to Earn ',
                  ),
                  TextSpan(
                    text: '$_commissionRate%',
                    style: AppTheme.bodyMedium.copyWith(
                      fontSize: bodyFontSize,
                      color: const Color(0xFF10b981),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const TextSpan(
                    text: ' of their deposits!',
                  ),
                ],
              ),
            ),
            SizedBox(height: spacing8),
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontSize: bodyFontSize,
                  height: 1.8,
                ),
                children: [
                  const TextSpan(
                    text:
                        'When they join First Paid match, with minimum match fee of ',
                  ),
                  TextSpan(
                    text: '20',
                    style: AppTheme.bodyMedium.copyWith(
                      fontSize: bodyFontSize,
                      color: const Color(0xFF10b981),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const TextSpan(text: '.'),
                ],
              ),
            ),
            SizedBox(height: spacing8),
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white,
                  fontSize: bodyFontSize,
                  height: 1.8,
                ),
                children: [
                  const TextSpan(text: 'Your friends also get '),
                  TextSpan(
                    text: '5',
                    style: AppTheme.bodyMedium.copyWith(
                      fontSize: bodyFontSize,
                      color: const Color(0xFF10b981),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const TextSpan(text: ' as Signup Bonus!'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildReferralLinkSection(String referralUrl) {
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 22.0,
    );
    final codeFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 40.0,
    );
    final smallFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 12.0);
    final codePaddingH = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 32.0);
    final codePaddingV = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(20.0, 28.0);

    return Column(
      children: [
        Text(
          'YOUR REFERRAL LINK',
          style: AppTheme.heading3.copyWith(
            color: const Color(0xFF10b981),
            fontWeight: FontWeight.w600,
            fontSize: labelFontSize,
          ),
        ),
        SizedBox(height: spacing16),
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: codePaddingH,
            vertical: codePaddingV,
          ),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  referralUrl.isNotEmpty ? referralUrl : 'Loading...',
                  style: AppTheme.bodyMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontSize: smallFontSize,
                  ),
                ),
              ),
              SizedBox(width: spacing16),
              IconButton(
                onPressed: () => _handleCopy(referralUrl),
                icon: Icon(
                  _copied ? Icons.check_circle : Icons.copy,
                  color: Colors.white,
                  size: iconSize,
                ),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.1),
                ),
              ),
            ],
          ),
        ),
        if (_copied) ...[
          SizedBox(height: spacing8),
          Text(
            'Copied to clipboard!',
            style: AppTheme.bodySmall.copyWith(
              fontSize: smallFontSize,
              color: const Color(0xFF10b981),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildHowItWorksSection() {
    final headingFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 32.0,
      min: 28.0,
      max: 40.0,
    );
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(16.0, 24.0);
    final spacing32 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 40.0);

    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(cardPadding),
        child: Column(
          children: [
            Text(
              'How It Works',
              style: AppTheme.heading2.copyWith(
                color: const Color(0xFFFF8C42),
                fontWeight: FontWeight.bold,
                fontSize: headingFontSize,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: spacing32),
            // Steps Row - Responsive layout
            LayoutBuilder(
              builder: (context, constraints) {
                final isSmallScreen = constraints.maxWidth < 600;
                final spacing16 = ResponsiveUtils.getResponsiveSpacing(
                  context,
                  baseSize: 16.0,
                ).clamp(12.0, 20.0);
                final arrowSize =
                    ResponsiveUtils.getResponsiveSpacing(
                      context,
                      baseSize: isSmallScreen ? 30.0 : 40.0,
                    ).clamp(
                      isSmallScreen ? 24.0 : 32.0,
                      isSmallScreen ? 36.0 : 48.0,
                    );
                final arrowPadding = ResponsiveUtils.getResponsiveSpacing(
                  context,
                  baseSize: 8.0,
                ).clamp(6.0, 12.0);

                if (isSmallScreen) {
                  // Vertical layout for small screens
                  return Column(
                    children: [
                      _buildStep(icon: Icons.person, title: 'User Registers'),
                      SizedBox(height: spacing16),
                      Icon(
                        Icons.arrow_downward,
                        color: const Color(0xFF10b981),
                        size: arrowSize,
                      ),
                      SizedBox(height: spacing16),
                      _buildStep(
                        icon: Icons.sports_esports,
                        title: 'Joins A Match',
                      ),
                      SizedBox(height: spacing16),
                      Icon(
                        Icons.arrow_downward,
                        color: const Color(0xFF10b981),
                        size: arrowSize,
                      ),
                      SizedBox(height: spacing16),
                      _buildStep(
                        icon: Icons.card_giftcard,
                        title: 'You Get Rewarded',
                      ),
                    ],
                  );
                } else {
                  // Horizontal layout for larger screens
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Step 1: User Registers
                      Expanded(
                        child: _buildStep(
                          icon: Icons.person,
                          title: 'User Registers',
                        ),
                      ),
                      // Arrow 1
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: arrowPadding),
                        child: Icon(
                          Icons.arrow_forward,
                          color: const Color(0xFF10b981),
                          size: arrowSize,
                        ),
                      ),
                      // Step 2: Joins A Match
                      Expanded(
                        child: _buildStep(
                          icon: Icons.sports_esports,
                          title: 'Joins A Match',
                        ),
                      ),
                      // Arrow 2
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: arrowPadding),
                        child: Icon(
                          Icons.arrow_forward,
                          color: const Color(0xFF10b981),
                          size: arrowSize,
                        ),
                      ),
                      // Step 3: You Get Rewarded
                      Expanded(
                        child: _buildStep(
                          icon: Icons.card_giftcard,
                          title: 'You Get Rewarded',
                        ),
                      ),
                    ],
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep({required IconData icon, required String title}) {
    final stepCircleSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 120.0);
    final stepIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 50.0,
    ).clamp(40.0, 60.0);
    final stepTitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 22.0,
    );
    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 20.0);
    final borderWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 3.0,
    ).clamp(2.0, 4.0);

    return Column(
      children: [
        Container(
          width: stepCircleSize,
          height: stepCircleSize,
          decoration: BoxDecoration(
            color: const Color(0xFF1976d2),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: borderWidth),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: stepIconSize),
        ),
        SizedBox(height: spacing16),
        Text(
          title,
          style: AppTheme.heading3.copyWith(
            color: Colors.black,
            fontWeight: FontWeight.w600,
            fontSize: stepTitleFontSize,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
