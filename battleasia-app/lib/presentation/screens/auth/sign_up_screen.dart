import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/presentation/screens/auth/email_verification_screen.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/play/play_screen.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_alert.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_form_shell.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_phone_field.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';
import 'package:battleasia_app/presentation/widgets/common/gold_button.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _inGameUserNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _pubgIdController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String? _errorMessage;
  String? _selectedGameServer;
  String? _countryCode = '+880';
  String? _phoneNumber;

  @override
  void dispose() {
    _inGameUserNameController.dispose();
    _phoneController.dispose();
    _pubgIdController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    if (_phoneController.text.trim().isNotEmpty) {
      if (_countryCode == null || _countryCode!.isEmpty) {
        setState(() => _errorMessage = 'Please select a country code');
        return;
      }
      if (_phoneNumber == null || _phoneNumber!.isEmpty) {
        setState(() => _errorMessage = 'Please enter a valid phone number');
        return;
      }
    }

    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.signUp(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      username: _inGameUserNameController.text.trim(),
      countryCode: _countryCode,
      mobileNo: _phoneNumber,
      pubgId: _pubgIdController.text.trim().isNotEmpty
          ? _pubgIdController.text.trim()
          : null,
      gameServer: _selectedGameServer?.isNotEmpty == true
          ? _selectedGameServer
          : null,
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
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const PlayScreen()),
        );
      }
      return;
    }

    setState(() => _errorMessage = result['message'] ?? 'Sign up failed');
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return AuthFormShell(
      wide: true,
      title: 'auth.signUpTitle'.tr(),
      description: 'auth.signUpDesc'.tr(),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text.rich(
              TextSpan(
                text: '${'auth.alreadyHaveAccount'.tr()} ',
                style: AppTheme.bodyMedium.copyWith(color: AppColors.textMuted),
                children: [
                  TextSpan(
                    text: 'auth.signIn'.tr(),
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.goldAccent,
                      fontWeight: FontWeight.w700,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const SignInScreen()),
                        );
                      },
                  ),
                ],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 16),
            ],
            AuthTextField(
              controller: _inGameUserNameController,
              label: 'auth.inGameName'.tr(),
              hint: 'Enter your in-game name',
              prefix: const Icon(Icons.person_outline, color: AppColors.textMuted),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'In-game username is required';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            AuthPhoneField(
              controller: _phoneController,
              onNumberChanged: (n) => _phoneNumber = n,
              onCountryChanged: (c) => _countryCode = c,
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: _pubgIdController,
              label: 'auth.pubgId'.tr(),
              hint: 'Optional',
              prefix: const Icon(Icons.sports_esports, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'auth.gameServer'.tr().toUpperCase(),
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.textPrimary.withValues(alpha: 0.82),
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.4,
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedGameServer != null &&
                          AppConstants.gameServers
                              .any((s) => s['value'] == _selectedGameServer)
                      ? _selectedGameServer
                      : null,
                  dropdownColor: AppColors.surfaceElevated,
                  style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
                  decoration: const InputDecoration(hintText: 'Select server'),
                  items: AppConstants.gameServers
                      .map(
                        (server) => DropdownMenuItem<String>(
                          value: server['value'],
                          child: Text(server['label'] ?? server['value']!),
                        ),
                      )
                      .toList(),
                  onChanged: (value) => setState(() => _selectedGameServer = value),
                ),
              ],
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: _emailController,
              label: 'auth.email'.tr(),
              hint: 'example@domain.com',
              keyboardType: TextInputType.emailAddress,
              prefix: const Icon(Icons.email_outlined, color: AppColors.textMuted),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Email is required';
                }
                if (!value.contains('@')) return 'Enter a valid email';
                return null;
              },
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: _passwordController,
              label: 'auth.password'.tr(),
              hint: '6+ characters',
              obscureText: _obscurePassword,
              prefix: const Icon(Icons.lock_outline, color: AppColors.textMuted),
              suffix: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility : Icons.visibility_off,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Password is required';
                if (value.length < 8) {
                  return 'Password must be at least 8 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            AuthTextField(
              controller: _confirmPasswordController,
              label: 'auth.confirmPassword'.tr(),
              obscureText: _obscureConfirmPassword,
              prefix: const Icon(Icons.lock_outline, color: AppColors.textMuted),
              suffix: IconButton(
                icon: Icon(
                  _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(
                  () => _obscureConfirmPassword = !_obscureConfirmPassword,
                ),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Confirm password is required';
                }
                if (value != _passwordController.text) {
                  return "Passwords don't match";
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            GoldButton(
              label: 'auth.createAccount'.tr(),
              loading: authProvider.isLoading,
              onPressed: authProvider.isLoading ? null : _handleSignUp,
            ),
            const SizedBox(height: 16),
            Text(
              'auth.termsAgreement'.tr(),
              style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
