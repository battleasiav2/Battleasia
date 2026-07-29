import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/presentation/widgets/common/app_header.dart';
import 'package:battleasia_app/presentation/widgets/common/bottom_menu.dart';
import 'package:battleasia_app/presentation/widgets/profile/profile_banner.dart';
import 'package:battleasia_app/presentation/widgets/profile/profile_sidebar.dart';
import 'package:battleasia_app/presentation/widgets/profile/profile_content.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final ScrollController _scrollController = ScrollController();
  final UserService _userService = UserService();

  File? _pendingAvatarFile;
  int _gamesPlayed = 0;
  int _totalKills = 0;
  double _amountWon = 0;
  List<ActivityCard> _activities = [];

  @override
  void initState() {
    super.initState();
    _fetchProfileStats();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfileStats() async {
    try {
      final result = await _userService.getMatchHistory();
      if (result['success'] == true && result['data'] != null) {
        final history = result['data'] as List<dynamic>;
        _gamesPlayed = history.length;

        // Calculate total kills and amount won
        _totalKills = history.fold<int>(0, (sum, record) {
          final perKill = record['perKill'] ?? 0;
          return sum + (int.tryParse(perKill.toString()) ?? 0);
        });

        _amountWon = history.fold<double>(0.0, (sum, record) {
          final prize = record['prizeDescription'] ?? 0;
          return sum + (double.tryParse(prize.toString()) ?? 0.0);
        });

        // Calculate most played and last played
        final gameCounts = <String, Map<String, dynamic>>{};
        for (var record in history) {
          final gameName =
              record['gameName'] ?? record['matchName'] ?? 'Unknown Game';
          final currentCount = gameCounts[gameName]?['count'] as int? ?? 0;
          gameCounts[gameName] = {'count': currentCount + 1, 'record': record};
        }

        String? mostPlayedTitle;
        Map<String, dynamic>? mostPlayedRecord;
        int maxCount = 0;
        gameCounts.forEach((title, info) {
          final count = info['count'] as int? ?? 0;
          if (count > maxCount) {
            maxCount = count;
            mostPlayedTitle = title;
            mostPlayedRecord = info['record'] as Map<String, dynamic>?;
          }
        });

        Map<String, dynamic>? lastPlayedRecord;
        DateTime? lastPlayedDate;
        for (var record in history) {
          final joinedAt = record['joinedAt'];
          if (joinedAt != null) {
            try {
              final date = DateTime.parse(joinedAt);
              if (lastPlayedDate == null || date.isAfter(lastPlayedDate)) {
                lastPlayedDate = date;
                lastPlayedRecord = record;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        // Build activity list
        final activityList = <ActivityCard>[];
        if (mostPlayedTitle != null && mostPlayedRecord != null) {
          final banner = mostPlayedRecord?['banner'];
          activityList.add(
            ActivityCard(
              title: mostPlayedTitle!,
              subtitle: 'Most played',
              image: banner != null ? banner.toString() : null,
              icon: Icons.favorite,
            ),
          );
        }

        if (lastPlayedRecord != null) {
          final gameName =
              (lastPlayedRecord['gameName'] ??
                      lastPlayedRecord['matchName'] ??
                      'Unknown Game')
                  .toString();
          final dateStr = lastPlayedDate != null
              ? 'Last played ${_formatDateTime(lastPlayedDate)}'
              : 'Last played';
          final banner = lastPlayedRecord['banner'];
          activityList.add(
            ActivityCard(
              title: gameName,
              subtitle: dateStr,
              image: banner != null ? banner.toString() : null,
              icon: Icons.access_time,
            ),
          );
        }

        setState(() {
          _activities = activityList;
        });
      }
    } catch (e) {
      // Handle error silently or show snackbar
      print('Error fetching profile stats: $e');
    }
  }

  String _formatDateTime(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  void _handleAvatarSaved() {
    setState(() {
      _pendingAvatarFile = null;
    });
    // Refresh profile stats after avatar update
    _fetchProfileStats();
  }

  /// Called immediately when user selects an avatar image.
  /// Converts the file to base64 and saves it to the server right away —
  /// no need to press "Save Profile" separately.
  Future<void> _handleAvatarSelected(File file) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Show the selected image immediately in the banner and header
    setState(() {
      _pendingAvatarFile = file;
    });
    authProvider.setPendingAvatar(file);

    try {
      if (!await file.exists()) {
        _showAvatarSnackBar('Avatar file not found', isError: true);
        return;
      }

      final imageBytes = await file.readAsBytes();
      final fileName = file.path.toLowerCase();
      String mimeType = 'image/jpeg';
      if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.gif')) {
        mimeType = 'image/gif';
      } else if (fileName.endsWith('.webp')) {
        mimeType = 'image/webp';
      }
      final base64Avatar = 'data:$mimeType;base64,${base64Encode(imageBytes)}';

      final user = authProvider.user;
      if (user == null) return;

      final result = await _userService.updateProfile(
        username: user.username,
        email: user.email,
        countryCode: user.countryCode,
        mobileNo: user.mobileNo,
        pubgId: user.pubgId,
        gameServer: user.gameServer,
        referralCode: user.referralCode,
        avatar: base64Avatar,
        twitterLink: user.twitterLink,
        facebookLink: user.facebookLink,
        instagramLink: user.instagramLink,
      );

      if (!mounted) return;

      if (result['success'] == true) {
        // Update the user model in provider so header and banner reflect the new avatar
        if (result['user'] != null) {
          final updatedUser = UserModel.fromJson(
            result['user'] as Map<String, dynamic>,
          );
          authProvider.updateUser(updatedUser);
        } else {
          await authProvider.refreshUser();
        }
        // Clear the pending file — the updated user.avatar is now the source of truth
        authProvider.clearPendingAvatar();
        setState(() {
          _pendingAvatarFile = null;
        });
        _showAvatarSnackBar('Avatar updated successfully!');
      } else {
        // Revert the preview on failure
        authProvider.clearPendingAvatar();
        setState(() {
          _pendingAvatarFile = null;
        });
        _showAvatarSnackBar(
          result['message'] as String? ?? 'Failed to update avatar',
          isError: true,
        );
      }
    } catch (e) {
      if (!mounted) return;
      authProvider.clearPendingAvatar();
      setState(() {
        _pendingAvatarFile = null;
      });
      _showAvatarSnackBar(
        e.toString().replaceAll('Exception: ', ''),
        isError: true,
      );
    }
  }

  void _showAvatarSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : AppTheme.accentColor,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Responsive sizes
    final headerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final horizontalPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final sidebarSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final bottomSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final bottomPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 80.0,
    ).clamp(60.0, 80.0);

    final breakpoint = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 600.0,
    ).clamp(500.0, 600.0);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverToBoxAdapter(child: SizedBox(height: headerHeight)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                  child: Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      final user = authProvider.user;

                      if (user == null) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      return Column(
                        children: [
                          // Profile Banner
                          ProfileBanner(
                            username: user.username,
                            avatar: user.avatar,
                            avatarPending: _pendingAvatarFile != null,
                            onSelectAvatar: _handleAvatarSelected,
                            isOwnProfile: true,
                            pendingAvatarFile: _pendingAvatarFile,
                            followers: user.followers ?? 0,
                            following: user.following ?? 0,
                            isPremium: user.isPremiumActive,
                          ),
                          Builder(
                            builder: (context) {
                              final screenWidth = MediaQuery.of(
                                context,
                              ).size.width;
                              final isSmallScreen = screenWidth < breakpoint;

                              if (isSmallScreen) {
                                // Vertical layout for small screens
                                return Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    ProfileSidebar(
                                      gamesPlayed: _gamesPlayed,
                                      totalKills: _totalKills,
                                      amountWon: _amountWon,
                                      activities: _activities,
                                      followers: user.followers ?? 0,
                                      following: user.following ?? 0,
                                      balance: user.balance,
                                      hideBalance: false,
                                    ),
                                    SizedBox(height: sidebarSpacing),
                                    ProfileContent(
                                      pendingAvatarFile: _pendingAvatarFile,
                                      onAvatarSaved: _handleAvatarSaved,
                                    ),
                                  ],
                                );
                              } else {
                                // Horizontal layout for larger screens
                                return Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Left Sidebar
                                    Expanded(
                                      flex: 1,
                                      child: ProfileSidebar(
                                        gamesPlayed: _gamesPlayed,
                                        totalKills: _totalKills,
                                        amountWon: _amountWon,
                                        activities: _activities,
                                        followers: user.followers ?? 0,
                                        following: user.following ?? 0,
                                        balance: user.balance,
                                        hideBalance: false,
                                      ),
                                    ),
                                    SizedBox(width: sidebarSpacing),

                                    // Right Content
                                    Expanded(
                                      flex: 2,
                                      child: ProfileContent(
                                        pendingAvatarFile: _pendingAvatarFile,
                                        onAvatarSaved: _handleAvatarSaved,
                                      ),
                                    ),
                                  ],
                                );
                              }
                            },
                          ),
                          SizedBox(height: bottomSpacing),
                        ],
                      );
                    },
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
}
