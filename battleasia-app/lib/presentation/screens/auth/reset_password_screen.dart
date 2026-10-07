import 'dart:async';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/auth/forgot_password_screen.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';
import 'package:battleasia_app/presentation/widgets/auth/otp_row.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String email;

  const ResetPasswordScreen({super.key, required this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  String _code = '';
  bool _obscure = true;
  String? _errorMessage;
  int _seconds = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(() {
      if (mounted) setState(() {});
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_seconds > 0) _seconds--;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  int _scorePassword(String value) {
    if (value.isEmpty) return 0;
    var score = 1;
    if (value.length >= 8) score += 1;
    if (RegExp(r'[A-Z]').hasMatch(value) && RegExp(r'[a-z]').hasMatch(value)) score += 1;
    if (RegExp(r'\d').hasMatch(value) && RegExp(r'[^A-Za-z0-9]').hasMatch(value)) score += 1;
    return score > 4 ? 4 : score;
  }

  Future<void> _submit() async {
    final password = _passwordController.text;
    if (_code.length != 6) {
      setState(() => _errorMessage = 'auth.otpError'.tr());
      return;
    }
    if (password.length < 8) {
      setState(() => _errorMessage = 'auth.min8'.tr());
      return;
    }
    if (password != _confirmController.text) {
      setState(() => _errorMessage = 'auth.passwordMismatch'.tr());
      return;
    }
    setState(() => _errorMessage = null);

    final reset = await context.read<AuthProvider>().resetPassword(
          email: widget.email.trim(),
          code: _code,
          newPassword: password,
        );

    if (!mounted) return;
    if (reset['success'] == true) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const SignInScreen()),
        (_) => false,
      );
      return;
    }

    setState(() {
      _errorMessage = reset['message'] as String? ?? 'auth.otpError'.tr();
    });
  }

  Future<void> _resend() async {
    if (_seconds > 0) return;
    final result = await context.read<AuthProvider>().forgotPassword(widget.email.trim());
    if (!mounted) return;
    if (result['success'] == true) {
      setState(() {
        _seconds = 60;
        _errorMessage = null;
      });
      return;
    }
    setState(() {
      _errorMessage = result['message'] as String? ?? 'auth.sendFail'.tr();
    });
  }

  Widget _meter() {
    final value = _passwordController.text;
    if (value.isEmpty) return const SizedBox.shrink();
    final score = _scorePassword(value);
    final labels = [
      'auth.pwWeak'.tr(),
      'auth.pwWeak'.tr(),
      'auth.pwFair'.tr(),
      'auth.pwGood'.tr(),
      'auth.pwStrong'.tr(),
    ];
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        children: [
          for (var n = 1; n <= 4; n++)
            Container(
              width: 28,
              height: 4,
              margin: const EdgeInsets.only(right: 4),
              color: n <= score ? AppColors.gold : Colors.white24,
            ),
          Text(labels[score], style: AppTheme.bodySmall.copyWith(color: Colors.white70)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthProvider>().isLoading;

    if (widget.email.trim().isEmpty) {
      return AuthFormShell(
        title: 'auth.resetTitle'.tr(),
        description: 'auth.resetNeed'.tr(),
        child: AuthPrimaryButton(
          label: 'auth.sendCode'.tr(),
          onPressed: () {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
            );
          },
        ),
      );
    }

    return AuthFormShell(
      title: 'auth.resetTitle'.tr(),
      description: 'auth.resetSub'.tr(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_errorMessage != null) ...[
            AuthAlert(message: _errorMessage!),
            const SizedBox(height: 16),
          ],
          OtpRow(
            disabled: loading,
            onChanged: (next) => setState(() => _code = next),
          ),
          const SizedBox(height: 16),
          AuthTextField(
            controller: _passwordController,
            label: 'auth.newPassword'.tr(),
            hint: 'auth.passwordMin8'.tr(),
            obscureText: _obscure,
            autofillHints: const [AutofillHints.newPassword],
          ),
          _meter(),
          const SizedBox(height: 16),
          AuthTextField(
            controller: _confirmController,
            label: 'auth.confirmPassword'.tr(),
            obscureText: _obscure,
            autofillHints: const [AutofillHints.newPassword],
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => setState(() => _obscure = !_obscure),
              child: Text(_obscure ? 'Show passwords' : 'Hide passwords'),
            ),
          ),
          AuthPrimaryButton(
            label: loading ? 'auth.sending'.tr() : 'auth.resetTitle'.tr(),
            loading: loading,
            onPressed: loading ? null : _submit,
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: loading || _seconds > 0 ? null : _resend,
            child: Text(
              _seconds > 0 ? '${'auth.resend'.tr()} ${_seconds}s' : 'auth.resend'.tr(),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const SignInScreen()),
              );
            },
            child: Text('auth.back'.tr()),
          ),
        ],
      ),
    );
  }
}
