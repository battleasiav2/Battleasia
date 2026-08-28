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
import 'package:battleasia_app/presentation/widgets/auth/auth_step_progress.dart';
import 'package:battleasia_app/presentation/widgets/auth/auth_text_field.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _step1Key = GlobalKey<FormState>();
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
  int _activeStep = 0;

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

  bool _validateStep1() {
    setState(() => _errorMessage = null);
    if (_step1Key.currentState?.validate() != true) return false;
    if (_countryCode == null || _countryCode!.isEmpty) {
      setState(() => _errorMessage = 'Please select a country code');
      return false;
    }
    if (_phoneNumber == null || _phoneNumber!.isEmpty) {
      setState(() => _errorMessage = 'Please enter a valid phone number');
      return false;
    }
    return true;
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

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

  Widget _stepHint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        text,
        style: AppTheme.bodySmall.copyWith(
          fontSize: 12.5,
          fontWeight: FontWeight.w600,
          color: Colors.white.withValues(alpha: 0.68),
          height: 1.35,
        ),
      ),
    );
  }

  Widget _buildGameServerField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AuthFieldLabel(label: 'auth.gameServer'.tr()),
        const SizedBox(height: 6),
        DecoratedBox(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withValues(alpha: 0.12),
                blurRadius: 10,
              ),
            ],
          ),
          child: DropdownButtonFormField<String>(
            key: ValueKey(_selectedGameServer ?? 'none'),
            initialValue: _selectedGameServer != null &&
                    AppConstants.gameServers
                        .any((s) => s['value'] == _selectedGameServer)
                ? _selectedGameServer
                : null,
            dropdownColor: const Color(0xFF181614),
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
              fontSize: 15,
            ),
            decoration: InputDecoration(
              hintText: 'Select server',
              hintStyle: AppTheme.bodyMedium.copyWith(
                color: const Color(0xFF9CA3AF),
                fontSize: 15,
              ),
              filled: true,
              fillColor: const Color(0xFF0E0E0E),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 13,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(
                  color: AppColors.gold.withValues(alpha: 0.28),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(4),
                borderSide: BorderSide(
                  color: AppColors.gold.withValues(alpha: 0.55),
                ),
              ),
            ),
            items: AppConstants.gameServers
                .map(
                  (server) => DropdownMenuItem<String>(
                    value: server['value'],
                    child: Text(server['label'] ?? server['value']!),
                  ),
                )
                .toList(),
            onChanged: (value) => setState(() => _selectedGameServer = value),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Game server is required';
              }
              return null;
            },
          ),
        ),
      ],
    );
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
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textMuted,
                  fontSize: 13,
                ),
                children: [
                  TextSpan(
                    text: 'auth.signIn'.tr(),
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.goldAccent,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
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
            const SizedBox(height: 16),
            AuthStepProgress(
              activeStep: _activeStep,
              labels: [
                'auth.signUpStepAccount'.tr(),
                'auth.signUpStepInGame'.tr(),
              ],
            ),
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 16),
            ],
            if (_activeStep == 0) ...[
              Form(
                key: _step1Key,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _stepHint('auth.signUpStepAccount'.tr()),
                    AuthPhoneField(
                      controller: _phoneController,
                      onNumberChanged: (n) => _phoneNumber = n,
                      onCountryChanged: (c) => _countryCode = c,
                    ),
                    const SizedBox(height: 14),
                    AuthTextField(
                      controller: _emailController,
                      label: 'auth.email'.tr(),
                      hint: 'auth.emailPlaceholder'.tr(),
                      keyboardType: TextInputType.emailAddress,
                      prefix: const Icon(Icons.email_outlined, color: Color(0xFF9CA3AF)),
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
                      prefix: const Icon(Icons.lock_outline, color: Color(0xFF9CA3AF)),
                      suffix: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility : Icons.visibility_off,
                          color: const Color(0xFF9CA3AF),
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'auth.passwordRequired'.tr();
                        }
                        if (value.length < 8) {
                          return 'Password must be at least 8 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    AuthTextField(
                      controller: _confirmPasswordController,
                      label: 'auth.confirmPassword'.tr(),
                      obscureText: _obscureConfirmPassword,
                      prefix: const Icon(Icons.lock_outline, color: Color(0xFF9CA3AF)),
                      suffix: IconButton(
                        icon: Icon(
                          _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                          color: const Color(0xFF9CA3AF),
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
                  ],
                ),
              ),
              const SizedBox(height: 20),
              AuthPrimaryButton(
                label: 'auth.nextStep'.tr(),
                icon: Icons.arrow_forward_rounded,
                onPressed: () {
                  if (_validateStep1()) {
                    setState(() => _activeStep = 1);
                  }
                },
              ),
            ] else ...[
              _stepHint('auth.signUpStepInGame'.tr()),
              AuthTextField(
                controller: _inGameUserNameController,
                label: 'auth.inGameName'.tr(),
                hint: 'Enter your in-game name',
                prefix: const Icon(Icons.person_outline, color: Color(0xFF9CA3AF)),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'In-game username is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              AuthTextField(
                controller: _pubgIdController,
                label: 'auth.pubgId'.tr(),
                hint: 'Enter your PUBG ID',
                prefix: const Icon(Icons.sports_esports, color: Color(0xFF9CA3AF)),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'PUBG ID is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              _buildGameServerField(),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() {
                        _errorMessage = null;
                        _activeStep = 0;
                      }),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 44),
                        foregroundColor: Colors.white.withValues(alpha: 0.78),
                        side: BorderSide(
                          color: Colors.white.withValues(alpha: 0.22),
                        ),
                        backgroundColor: Colors.black.withValues(alpha: 0.45),
                      ),
                      child: Text(
                        'auth.backStep'.tr(),
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.6,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: AuthPrimaryButton(
                      label: 'auth.createAccount'.tr(),
                      icon: Icons.person_add_alt_1_rounded,
                      loading: authProvider.isLoading,
                      onPressed: authProvider.isLoading ? null : _handleSignUp,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),
            Text(
              'auth.termsAgreement'.tr(),
              style: AppTheme.bodySmall.copyWith(
                color: AppColors.textMuted,
                fontSize: 12.5,
                height: 1.45,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
