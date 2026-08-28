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
import 'package:battleasia_app/presentation/widgets/shop/shop_auth_gate.dart';

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
      if (widget.afterLoginScreen != null) {
        ShopAuthGate.markShopSessionActive();
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
      progress: 100,
      title: widget.titleKey.tr(),
      description: 'auth.signInDescription'.tr(),
      belowCard: _SignInSocialSection(onTap: _comingSoon),
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
                  color: const Color(0xFF9CA3AF),
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
                        color: AppColors.gold,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        height: 1,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            AuthPrimaryButton(
              label: 'auth.signIn'.tr(),
              loading: authProvider.isLoading,
              onPressed: authProvider.isLoading ? null : _handleSignIn,
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
                      color: AppColors.gold,
                      fontWeight: FontWeight.w700,
                      fontSize: 12.5,
                      decoration: TextDecoration.underline,
                      decorationColor: AppColors.gold,
                      decorationThickness: 1.5,
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

class _SignInSocialSection extends StatelessWidget {
  final VoidCallback onTap;

  const _SignInSocialSection({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
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
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 108,
              child: _SocialBtn(
                semanticsLabel: 'auth.continueWithGoogle'.tr(),
                onTap: onTap,
                child: const _GoogleLogoIcon(size: 18),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: 108,
              child: _SocialBtn(
                semanticsLabel: 'auth.continueWithDiscord'.tr(),
                onTap: onTap,
                child: const Icon(
                  Icons.discord,
                  color: Color(0xFF7289DA),
                  size: 18,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _SocialBtn extends StatelessWidget {
  final String semanticsLabel;
  final VoidCallback onTap;
  final Widget child;

  const _SocialBtn({
    required this.semanticsLabel,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticsLabel,
      child: Material(
        color: const Color(0xFF0E0E0E).withValues(alpha: 0.72),
        borderRadius: BorderRadius.zero,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Container(
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

class _GoogleLogoIcon extends StatelessWidget {
  final double size;

  const _GoogleLogoIcon({this.size = 22});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
        size: Size(size, size),
      ),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()..style = PaintingStyle.fill;

    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(rect, -1.5708, 1.5708, true, paint);

    paint.color = const Color(0xFF34A853);
    canvas.drawArc(rect, 0, 1.5708, true, paint);

    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(rect, 1.5708, 1.5708, true, paint);

    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(rect, 3.1416, 1.5708, true, paint);

    paint.color = Colors.white;
    canvas.drawCircle(Offset(size.width / 2, size.height / 2), size.width * 0.32, paint);

    paint.color = const Color(0xFF4285F4);
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.45, size.height * 0.42, size.width * 0.5, size.height * 0.16),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
