import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/auth/email_verification_screen.dart';
import 'package:battleasia_app/presentation/screens/auth/forgot_password_screen.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_up_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({
    super.key,
    this.afterLoginScreen,
    this.titleKey = 'auth.signInTitle',
    this.descriptionKey = 'auth.signInDesc',
  });

  /// Where to go after a successful sign-in (defaults to Play).
  final Widget? afterLoginScreen;

  /// Optional i18n keys — shop flow uses [shop.signInTitle] / [shop.signInDesc].
  final String titleKey;
  final String descriptionKey;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.signIn(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) return;

    if (result['success'] == true) {
      if (result['emailVerificationRequired'] == true) {
        final email = result['email'] as String? ?? _emailController.text.trim();
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => EmailVerificationScreen(email: email),
          ),
        );
        return;
      }
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => widget.afterLoginScreen ?? const PlayScreen(),
        ),
      );
      return;
    }

    setState(() => _errorMessage = result['message'] ?? 'Sign in failed');
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return AuthFormShell(
      title: widget.titleKey.tr(),
      description: widget.descriptionKey.tr(),
      onHome: () => Navigator.of(context).maybePop(),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 20),
            ],
            AuthTextField(
              controller: _emailController,
              label: 'auth.email'.tr(),
              hint: 'auth.emailPlaceholder'.tr(),
              keyboardType: TextInputType.emailAddress,
              prefixIcon: Icons.mail_outline,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'auth.emailRequired'.tr();
                }
                if (!value.contains('@')) return 'auth.emailInvalid'.tr();
                return null;
              },
            ),
            const SizedBox(height: 18),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const ForgotPasswordScreen(),
                    ),
                  );
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'auth.forgotPassword'.tr(),
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.goldAccent,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            AuthTextField(
              controller: _passwordController,
              label: 'auth.password'.tr(),
              hint: 'auth.passwordPlaceholder'.tr(),
              obscureText: _obscurePassword,
              prefixIcon: Icons.lock_outline,
              suffix: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: Colors.white.withValues(alpha: 0.7),
                  size: 20,
                ),
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'auth.passwordRequired'.tr();
                }
                if (value.length < 6) {
                  return 'auth.passwordMin'.tr();
                }
                return null;
              },
            ),
            const SizedBox(height: 22),
            AuthPrimaryButton(
              label: 'auth.signIn'.tr(),
              icon: Icons.login_rounded,
              loading: authProvider.isLoading,
              onPressed: authProvider.isLoading ? null : _handleSignIn,
            ),
            const SizedBox(height: 18),
            Text.rich(
              TextSpan(
                text: '${'auth.dontHaveAccount'.tr()} ',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white.withValues(alpha: 0.5),
                  fontSize: 13,
                ),
                children: [
                  TextSpan(
                    text: 'auth.signUp'.tr(),
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.goldAccent,
                      fontWeight: FontWeight.w700,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const SignUpScreen()),
                        );
                      },
                  ),
                ],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
