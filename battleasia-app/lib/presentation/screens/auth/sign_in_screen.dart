import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/data/models/session_model.dart';
import 'package:battleasia_app/data/models/user_model.dart';
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
const _rememberPasswordKey = 'ba_remember_password';
const _rememberFlagKey = 'ba_remember_me';

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
  bool _rememberMe = true;
  bool _socialBusy = false;
  int _socialGen = 0;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadRememberedCredentials();
  }

  Future<void> _loadRememberedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final remember = prefs.getBool(_rememberFlagKey) ?? true;
      final email = prefs.getString(_rememberEmailKey) ?? '';
      final password = prefs.getString(_rememberPasswordKey) ?? '';
      if (!mounted) return;
      setState(() {
        _rememberMe = remember;
        if (email.isNotEmpty) _emailController.text = email;
        if (password.isNotEmpty) _passwordController.text = password;
      });
    } catch (_) {}
  }

  @override
  void dispose() {
    _socialGen++;
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _persistRememberedCredentials(String email, String password) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_rememberFlagKey, _rememberMe);
      if (_rememberMe) {
        await prefs.setString(_rememberEmailKey, email);
        await prefs.setString(_rememberPasswordKey, password);
      } else {
        await prefs.remove(_rememberEmailKey);
        await prefs.remove(_rememberPasswordKey);
      }
    } catch (_) {}
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.signIn(
      email: email,
      password: password,
    );

    if (!mounted) return;

    if (result['success'] == true) {
      await _persistRememberedCredentials(email, password);
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

  Future<void> _handleSocial(String provider) async {
    if (_socialBusy) return;
    setState(() {
      _socialBusy = true;
      _errorMessage = null;
    });
    final gen = ++_socialGen;
    final authProvider = context.read<AuthProvider>();
    final start = await authProvider.startSocial(provider);
    if (!mounted || gen != _socialGen) return;
    final url = start['url'] as String?;
    final handoff = start['handoff'] as String?;
    if (start['success'] != true || url == null || handoff == null) {
      setState(() {
        _socialBusy = false;
        _errorMessage = start['message'] as String? ?? 'auth.oauthFailed'.tr();
      });
      return;
    }
    final opened = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!opened) {
      if (!mounted || gen != _socialGen) return;
      setState(() {
        _socialBusy = false;
        _errorMessage = 'auth.oauthFailed'.tr();
      });
      return;
    }
    if (mounted) {
      setState(() => _errorMessage = 'auth.socialFinish'.tr());
    }
    for (var i = 0; i < 90; i++) {
      await Future<void>.delayed(const Duration(seconds: 2));
      if (!mounted || gen != _socialGen) return;
      final poll = await authProvider.pollSocial(handoff);
      if (!mounted || gen != _socialGen) return;
      if (poll['pending'] == true) continue;
      setState(() => _socialBusy = false);
      if (poll['success'] == true && poll['session'] != null) {
        authProvider.adoptSocialSession(
          poll['user'] as UserModel?,
          poll['session'] as SessionModel,
        );
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
      setState(() => _errorMessage = poll['message'] as String? ?? 'auth.oauthFailed'.tr());
      return;
    }
    if (!mounted || gen != _socialGen) return;
    setState(() {
      _socialBusy = false;
      _errorMessage = 'auth.oauthFailed'.tr();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return AuthFormShell(
      heroAfter: true,
      title: widget.titleKey.tr(),
      description: 'auth.signInDescription'.tr(),
      child: AutofillGroup(
        child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 14),
            ],
            AuthTextField(
              controller: _emailController,
              label: 'auth.email'.tr(),
              hint: 'auth.emailPlaceholder'.tr(),
              keyboardType: TextInputType.emailAddress,
              prefixIcon: Icons.mail_outline,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.email, AutofillHints.username],
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'auth.emailRequired'.tr();
                }
                if (!value.contains('@')) return 'auth.emailInvalid'.tr();
                return null;
              },
            ),
            const SizedBox(height: 12),
            AuthTextField(
              controller: _passwordController,
              label: 'auth.password'.tr(),
              hint: 'auth.passwordPlaceholder'.tr(),
              obscureText: _obscurePassword,
              prefixIcon: Icons.lock_outline,
              autofillHints: const [AutofillHints.password],
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
            const SizedBox(height: 10),
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
            const SizedBox(height: 16),
            AuthPrimaryButton(
              label: 'auth.signIn'.tr(),
              loading: authProvider.isLoading,
              onPressed: authProvider.isLoading ? null : _handleSignIn,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.16))),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text(
                    'auth.orContinueWith'.tr(),
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                  ),
                ),
                Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.16))),
              ],
            ),
            const SizedBox(height: 12),
            _SocialButton(
              label: 'auth.continueWithGoogle'.tr(),
              icon: const _GoogleMark(),
              busy: _socialBusy,
              onPressed: () => _handleSocial('google'),
            ),
            const SizedBox(height: 10),
            _SocialButton(
              label: 'auth.continueWithDiscord'.tr(),
              icon: const _DiscordMark(),
              busy: _socialBusy,
              onPressed: () => _handleSocial('discord'),
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
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.label,
    required this.icon,
    required this.busy,
    required this.onPressed,
  });

  final String label;
  final Widget icon;
  final bool busy;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: OutlinedButton(
        onPressed: busy ? null : onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: BorderSide(color: Colors.white.withValues(alpha: 0.18)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}

class _GoogleMark extends StatelessWidget {
  const _GoogleMark();

  @override
  Widget build(BuildContext context) {
    return const CustomPaint(size: Size(18, 18), painter: _GooglePainter());
  }
}

class _GooglePainter extends CustomPainter {
  const _GooglePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * 0.2;
    final rect = Rect.fromLTWH(stroke / 2, stroke / 2, size.width - stroke, size.height - stroke);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt;
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(rect, -2.6, 1.7, false, paint);
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(rect, 1.6, 1.15, false, paint);
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(rect, 0.35, 1.25, false, paint);
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(rect, -1.15, 1.5, false, paint);
    paint.style = PaintingStyle.fill;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.48, size.height * 0.4, size.width * 0.5, stroke),
        Radius.circular(stroke / 2),
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _DiscordMark extends StatelessWidget {
  const _DiscordMark();

  @override
  Widget build(BuildContext context) {
    return const Icon(Icons.discord, color: Color(0xFF5865F2), size: 20);
  }
}
