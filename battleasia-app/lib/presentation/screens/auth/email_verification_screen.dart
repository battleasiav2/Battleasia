import 'dart:async';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/otp_row.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_up_screen.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
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
          await authService.storeSessionTokens(sessionData);
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
    return AuthFormShell(
      title: 'auth.verifyTitle'.tr(),
      description: '${'auth.verifySub'.tr()} ${_maskedEmail(widget.email)}',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 14),
            ],
            if (_successMessage != null) ...[
              AuthAlert(message: _successMessage!, type: AuthAlertType.success),
              const SizedBox(height: 14),
            ],
            OtpRow(
              disabled: _isSubmitting,
              onChanged: (next) {
                _codeController.text = next;
                if (next.length == 6) {
                  _handleVerification(next);
                }
              },
            ),
            const SizedBox(height: 18),
            AuthPrimaryButton(
              label: 'auth.verifyBtn'.tr(),
              loading: _isSubmitting,
              onPressed: _isSubmitting ? null : () => _handleVerification(),
            ),
            const SizedBox(height: 16),
            Center(
              child: RichText(
                text: TextSpan(
                  text: "Didn't receive the code? ",
                  style: AppTheme.bodySmall.copyWith(color: Colors.white70, fontSize: 13),
                  children: [
                    TextSpan(
                      text: _timeLeft > 0 ? '${'auth.resend'.tr()} ${_timeLeft}s' : 'auth.resend'.tr(),
                      style: TextStyle(
                        fontSize: 13,
                        color: _canResend ? AppTheme.accentColor : Colors.white38,
                        fontWeight: FontWeight.w600,
                      ),
                      recognizer: _canResend && !_isResending
                          ? (TapGestureRecognizer()..onTap = _handleResendCode)
                          : null,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const SignUpScreen()),
                  );
                },
                child: Text(
                  'Sign Up Again',
                  style: TextStyle(color: AppTheme.accentColor, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
