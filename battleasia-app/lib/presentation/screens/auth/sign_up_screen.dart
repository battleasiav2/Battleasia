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
  bool _termsAccepted = false;
  int _step = 1;
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

  bool _validateStep1() {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _errorMessage = 'auth.emailInvalid'.tr());
      return false;
    }
    if (_passwordController.text.length < 8) {
      setState(() => _errorMessage = 'auth.passwordMin8'.tr());
      return false;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'auth.passwordMismatch'.tr());
      return false;
    }
    return true;
  }

  void _goNext() {
    setState(() => _errorMessage = null);
    if (_validateStep1()) {
      setState(() => _step = 2);
    }
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_termsAccepted) {
      setState(() => _errorMessage = 'auth.termsRequired'.tr());
      return;
    }

    setState(() => _errorMessage = null);

    if (_phoneController.text.trim().isNotEmpty) {
      if (_countryCode == null || _countryCode!.isEmpty) {
        setState(() => _errorMessage = 'auth.countryCodeRequired'.tr());
        return;
      }
      if (_phoneNumber == null || _phoneNumber!.isEmpty) {
        setState(() => _errorMessage = 'auth.phoneInvalid'.tr());
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
    final progress = _step == 1 ? 50.0 : 100.0;

    return AuthFormShell(
      wide: true,
      progress: progress,
      title: 'auth.createAccountTitle'.tr(),
      description: 'auth.signUpStepsDescription'.tr(),
      steps: AuthStepProgress(
        currentStep: _step,
        steps: [
          (title: 'auth.stepAccountInfo'.tr(), hint: 'auth.stepAccountHint'.tr()),
          (title: 'auth.stepInGameInfo'.tr(), hint: 'auth.stepInGameHint'.tr()),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMessage != null) ...[
              AuthAlert(message: _errorMessage!),
              const SizedBox(height: 14),
            ],
            if (_step == 1) ...[
              AuthTextField(
                controller: _emailController,
                label: 'auth.email'.tr(),
                hint: 'auth.emailPlaceholder'.tr(),
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.mail_outline,
                textInputAction: TextInputAction.next,
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
              ),
              const SizedBox(height: 14),
              AuthTextField(
                controller: _confirmPasswordController,
                label: 'auth.confirmPassword'.tr(),
                hint: 'auth.confirmPasswordHint'.tr(),
                obscureText: _obscureConfirmPassword,
                prefixIcon: Icons.lock_outline,
                suffix: IconButton(
                  icon: Icon(
                    _obscureConfirmPassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: const Color(0xFF9CA3AF),
                    size: 18,
                  ),
                  onPressed: () => setState(
                    () => _obscureConfirmPassword = !_obscureConfirmPassword,
                  ),
                ),
              ),
              const SizedBox(height: 18),
              AuthPrimaryButton(
                label: 'auth.continue'.tr(),
                trailingIcon: Icons.arrow_forward_rounded,
                onPressed: _goNext,
              ),
            ] else ...[
              AuthTextField(
                controller: _inGameUserNameController,
                label: 'auth.inGameName'.tr(),
                hint: 'auth.inGameNameHint'.tr(),
                prefixIcon: Icons.person_outline,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'auth.inGameNameRequired'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              AuthTextField(
                controller: _pubgIdController,
                label: 'auth.pubgId'.tr(),
                hint: 'auth.pubgIdHint'.tr(),
                prefixIcon: Icons.sports_esports_outlined,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'auth.pubgIdRequired'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              AuthPhoneField(
                controller: _phoneController,
                onNumberChanged: (n) => _phoneNumber = n,
                onCountryChanged: (c) => _countryCode = c,
              ),
              const SizedBox(height: 14),
              _GameServerDropdown(
                value: _selectedGameServer,
                onChanged: (v) => setState(() => _selectedGameServer = v),
              ),
              const SizedBox(height: 14),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 22,
                    height: 22,
                    child: Checkbox(
                      value: _termsAccepted,
                      onChanged: (v) =>
                          setState(() => _termsAccepted = v ?? false),
                      side: BorderSide(
                        color: AppColors.gold.withValues(alpha: 0.45),
                      ),
                      activeColor: AppColors.gold,
                      checkColor: const Color(0xFF111111),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'auth.termsAgreement'.tr(),
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.white.withValues(alpha: 0.55),
                        fontSize: 13,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  AuthSecondaryButton(
                    label: 'auth.back'.tr(),
                    onPressed: () => setState(() {
                      _step = 1;
                      _errorMessage = null;
                    }),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AuthPrimaryButton(
                      label: 'auth.createAccount'.tr(),
                      icon: Icons.sports_martial_arts_rounded,
                      loading: authProvider.isLoading,
                      onPressed: authProvider.isLoading ? null : _handleSignUp,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),
            Text.rich(
              TextSpan(
                text: '${'auth.alreadyHaveAccount'.tr()} ',
                style: AppTheme.bodyMedium.copyWith(
                  color: Colors.white.withValues(alpha: 0.55),
                  fontSize: 13,
                ),
                children: [
                  TextSpan(
                    text: 'auth.signIn'.tr(),
                    style: AppTheme.bodyMedium.copyWith(
                      color: AppColors.gold,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      decoration: TextDecoration.underline,
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
          ],
        ),
      ),
    );
  }
}

class _GameServerDropdown extends StatelessWidget {
  final String? value;
  final ValueChanged<String?> onChanged;

  const _GameServerDropdown({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'auth.gameServer'.tr(),
          style: AppTheme.bodySmall.copyWith(
            color: Colors.white.withValues(alpha: 0.55),
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: value != null &&
                  AppConstants.gameServers.any((s) => s['value'] == value)
              ? value
              : null,
          dropdownColor: const Color(0xFF181614),
          style: AppTheme.bodyMedium.copyWith(
            color: AppColors.textPrimary,
            fontSize: 14,
          ),
          decoration: InputDecoration(
            hintText: 'auth.selectServer'.tr(),
            hintStyle: AppTheme.bodyMedium.copyWith(
              color: const Color(0xFF9CA3AF),
              fontSize: 14,
            ),
            filled: true,
            fillColor: const Color(0xFF0E0E0E).withValues(alpha: 0.65),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.5)),
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
          onChanged: onChanged,
          validator: (v) =>
              v == null || v.isEmpty ? 'auth.gameServerRequired'.tr() : null,
        ),
      ],
    );
  }
}
