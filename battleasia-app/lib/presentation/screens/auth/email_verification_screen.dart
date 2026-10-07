import 'dart:async';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_up_screen.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/core/utils/api_client.dart';
import 'dart:convert';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/presentation/widgets/auth/otp_row.dart';

class EmailVerificationScreen extends StatefulWidget {
  final String email;

  const EmailVerificationScreen({
    super.key,
    required this.email,
  });

  @override
  State<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();

  String? _errorMessage;
  String? _successMessage;
  bool _isSubmitting = false;
  bool _isResending = false;
  
  int _timeLeft = 60;
  bool _canResend = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _codeController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_timeLeft > 0) {
            _timeLeft--;
            if (_timeLeft == 0) {
              _canResend = true;
              timer.cancel();
            }
          } else {
            _canResend = true;
            timer.cancel();
          }
        });
      }
    });
  }


  String _maskedEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2 || parts[0].isEmpty || parts[1].isEmpty) return email;
    return '${parts[0][0]}***@${parts[1]}';
  }

  Future<void> _handleResendCode() async {
    setState(() {
      _isResending = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final response = await ApiClient.post(
        Uri.parse('${AppConfig.serverUrl}/api/v2/users/resend-verification-code'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': widget.email}),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        setState(() {
          _successMessage = 'Verification code has been resent to your email!';
          _timeLeft = 60;
          _canResend = false;
        });
        _startTimer();
      } else {
        setState(() {
          _errorMessage = data['message'] as String? ?? 'Failed to resend code';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to resend code. Please try again.';
      });
    } finally {
      setState(() {
        _isResending = false;
      });
    }
  }

  Future<void> _handleVerification([String? nextCode]) async {
    final code = (nextCode ?? _codeController.text).trim();
    if (_isSubmitting) return;
    if (code.length != 6) {
      setState(() => _errorMessage = 'auth.otpError'.tr());
      return;
    }
    _isSubmitting = true;

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final response = await ApiClient.post(
        Uri.parse('${AppConfig.serverUrl}/api/v2/users/verify-email-signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': widget.email,
          'code': code,
        }),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 &&
          data['status'] == true &&
          data['emailVerified'] == true) {
        // Email verified successfully - now login
        final sessionData = data['session'] as Map<String, dynamic>?;
        final userData = data['user'] as Map<String, dynamic>?;

        if (sessionData != null &&
            sessionData['accessToken'] != null &&
            userData != null) {
          // Save session using AuthService
          final authService = AuthService();
          await authService.saveToken(sessionData['accessToken'] as String);
          await authService.saveUser(UserModel.fromJson(userData));

          if (mounted) {
            final authProvider =
                Provider.of<AuthProvider>(context, listen: false);
            await authProvider.refreshUser();

            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => const PlayScreen()),
              (route) => false,
            );
          }
        } else {
          setState(() {
            _errorMessage = 'Session or user data is missing from response';
          });
        }
      } else {
        setState(() {
          _errorMessage =
              data['message'] as String? ?? 'Invalid verification code';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Verification failed. Please try again.';
      });
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
    final isMobile = ResponsiveUtils.isMobile(context);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 40.0,
    );
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 20.0,
    );

    return Theme(
      data: Theme.of(context).copyWith(
        textSelectionTheme: TextSelectionThemeData(
          selectionColor: AppTheme.accentColor.withOpacity(0.3),
          selectionHandleColor: AppTheme.accentColor,
          cursorColor: AppTheme.accentColor,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.black,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 24.0 : 48.0,
                vertical: 24.0,
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Logo
                      const BattleAsiaLogo(
                        logoSize: 120,
                        showText: true,
                        alignment: MainAxisAlignment.center,
                      ),
                      const SizedBox(height: 40),

                      // Title
                      Text(
                        'auth.verifyTitle'.tr(),
                        style: AppTheme.heading1.copyWith(
                          fontSize: titleFontSize,
                          color: AppTheme.accentColor,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),

                      // Description
                      Text(
                        'auth.verifySub'.tr(),
                        style: AppTheme.bodyMedium.copyWith(
                          fontSize: bodyFontSize,
                          color: Colors.white70,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _maskedEmail(widget.email),
                        style: AppTheme.bodyMedium.copyWith(
                          fontSize: bodyFontSize,
                          color: AppTheme.accentColor,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Error or Success Message
                      if (_errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.2),
                            border: Border.all(color: Colors.red),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: AppTheme.bodySmall.copyWith(
                              color: Colors.red,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),

                      if (_successMessage != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.2),
                            border: Border.all(color: Colors.green),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _successMessage!,
                            style: AppTheme.bodySmall.copyWith(
                              color: Colors.green,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),

                      OtpRow(
                        disabled: _isSubmitting,
                        onChanged: (next) {
                          _codeController.text = next;
                          if (next.length == 6) {
                            _handleVerification(next);
                          }
                        },
                      ),
                      const SizedBox(height: 24),

                      // Verify Button
                      SizedBox(
                        height: 44,
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _handleVerification,
                          style: ElevatedButton.styleFrom(
                            elevation: 0,
                            foregroundColor: AppColors.goldInk,
                            disabledForegroundColor:
                                Colors.white.withValues(alpha: 0.32),
                            backgroundColor: AppTheme.accentColor,
                            disabledBackgroundColor:
                                Colors.white.withValues(alpha: 0.08),
                            side: BorderSide(
                              color: AppTheme.accentColor.withValues(alpha: 0.28),
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            textStyle: TextStyle(
                              fontSize: buttonFontSize,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.5,
                            ),
                          ),
                          child: _isSubmitting
                              ? SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.goldInk,
                                  ),
                                )
                              : Text(
                                  _isSubmitting ? 'auth.verifying'.tr() : 'auth.verifyBtn'.tr(),
                                  style: TextStyle(
                                    fontSize: buttonFontSize,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.5,
                                    color: AppColors.goldInk,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Resend Code
                      Center(
                        child: RichText(
                          text: TextSpan(
                            text: "Didn't receive the code? ",
                            style: AppTheme.bodySmall.copyWith(
                              fontSize: labelFontSize,
                              color: Colors.white70,
                            ),
                            children: [
                              TextSpan(
                                text: _timeLeft > 0
                                    ? '${'auth.resend'.tr()} ${_timeLeft}s'
                                    : 'auth.resend'.tr(),
                                style: AppTheme.bodySmall.copyWith(
                                  fontSize: labelFontSize,
                                  color: _canResend
                                      ? AppTheme.accentColor
                                      : Colors.white38,
                                  fontWeight: FontWeight.bold,
                                  decoration: _canResend
                                      ? TextDecoration.underline
                                      : TextDecoration.none,
                                ),
                                recognizer: _canResend && !_isResending
                                    ? (TapGestureRecognizer()
                                      ..onTap = _handleResendCode)
                                    : null,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          'assets/images/hero/auth-login.webp',
                          width: double.infinity,
                          fit: BoxFit.contain,
                          alignment: Alignment.center,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Back to Sign Up
                      Center(
                        child: RichText(
                          text: TextSpan(
                            text: 'Wrong email? ',
                            style: AppTheme.bodySmall.copyWith(
                              fontSize: labelFontSize,
                              color: Colors.white70,
                            ),
                            children: [
                              TextSpan(
                                text: 'Sign Up Again',
                                style: AppTheme.bodySmall.copyWith(
                                  fontSize: labelFontSize,
                                  color: AppTheme.accentColor,
                                  fontWeight: FontWeight.bold,
                                  decoration: TextDecoration.underline,
                                ),
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    Navigator.of(context).pushReplacement(
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const SignUpScreen(),
                                      ),
                                    );
                                  },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
