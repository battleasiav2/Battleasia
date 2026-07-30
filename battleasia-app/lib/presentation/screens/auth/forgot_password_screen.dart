import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/screens/auth/reset_password_screen.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });

    final result = await context.read<AuthProvider>().forgotPassword(
          _emailController.text.trim(),
        );

    if (!mounted) return;

    if (result['success'] == true) {
      setState(() {
        _successMessage =
            result['message'] as String? ?? 'Reset code sent to your email';
      });
      await Future<void>.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ResetPasswordScreen(
            email: _emailController.text.trim(),
          ),
        ),
      );
    } else {
      setState(() {
        _errorMessage = result['message'] as String? ?? 'Failed to send code';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthProvider>().isLoading;

    return AuthFormShell(
      title: 'Forgot password',
      description: 'Enter your email and we will send a reset code.',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 16),
            ],
            if (_successMessage != null) ...[
              AuthAlert(message: _successMessage!, type: AuthAlertType.success),
              const SizedBox(height: 16),
            ],
            AuthTextField(
              controller: _emailController,
              label: 'Email address',
              hint: 'Enter your email',
              keyboardType: TextInputType.emailAddress,
              validator: (v) =>
                  v == null || !v.contains('@') ? 'Enter a valid email' : null,
            ),
            const SizedBox(height: 20),
            GoldButton(
              label: 'Send reset code',
              loading: loading,
              onPressed: loading ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
