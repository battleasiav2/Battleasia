import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_up_screen.dart';
import 'package:battleasia_app/presentation/screens/account/account_screen.dart';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'dart:convert';
import 'package:battleasia_app/core/config/app_config.dart';

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
  
  int _timeLeft = 900; // 15 minutes in seconds
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
          } else {
            _canResend = true;
            timer.cancel();
          }
        });
      }
    });
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString()}:${secs.toString().padLeft(2, '0')}';
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
          _timeLeft = 900;
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

  Future<void> _handleVerification() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

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
          'code': _codeController.text.trim(),
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
          
          // Save user data
          final userModel = await authService.getUser();
          if (userModel != null) {
            await authService.saveUser(userModel);
          }

          // Update AuthProvider
          if (mounted) {
            final authProvider =
                Provider.of<AuthProvider>(context, listen: false);
            await authProvider.refreshUser();

            // Navigate to account screen
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => const AccountScreen()),
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
                        'EMAIL VERIFICATION',
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
                        'We\'ve sent a 6-digit verification code to',
                        style: AppTheme.bodyMedium.copyWith(
                          fontSize: bodyFontSize,
                          color: Colors.white70,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.email,
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

                      // Verification Code Input
                      TextFormField(
                        controller: _codeController,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 8,
                        ),
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        decoration: InputDecoration(
                          labelText: 'Verification Code',
                          labelStyle: TextStyle(
                            color: Colors.white70,
                            fontSize: labelFontSize,
                          ),
                          hintText: '000000',
                          hintStyle: TextStyle(
                            color: Colors.white30,
                            letterSpacing: 8,
                          ),
                          counterText: '',
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.1),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: AppTheme.accentColor,
                              width: 1,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: Colors.white30,
                              width: 1,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: AppTheme.accentColor,
                              width: 2,
                            ),
                          ),
                          errorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: Colors.red,
                              width: 1,
                            ),
                          ),
                          focusedErrorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: Colors.red,
                              width: 2,
                            ),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Verification code is required';
                          }
                          if (value.trim().length != 6) {
                            return 'Code must be exactly 6 digits';
                          }
                          if (!RegExp(r'^[0-9]+$').hasMatch(value.trim())) {
                            return 'Code must contain only numbers';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Timer
                      Center(
                        child: Text(
                          _timeLeft > 0
                              ? 'Time remaining: ${_formatTime(_timeLeft)}'
                              : 'Code expired',
                          style: AppTheme.bodySmall.copyWith(
                            fontSize: labelFontSize,
                            color: _timeLeft > 0
                                ? Colors.white70
                                : Colors.red,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Verify Button
                      SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _handleVerification,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.accentColor,
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                          child: _isSubmitting
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.black),
                                  ),
                                )
                              : Text(
                                  'VERIFY EMAIL',
                                  style: AppTheme.bodyMedium.copyWith(
                                    fontSize: buttonFontSize,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black,
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
                                text: _canResend
                                    ? 'Resend Code'
                                    : 'Wait to resend',
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
