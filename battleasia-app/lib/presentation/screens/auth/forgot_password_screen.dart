import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/presentation/screens/auth/reset_password_screen.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';

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
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() {
        _errorMessage = email.isEmpty ? 'auth.emailRequired'.tr() : 'auth.emailInvalid'.tr();
      });
      return;
    }
    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });

    final result = await context.read<AuthProvider>().forgotPassword(email);

    if (!mounted) return;

    if (result['success'] == true) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ResetPasswordScreen(email: email),
        ),
      );
    } else {
      setState(() {
        _errorMessage = result['message'] as String? ?? 'auth.sendFail'.tr();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthProvider>().isLoading;

    return AuthFormShell(
      title: 'auth.forgotPassword'.tr(),
      description: 'auth.forgotSub'.tr(),
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
              label: 'auth.email'.tr(),
              hint: 'auth.emailPlaceholder'.tr(),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),
            AuthPrimaryButton(
              label: loading ? 'auth.sending'.tr() : 'auth.sendCode'.tr(),
              loading: loading,
              onPressed: loading ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
