import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

const _rememberEmailKey = 'ba_remember_email';

class SignInScreen extends StatefulWidget {
  const SignInScreen({
    super.key,
    this.afterLoginScreen,
    this.titleKey = 'auth.signInTitle',
    this.descriptionKey = 'auth.signInDesc',
  });

  final Widget? afterLoginScreen;
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
  bool _rememberMe = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadRememberedEmail();
  }

  Future<void> _loadRememberedEmail() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_rememberEmailKey);
      if (!mounted || saved == null || saved.isEmpty) return;
      setState(() {
        _emailController.text = saved;
        _rememberMe = true;
      });
    } catch (_) {}
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _persistRememberedEmail(String email) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_rememberMe) {
        await prefs.setString(_rememberEmailKey, email);
      } else {
        await prefs.remove(_rememberEmailKey);
      }
    } catch (_) {}
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final email = _emailController.text.trim();
    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.signIn(
      email: email,
      password: _passwordController.text,
    );

    if (!mounted) return;

    if (result['success'] == true) {
      await _persistRememberedEmail(email);
      if (!mounted) return;
      if (result['emailVerificationRequired'] == true) {
        final verifyEmail = result['email'] as String? ?? email;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => EmailVerificationScreen(email: verifyEmail),
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

  void _comingSoon() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('auth.socialComingSoon'.tr()),
        backgroundColor: const Color(0xFF181614),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return AuthFormShell(
      title: widget.titleKey.tr(),
      description: widget.descriptionKey.tr(),
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
              controller: _emailController,
              label: 'auth.email'.tr(),
              hint: 'auth.emailPlaceholder'.tr(),
              keyboardType: TextInputType.emailAddress,
              prefixIcon: Icons.mail_outline,
              textInputAction: TextInputAction.next,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'auth.emailRequired'.tr();
                }
                if (!value.contains('@')) return 'auth.emailInvalid'.tr();
                return null;
              },
            ),
            const SizedBox(height: 14),
            AuthTextField(
              controller: _passwordController,
              label: 'auth.password'.tr(),
              hint: 'auth.passwordPlaceholder'.tr(),
              obscureText: _obscurePassword,
              prefixIcon: Icons.lock_outline,
              suffix: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: Colors.white,
                  size: 18,
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
            const SizedBox(height: 12),
            SizedBox(
              height: 22,
              child: Row(
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: Checkbox(
                      value: _rememberMe,
                      onChanged: (v) =>
                          setState(() => _rememberMe = v ?? false),
                      side: BorderSide(
                        color: AppColors.gold.withValues(alpha: 0.55),
                      ),
                      activeColor: AppColors.gold,
                      checkColor: const Color(0xFF111111),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'auth.rememberMe'.tr(),
                    style: const TextStyle(
                      color: Color(0xFFE0E0E0),
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const ForgotPasswordScreen(),
                        ),
                      );
                    },
                    child: Text(
                      'auth.forgotPassword'.tr(),
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.goldAccent,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                        height: 1,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            AuthPrimaryButton(
              label: 'auth.signIn'.tr(),
              icon: Icons.login_rounded,
              loading: authProvider.isLoading,
              onPressed: authProvider.isLoading ? null : _handleSignIn,
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 1,
                    color: Colors.white.withValues(alpha: 0.1),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text(
                    'auth.orContinueWith'.tr().toUpperCase(),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.42),
                      fontWeight: FontWeight.w700,
                      fontSize: 10,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    height: 1,
                    color: Colors.white.withValues(alpha: 0.1),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _SocialBtn(
                    label: 'auth.continueWithGoogle'.tr(),
                    onTap: _comingSoon,
                    child: const Icon(
                      Icons.g_mobiledata,
                      color: Colors.white,
                      size: 22,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _SocialBtn(
                    label: 'auth.continueWithDiscord'.tr(),
                    onTap: _comingSoon,
                    child: const Icon(
                      Icons.discord,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text.rich(
              TextSpan(
                text: '${'auth.dontHaveAccount'.tr()} ',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white.withValues(alpha: 0.5),
                  fontSize: 12.5,
                ),
                children: [
                  TextSpan(
                    text: 'auth.signUp'.tr(),
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.goldAccent,
                      fontWeight: FontWeight.w700,
                      fontSize: 12.5,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const SignUpScreen(),
                          ),
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

class _SocialBtn extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final Widget child;

  const _SocialBtn({
    required this.label,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.42),
      child: InkWell(
        onTap: onTap,
        child: Container(
          height: 44,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              child,
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 11.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
