import 'dart:io';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/feed_service.dart';
import 'package:battleasia_app/core/services/user_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/utils/phone_parser.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/data/models/user_model.dart';

class ProfileContent extends StatefulWidget {
  final File? pendingAvatarFile;
  final VoidCallback? onAvatarSaved;

  const ProfileContent({super.key, this.pendingAvatarFile, this.onAvatarSaved});

  @override
  State<ProfileContent> createState() => _ProfileContentState();
}

class _ProfileContentState extends State<ProfileContent> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _pubgIdController = TextEditingController();
  final _referralCodeController = TextEditingController();
  final _twitterLinkController = TextEditingController();
  final _facebookLinkController = TextEditingController();
  final _instagramLinkController = TextEditingController();
  final _bioController = TextEditingController();

  String? _countryCode;
  String? _phoneNumber;
  String? _selectedGameServer;
  String _baseUsername = '';
  String _baseEmail = '';
  String _basePubg = '';
  String _baseReferral = '';
  String _baseTwitter = '';
  String _baseFacebook = '';
  String _baseInstagram = '';
  String _baseBio = '';
  String? _baseServer;
  String? _basePhone;
  String? _baseCountry;
  bool _isSubmitting = false;
  String? _errorMessage;
  // Premium state
  bool _premiumLoading = false;
  int _premiumDuration = 0;
  int _premiumPrice = 0;
  bool _premiumDialogOpen = false;
  bool _watchDirty = false;

  @override
  void initState() {
    super.initState();
    for (final controller in [
      _usernameController,
      _emailController,
      _pubgIdController,
      _referralCodeController,
      _twitterLinkController,
      _facebookLinkController,
      _instagramLinkController,
      _bioController,
    ]) {
      controller.addListener(_touch);
    }
    _loadUserData();
    _watchDirty = true;
    _loadPremiumDetails();
  }

  void _touch() {
    if (!_watchDirty || !mounted) return;
    setState(() {});
  }

  void _captureBaseline() {
    _baseUsername = _usernameController.text;
    _baseEmail = _emailController.text;
    _basePubg = _pubgIdController.text;
    _baseReferral = _referralCodeController.text;
    _baseTwitter = _twitterLinkController.text;
    _baseFacebook = _facebookLinkController.text;
    _baseInstagram = _instagramLinkController.text;
    _baseBio = _bioController.text;
    _baseServer = _selectedGameServer;
    _basePhone = _phoneNumber;
    _baseCountry = _countryCode;
  }

  bool get _dirty {
    return _usernameController.text != _baseUsername ||
        _emailController.text != _baseEmail ||
        _pubgIdController.text != _basePubg ||
        _referralCodeController.text != _baseReferral ||
        _twitterLinkController.text != _baseTwitter ||
        _facebookLinkController.text != _baseFacebook ||
        _instagramLinkController.text != _baseInstagram ||
        _bioController.text != _baseBio ||
        _selectedGameServer != _baseServer ||
        _phoneNumber != _basePhone ||
        _countryCode != _baseCountry ||
        widget.pendingAvatarFile != null;
  }

  Future<void> _loadPremiumDetails() async {
    try {
      final userService = UserService();
      final result = await userService.getPremiumDetails();
      if (result['success'] == true && mounted) {
        setState(() {
          _premiumDuration = (result['premiumDuration'] as num?)?.toInt() ?? 30;
          _premiumPrice = (result['premiumPrice'] as num?)?.toInt() ?? 400;
        });
      }
    } catch (_) {}
  }

  Future<void> _handleActivatePremium() async {
    setState(() {
      _premiumLoading = true;
    });
    try {
      final userService = UserService();
      final result = await userService.activatePremium();
      if (result['success'] == true) {
        // Update user in provider with fresh data
        if (result['user'] != null && mounted) {
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          final updatedUser = UserModel.fromJson(
            result['user'] as Map<String, dynamic>,
          );
          authProvider.updateUser(updatedUser);
        }
        if (mounted) {
          setState(() => _premiumDialogOpen = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Premium membership activated!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                result['message'] as String? ?? 'Failed to activate premium',
              ),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _premiumLoading = false);
    }
  }

  void _showPremiumDialog(BuildContext context) {
    // Reset flag immediately so it doesn't re-trigger
    setState(() => _premiumDialogOpen = false);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isPremiumActive = authProvider.user?.isPremiumActive ?? false;

    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          isPremiumActive ? 'Extend Premium' : 'Activate Premium',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Payment confirmation message — mirrors web: premiumPaymentConfirm
            Text(
              'Confirm a payment to enable premium membership for $_premiumDuration days. You can extend it anytime.',
              style: const TextStyle(
                color: Colors.black87,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            // Price row — mirrors web: price: X BAC
            Row(
              children: [
                const Text(
                  'Price: ',
                  style: TextStyle(color: Colors.black54, fontSize: 15),
                ),
                Text(
                  '$_premiumPrice BAC',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(
              'Cancel',
              style: TextStyle(color: Colors.black54),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _handleActivatePremium();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            child: Text(
              'Confirm',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _loadUserData() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;

    if (user != null) {
      _usernameController.text = user.username;
      _emailController.text = user.email;
      _pubgIdController.text = user.pubgId ?? '';
      _referralCodeController.text = user.referralCode ?? '';
      _twitterLinkController.text = user.twitterLink ?? '';
      _facebookLinkController.text = user.facebookLink ?? '';
      _instagramLinkController.text = user.instagramLink ?? '';
      _bioController.text = user.bio ?? '';
      _selectedGameServer = user.gameServer;
      if (user.countryCode != null) {
        _countryCode = user.countryCode;
      }
      if (user.mobileNo != null) {
        _phoneNumber = user.mobileNo;
      }
      _captureBaseline();
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _pubgIdController.dispose();
    _referralCodeController.dispose();
    _twitterLinkController.dispose();
    _facebookLinkController.dispose();
    _instagramLinkController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  String? _optionalUrl(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return null;
    if (!RegExp(r'^https?://.+', caseSensitive: false).hasMatch(text)) {
      return 'profile.linkInvalid'.tr();
    }
    return null;
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Validation Failed'),
            content: const Text(
              'Please fill in all required fields correctly.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text('OK'),
              ),
            ],
          ),
        );
      }
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final userService = UserService();
      String? avatarUrl;
      String? avatarUploadError;

      // Website uploads the file, then stores the public https URL.
      // A data: URI is dropped by the API and would clear the photo.
      if (widget.pendingAvatarFile != null) {
        try {
          if (await widget.pendingAvatarFile!.exists()) {
            final uploaded = await FeedService().uploadMedia(
              widget.pendingAvatarFile!.path,
              folder: 'avatars',
            );
            final raw = uploaded['success'] == true
                ? ((uploaded['data'] as Map?)?['url']?.toString() ?? '')
                : '';
            final absolute = AppConfig.getImageUrl(raw);
            if (absolute != null &&
                (absolute.startsWith('https://') || absolute.startsWith('http://'))) {
              avatarUrl = absolute;
            } else {
              final message = uploaded['message']?.toString() ?? '';
              avatarUploadError = message.isEmpty ? 'profile.photoFail'.tr() : message;
            }
          } else {
            avatarUploadError = 'profile.photoFail'.tr();
          }
        } catch (_) {
          avatarUploadError = 'profile.photoFail'.tr();
        }
      }

      // Update profile (even if avatar upload failed)
      final result = await userService.updateProfile(
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        countryCode: _countryCode,
        mobileNo: _phoneNumber,
        pubgId: _pubgIdController.text.trim(),
        gameServer: _selectedGameServer,
        referralCode: _referralCodeController.text.trim().isEmpty
            ? null
            : _referralCodeController.text.trim(),
        avatar: avatarUrl,
        twitterLink: _twitterLinkController.text.trim().isEmpty
            ? null
            : _twitterLinkController.text.trim(),
        facebookLink: _facebookLinkController.text.trim().isEmpty
            ? null
            : _facebookLinkController.text.trim(),
        instagramLink: _instagramLinkController.text.trim().isEmpty
            ? null
            : _instagramLinkController.text.trim(),
        bio: _bioController.text
            .replaceAll(RegExp(r'[\u0000-\u001F\u007F]'), '')
            .replaceAll(RegExp(r'\s+'), ' ')
            .trim(),
      );

      if (!result['success']) {
        throw Exception(result['message'] ?? 'profile.saveFail'.tr());
      }

      // Update user in auth provider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (result['user'] != null) {
        final userData = result['user'] as Map<String, dynamic>;
        final updatedUser = UserModel.fromJson(userData);
        authProvider.updateUser(updatedUser);
      } else {
        await authProvider.refreshUser();
      }

      if (widget.pendingAvatarFile != null && avatarUrl != null) {
        widget.onAvatarSaved?.call();
      }
      _captureBaseline();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              avatarUploadError ??
                  (avatarUrl != null ? 'profile.photoOk'.tr() : 'profile.saved'.tr()),
            ),
            backgroundColor: avatarUploadError != null
                ? Colors.orange
                : AppTheme.accentColor,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      final raw = e.toString().replaceAll('Exception: ', '').trim();
      setState(() {
        _errorMessage = raw.isEmpty ? 'profile.saveFail'.tr() : raw;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_errorMessage ?? 'profile.saveFail'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Responsive sizes
    final cardPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 32.0,
    ).clamp(16.0, 32.0);

    final spacing8 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final spacing16 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final spacing24 = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 24.0,
    ).clamp(16.0, 24.0);

    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 24.0,
      min: 20.0,
      max: 28.0,
    );

    final subtitleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final errorPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 12.0,
    ).clamp(8.0, 12.0);

    final errorIconSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 20.0);

    final errorSpacing = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 8.0,
    ).clamp(6.0, 8.0);

    final errorFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final inputFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );

    final buttonPadding = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 16.0,
    ).clamp(12.0, 16.0);

    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
      min: 14.0,
      max: 18.0,
    );

    final loadingIndicatorSize = ResponsiveUtils.getResponsiveSpacing(
      context,
      baseSize: 20.0,
    ).clamp(18.0, 20.0);

    return PopScope(
      canPop: !_dirty,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop || !_dirty) return;
        final navigator = Navigator.of(context);
        final discard = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            content: Text('profile.unsaved'.tr()),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('common.cancel'.tr())),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('common.confirm'.tr())),
            ],
          ),
        );
        if (discard == true && mounted) navigator.pop();
      },
      child: Card(
      color: AppTheme.surfaceColor,
      child: Padding(
        padding: EdgeInsets.all(cardPadding),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // ─── Premium Membership Section ───────────────────────────
                Consumer<AuthProvider>(
                  builder: (context, authProvider, _) {
                    final user = authProvider.user;
                    final isPremiumActive = user?.isPremiumActive ?? false;
                    final expiresAt = user?.premiumExpiresAt;
                    String? expiryText;
                    if (isPremiumActive && expiresAt != null) {
                      try {
                        final dt = DateTime.parse(expiresAt).toLocal();
                        expiryText =
                            'Expires: ${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
                      } catch (_) {}
                    }

                    return Container(
                      padding: EdgeInsets.all(spacing16),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppTheme.primaryColor.withOpacity(0.4),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title row: icon + full title text
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.workspace_premium,
                                color: Colors.amber,
                                size: 22,
                              ),
                              SizedBox(width: spacing8),
                              Text(
                                'Premium Membership',
                                style: AppTheme.heading3.copyWith(
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.w700,
                                  fontSize: (titleFontSize * 0.82).clamp(13.0, 17.0),
                                ),
                              ),
                            ],
                          ),
                          // Status chip row: right-aligned
                          Align(
                            alignment: Alignment.centerRight,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: isPremiumActive
                                    ? Colors.green
                                    : Colors.grey,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                isPremiumActive ? 'Active' : 'Inactive',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: spacing8),
                          Text(
                            'Unlock exclusive tournaments, premium badge, and early access to events.',
                            style: AppTheme.bodySmall.copyWith(
                              color: AppTheme.textSecondary,
                              fontSize: subtitleFontSize,
                            ),
                          ),
                          SizedBox(height: spacing8),
                          Text(
                            '• Premium badge on your profile',
                            style: AppTheme.bodySmall.copyWith(fontSize: subtitleFontSize),
                          ),
                          Text(
                            '• Early access to exclusive events',
                            style: AppTheme.bodySmall.copyWith(fontSize: subtitleFontSize),
                          ),
                          Text(
                            '• Access to premium-only matches',
                            style: AppTheme.bodySmall.copyWith(fontSize: subtitleFontSize),
                          ),
                          if (isPremiumActive && expiryText != null) ...[
                            SizedBox(height: spacing8),
                            Text(
                              expiryText,
                              style: AppTheme.bodySmall.copyWith(
                                color: Colors.green,
                                fontWeight: FontWeight.w600,
                                fontSize: subtitleFontSize,
                              ),
                            ),
                          ],
                          SizedBox(height: spacing16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _premiumLoading
                                  ? null
                                  : () => setState(
                                      () => _premiumDialogOpen = true,
                                    ),
                              icon: _premiumLoading
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.workspace_premium, size: 18),
                              label: Text(
                                isPremiumActive
                                    ? 'Extend Premium'
                                    : 'Get Premium',
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isPremiumActive
                                    ? Colors.deepPurple
                                    : AppTheme.primaryColor,
                                foregroundColor: Colors.white,
                                padding: EdgeInsets.symmetric(
                                  vertical: spacing16 * 0.75,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
                SizedBox(height: spacing24),

                // ─── Premium Confirmation Dialog ──────────────────────────
                if (_premiumDialogOpen)
                  Builder(builder: (context) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (_premiumDialogOpen && mounted) {
                        _showPremiumDialog(context);
                      }
                    });
                    return const SizedBox.shrink();
                  }),

                // ─── Edit Profile Section ──────────────────────────────────
                Text(
                  'Edit Profile',
                  style: AppTheme.heading2.copyWith(fontSize: titleFontSize),
                ),
                SizedBox(height: spacing8),
                Text(
                  'Update your profile information below',
                  style: AppTheme.bodySmall.copyWith(
                    fontSize: subtitleFontSize,
                  ),
                ),
                SizedBox(height: spacing24),
                if (_errorMessage != null) ...[
                  Container(
                    padding: EdgeInsets.all(errorPadding),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.error,
                          color: Colors.red,
                          size: errorIconSize,
                        ),
                        SizedBox(width: errorSpacing),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: AppTheme.bodySmall.copyWith(
                              color: Colors.red,
                              fontSize: errorFontSize,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: spacing16),
                ],
                Text(
                  'In Game User Name',
                  style: TextStyle(color: Colors.blueGrey, fontSize: labelFontSize),
                ),
                SizedBox(height: spacing8),
                InputDecorator(
                  decoration: InputDecoration(
                    helperText: 'profile.usernameHint'.tr(),
                    helperMaxLines: 2,
                    filled: true,
                    fillColor: Colors.white.withValues(alpha: 0.06),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.blueGrey, width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.blueGrey, width: 1),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: spacing16,
                      vertical: spacing16,
                    ),
                  ),
                  child: Text(
                    _usernameController.text,
                    style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                  ),
                ),
                SizedBox(height: spacing16),

                // Mobile No with Country Code
                Builder(
                  builder: (context) {
                    final countryNameFontSize =
                        ResponsiveUtils.getResponsiveFontSize(
                          context,
                          baseSize: 14.0,
                          min: 12.0,
                          max: 16.0,
                        );

                    final countryCodeFontSize =
                        ResponsiveUtils.getResponsiveFontSize(
                          context,
                          baseSize: 14.0,
                          min: 12.0,
                          max: 16.0,
                        );

                    final searchFontSize =
                        ResponsiveUtils.getResponsiveFontSize(
                          context,
                          baseSize: 14.0,
                          min: 12.0,
                          max: 16.0,
                        );

                    return Theme(
                      data: Theme.of(context).copyWith(
                        dialogTheme: DialogThemeData(
                          backgroundColor: AppTheme.backgroundColor,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        textTheme: TextTheme(
                          bodyLarge: TextStyle(
                            color: Colors.black,
                            fontSize: countryNameFontSize,
                          ),
                          bodyMedium: TextStyle(
                            color: Colors.black,
                            fontSize: countryCodeFontSize,
                          ),
                          bodySmall: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                          titleMedium: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                          titleSmall: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                          labelLarge: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                          labelMedium: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                          labelSmall: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                        ),
                        inputDecorationTheme: InputDecorationTheme(
                          hintStyle: TextStyle(
                            color: Colors.grey,
                            fontSize: searchFontSize,
                          ),
                          labelStyle: TextStyle(
                            color: Colors.black,
                            fontSize: searchFontSize,
                          ),
                        ),
                        listTileTheme: ListTileThemeData(
                          textColor: Colors.black,
                          titleTextStyle: TextStyle(
                            color: Colors.black,
                            fontSize: countryNameFontSize,
                          ),
                          subtitleTextStyle: TextStyle(
                            color: Colors.black,
                            fontSize: countryCodeFontSize,
                          ),
                        ),
                      ),
                      child: IntlPhoneField(
                        initialValue: _phoneNumber ?? '',
                        initialCountryCode:
                            PhoneParser.dialCodeToIso(_countryCode) ?? 'US',
                        decoration: InputDecoration(
                          labelText: 'Mobile No *',
                          labelStyle: TextStyle(
                            color: Colors.blueGrey,
                            fontSize: labelFontSize,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Colors.blueGrey,
                              width: 1,
                            ),
                          ),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.1),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Colors.blueGrey,
                              width: 1,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(
                        color: AppTheme.accentColor,
                              width: 1,
                            ),
                          ),
                          disabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Colors.blueGrey,
                              width: 1,
                            ),
                          ),
                          errorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Colors.red,
                              width: 1,
                            ),
                          ),
                          focusedErrorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Colors.red,
                              width: 1,
                            ),
                          ),
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: spacing16,
                            vertical: spacing16,
                          ),
                        ),
                        style: AppTheme.bodyMedium.copyWith(
                          fontSize: inputFontSize,
                        ),
                        onChanged: (phone) {
                          // Store dial code as digits only (e.g. "381"), matching the DB format
                          _countryCode = phone.countryCode.replaceAll('+', '');
                          _phoneNumber = phone.number;
                        },
                        validator: (phone) {
                          if (phone == null || phone.number.isEmpty) {
                            return 'Mobile number is required';
                          }
                          return null;
                        },
                      ),
                    );
                  },
                ),
                SizedBox(height: spacing16),

                // PUBG ID
                TextFormField(
                  controller: _pubgIdController,
                  decoration: InputDecoration(
                    labelText: 'Enter your PUBG ID *',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: spacing16,
                      vertical: spacing16,
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'PUBG ID is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Game Server
                DropdownButtonFormField<String>(
                  value: _selectedGameServer,
                  decoration: InputDecoration(
                    labelText: 'Game Server *',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                  items: AppConstants.gameServers
                      .map(
                        (server) => DropdownMenuItem(
                          value: server['value'] as String,
                          child: Text(server['label'] as String),
                        ),
                      )
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedGameServer = value;
                    });
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Game Server is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Email (disabled)
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    labelText: 'Email *',
                    helperText: 'profile.emailLocked'.tr(),
                    helperStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                  enabled: false,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Email is required';
                    }
                    if (!value.contains('@')) {
                      return 'Email must be a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: _bioController,
                  maxLength: 160,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'profile.bio'.tr(),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.blueGrey, width: 1),
                    ),
                    labelStyle: TextStyle(color: Colors.blueGrey, fontSize: labelFontSize),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.blueGrey, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: AppTheme.accentColor, width: 1),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Referral Code (optional)
                TextFormField(
                  controller: _referralCodeController,
                  decoration: InputDecoration(
                    labelText: 'Referral Code (optional)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: spacing16,
                      vertical: spacing16,
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                ),
                SizedBox(height: spacing16),

                // Social Media Links (optional)
                TextFormField(
                  controller: _twitterLinkController,
                  validator: _optionalUrl,
                  decoration: InputDecoration(
                    labelText: 'Twitter Link (optional)',
                    hintText: 'https://twitter.com/username',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: spacing16,
                      vertical: spacing16,
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                ),
                SizedBox(height: spacing16),
                TextFormField(
                  controller: _facebookLinkController,
                  validator: _optionalUrl,
                  decoration: InputDecoration(
                    labelText: 'Facebook Link (optional)',
                    hintText: 'https://facebook.com/username',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: spacing16,
                      vertical: spacing16,
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                ),
                SizedBox(height: spacing16),
                TextFormField(
                  controller: _instagramLinkController,
                  validator: _optionalUrl,
                  decoration: InputDecoration(
                    labelText: 'Instagram Link (optional)',
                    hintText: 'https://instagram.com/username',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: Colors.blueGrey,
                      fontSize: labelFontSize,
                    ),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: AppTheme.accentColor,
                        width: 1,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                        color: Colors.blueGrey,
                        width: 1,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Colors.red, width: 1),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: spacing16,
                      vertical: spacing16,
                    ),
                  ),
                  style: AppTheme.bodyMedium.copyWith(fontSize: inputFontSize),
                ),
                SizedBox(height: spacing24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      padding: EdgeInsets.symmetric(vertical: buttonPadding),
                    ),
                    child: _isSubmitting
                        ? SizedBox(
                            width: loadingIndicatorSize,
                            height: loadingIndicatorSize,
                            child: const CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : Text(
                            'Save Changes',
                            style: AppTheme.bodyLarge.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: buttonFontSize,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      ),
    );
  }
}
