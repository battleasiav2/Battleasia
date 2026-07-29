import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/image_utils.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';

class ProfileBanner extends StatelessWidget {
  final String username;
  final String? avatar;
  final bool avatarPending;
  final Function(File)? onSelectAvatar;
  final bool isOwnProfile;
  final File? pendingAvatarFile;
  final int followers;
  final int following;
  final bool isPremium;

  const ProfileBanner({
    super.key,
    required this.username,
    this.avatar,
    this.avatarPending = false,
    this.onSelectAvatar,
    this.isOwnProfile = true,
    this.pendingAvatarFile,
    this.followers = 0,
    this.following = 0,
    this.isPremium = false,
  });

  @override
  Widget build(BuildContext context) {
    // Show pending avatar file if available, otherwise use the avatar URL
    final String? displayAvatarUrl;
    if (pendingAvatarFile != null) {
      // Use the pending file for preview
      displayAvatarUrl = null; // Will use FileImage instead
    } else {
      final avatarUrl = ImageUtils.getImageUrl(avatar);
      displayAvatarUrl = avatarUrl != null && avatarUrl.isNotEmpty
          ? avatarUrl
          : null;
    }

    // Responsive sizes
    final bannerHeight = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 300.0,
    ).clamp(240.0, 300.0);

    final bannerBottomMargin = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(80.0, 100.0);

    final avatarSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 100.0,
    ).clamp(100.0, 120.0);

    final avatarBorderWidth = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    final avatarBottom = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: -60.0,
    ).clamp(-60.0, -50.0);

    final avatarLeft = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing32 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(24.0, 32.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final usernameFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 32.0,
      min: 24.0,
      max: 36.0,
    );

    final avatarInitialFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 48.0,
      min: 36.0,
      max: 54.0,
    );

    final buttonIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 18.0,
    ).clamp(16.0, 18.0);

    return Container(
      height: bannerHeight,
      margin: EdgeInsets.only(
        bottom: bannerBottomMargin,
      ), // Extra margin to accommodate overlapping avatar
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        image: const DecorationImage(
          image: AssetImage('assets/images/war2.webp'),
          fit: BoxFit.cover,
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none, // Allow overflow for overlapping avatar
        children: [
          // Profile Picture Overlapping
          Positioned(
            bottom: avatarBottom,
            left: avatarLeft,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  width: avatarSize,
                  height: avatarSize,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white,
                      width: avatarBorderWidth,
                    ),
                    color: AppTheme.primaryColor,
                  ),
                  child: pendingAvatarFile != null
                      ? ClipOval(
                          child: Image.file(
                            pendingAvatarFile!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Text(
                                  username.isNotEmpty
                                      ? username[0].toUpperCase()
                                      : 'U',
                                  style: AppTheme.heading2.copyWith(
                                    color: Colors.white,
                                    fontSize: avatarInitialFontSize,
                                  ),
                                ),
                              );
                            },
                          ),
                        )
                      : displayAvatarUrl != null
                      ? ClipOval(
                          child: ImageUtils.isBase64DataUri(displayAvatarUrl)
                              ? Builder(
                                  builder: (context) {
                                    final bytes = ImageUtils.decodeBase64DataUri(
                                      displayAvatarUrl!,
                                    );
                                    if (bytes == null) {
                                      return Center(
                                        child: Text(
                                          username.isNotEmpty
                                              ? username[0].toUpperCase()
                                              : 'U',
                                          style: AppTheme.heading2.copyWith(
                                            color: Colors.white,
                                            fontSize: avatarInitialFontSize,
                                          ),
                                        ),
                                      );
                                    }
                                    return Image.memory(
                                      bytes,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                            return Center(
                                              child: Text(
                                                username.isNotEmpty
                                                    ? username[0].toUpperCase()
                                                    : 'U',
                                                style: AppTheme.heading2
                                                    .copyWith(
                                                      color: Colors.white,
                                                      fontSize:
                                                          avatarInitialFontSize,
                                                    ),
                                              ),
                                            );
                                          },
                                    );
                                  },
                                )
                              : Image.network(
                                  displayAvatarUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Center(
                                      child: Text(
                                        username.isNotEmpty
                                            ? username[0].toUpperCase()
                                            : 'U',
                                        style: AppTheme.heading2.copyWith(
                                          color: Colors.white,
                                          fontSize: avatarInitialFontSize,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        )
                      : Center(
                          child: Text(
                            username.isNotEmpty
                                ? username[0].toUpperCase()
                                : 'U',
                            style: AppTheme.heading2.copyWith(
                              color: Colors.white,
                              fontSize: avatarInitialFontSize,
                            ),
                          ),
                        ),
                ),
                SizedBox(width: spacing16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          username,
                          style: AppTheme.heading2.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: usernameFontSize,
                            shadows: [
                              Shadow(
                                offset: const Offset(0, 2),
                                blurRadius: 4,
                                color: Colors.black.withOpacity(0.5),
                              ),
                            ],
                          ),
                        ),
                        if (isPremium) ...[
                          const SizedBox(width: 6),
                          const Icon(
                            Icons.workspace_premium,
                            color: Colors.amber,
                            size: 22,
                          ),
                        ],
                      ],
                    ),
                    if (isOwnProfile) ...[
                      ElevatedButton.icon(
                        onPressed: avatarPending
                            ? null
                            : () => _pickImage(context),
                        icon: Icon(Icons.edit, size: buttonIconSize),
                        label: Text(
                          avatarPending ? 'Avatar selected' : 'Change avatar',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: Colors.white,
                        ),
                      ),
                      // Social Stats
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          _buildSocialStatItem(
                            context: context,
                            icon: Icons.people,
                            label: 'Followers',
                            value: followers.toString(),
                          ),
                          SizedBox(width: spacing32),
                          _buildSocialStatItem(
                            context: context,
                            icon: Icons.person_add,
                            label: 'Following',
                            value: following.toString(),
                          ),
                        ],
                      ),
                    ],
                    SizedBox(height: spacing8),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickImage(BuildContext context) async {
    final ImagePicker picker = ImagePicker();

    // Show dialog to select image source
    final ImageSource? source = await showDialog<ImageSource>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(
          'Select Image Source',
          style: TextStyle(color: Colors.black, fontSize: 16.0),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library, color: Colors.black),
              title: const Text(
                'Gallery',
                style: TextStyle(color: Colors.black, fontSize: 16.0),
              ),
              onTap: () => Navigator.pop(context, ImageSource.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Colors.black),
              title: const Text(
                'Camera',
                style: TextStyle(color: Colors.black, fontSize: 16.0),
              ),
              onTap: () => Navigator.pop(context, ImageSource.camera),
            ),
          ],
        ),
      ),
    );

    if (source == null) return;

    try {
      final XFile? image = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null && onSelectAvatar != null) {
        final file = File(image.path);
        onSelectAvatar!(file);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error picking image: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildSocialStatItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
  }) {
    final iconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 20.0);

    final spacing4 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 4.0,
    ).clamp(3.0, 4.0);

    final valueFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 14.0,
      max: 20.0,
    );

    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Icon(icon, color: Colors.black87, size: iconSize),
            SizedBox(width: spacing4),
            Text(
              value,
              style: AppTheme.heading3.copyWith(
                color: Colors.black87,
                fontSize: valueFontSize,
                fontWeight: FontWeight.w600,
                shadows: [
                  Shadow(
                    offset: const Offset(0, 1),
                    blurRadius: 2,
                    color: Colors.black.withOpacity(0.8),
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: spacing4),
        Text(
          label,
          style: AppTheme.bodySmall.copyWith(
            color: Colors.black87,
            fontSize: labelFontSize,
            shadows: [
              Shadow(
                offset: const Offset(0, 1),
                blurRadius: 2,
                color: Colors.black.withOpacity(0.8),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
