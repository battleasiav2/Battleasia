import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String email;

  const ResetPasswordScreen({super.key, required this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscure = true;
  String? _errorMessage;

  @override
  void dispose() {
    _codeController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorMessage = null);

    final auth = context.read<AuthProvider>();
    final verify = await auth.verifyResetCode(
      email: widget.email,
      code: _codeController.text.trim(),
    );

    if (!mounted) return;
    if (verify['success'] != true && verify['codeValid'] != true) {
      setState(() {
        _errorMessage = verify['message'] as String? ?? 'Invalid or expired code';
      });
      return;
    }

    final reset = await auth.resetPassword(
      email: widget.email,
      code: _codeController.text.trim(),
      newPassword: _passwordController.text,
    );

    if (!mounted) return;
    if (reset['success'] == true) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const SignInScreen()),
        (_) => false,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password updated. Please sign in.')),
      );
      return;
    }

    setState(() {
      _errorMessage = reset['message'] as String? ?? 'Failed to reset password';
    });
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthProvider>().isLoading;

    return AuthFormShell(
      title: 'Reset password',
      description: 'Enter the code sent to ${widget.email}',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 16),
            ],
            AuthTextField(
              controller: _codeController,
              label: 'Reset code',
              hint: '6-digit code',
              keyboardType: TextInputType.number,
              validator: (v) =>
                  v == null || v.trim().length < 4 ? 'Enter the reset code' : null,
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: _passwordController,
              label: 'New password',
              hint: '8+ characters',
              obscureText: _obscure,
              validator: (v) =>
                  v == null || v.length < 8 ? 'Minimum 8 characters' : null,
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: _confirmController,
              label: 'Confirm password',
              obscureText: _obscure,
              validator: (v) {
                if (v != _passwordController.text) {
                  return 'Passwords do not match';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => setState(() => _obscure = !_obscure),
                child: Text(_obscure ? 'Show passwords' : 'Hide passwords'),
              ),
            ),
            const SizedBox(height: 8),
            GoldButton(
              label: 'Update password',
              loading: loading,
              onPressed: loading ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
