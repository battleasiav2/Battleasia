import 'dart:async';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/referral_store.dart';
import 'package:battleasia_app/presentation/screens/auth/email_verification_screen.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/legal/legal_screen.dart';
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
  String _referredBy = '';
  String? _emailHint;
  bool _emailOk = false;
  bool _emailChecking = false;
  Timer? _emailTimer;
  int _emailReq = 0;

  static final _emailRe = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

  @override
  void initState() {
    super.initState();
    _emailController.addListener(_scheduleEmailCheck);
    _passwordController.addListener(_rebuild);
    _loadReferral();
  }

  void _rebuild() {
    if (mounted) setState(() {});
  }

  Future<void> _loadReferral() async {
    await captureReferral();
    final code = await readReferral();
    if (!mounted) return;
    setState(() => _referredBy = code);
  }

  void _scheduleEmailCheck() {
    _emailTimer?.cancel();
    final raw = _emailController.text.trim();
    if (raw.isEmpty) {
      setState(() {
        _emailHint = null;
        _emailOk = false;
        _emailChecking = false;
      });
      return;
    }
    if (!_emailRe.hasMatch(raw)) {
      setState(() {
        _emailHint = 'auth.emailInvalid'.tr();
        _emailOk = false;
        _emailChecking = false;
      });
      return;
    }
    setState(() {
      _emailHint = null;
      _emailOk = false;
      _emailChecking = true;
    });
    _emailTimer = Timer(const Duration(milliseconds: 450), () {
      _runEmailCheck(raw);
    });
  }

  Future<String> _runEmailCheck(String raw) async {
    final email = raw.trim().toLowerCase();
    if (!_emailRe.hasMatch(email)) {
      final msg = 'auth.emailInvalid'.tr();
      if (mounted) {
        setState(() {
          _emailHint = msg;
          _emailOk = false;
          _emailChecking = false;
        });
      }
      return msg;
    }
    final req = ++_emailReq;
    if (mounted) setState(() => _emailChecking = true);
    final result = await AuthService().checkEmail(email);
    if (!mounted || req != _emailReq) return '';
    if (result['success'] != true) {
      setState(() => _emailChecking = false);
      return '';
    }
    if (result['available'] == true) {
      setState(() {
        _emailHint = null;
        _emailOk = true;
        _emailChecking = false;
      });
      return '';
    }
    final msg = result['pending'] == true ? 'auth.emailPending'.tr() : 'auth.emailTaken'.tr();
    setState(() {
      _emailHint = msg;
      _emailOk = false;
      _emailChecking = false;
    });
    return msg;
  }

  @override
  void dispose() {
    _emailTimer?.cancel();
    _emailController.removeListener(_scheduleEmailCheck);
    _passwordController.removeListener(_rebuild);
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
    if (!_emailRe.hasMatch(email)) {
      setState(() => _errorMessage = 'auth.emailInvalid'.tr());
      return false;
    }
    if (_emailHint != null && _emailHint!.isNotEmpty) {
      setState(() => _errorMessage = _emailHint);
      return false;
    }
    if (_scorePassword(_passwordController.text) < 3) {
      setState(() => _errorMessage = 'auth.pwWeak'.tr());
      return false;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'auth.passwordMismatch'.tr());
      return false;
    }
    return true;
  }

  String? _profileError() {
    final name = _inGameUserNameController.text.trim();
    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(name)) {
      return 'auth.usernameRule'.tr();
    }
    final pubg = _pubgIdController.text.trim();
    if (!RegExp(r'^[a-zA-Z0-9]{1,20}$').hasMatch(pubg)) {
      return 'auth.pubgRule'.tr();
    }
    final mobile = (_phoneNumber ?? '').replaceAll(RegExp(r'\D'), '');
    final dial = (_countryCode ?? '').replaceAll(RegExp(r'\D'), '');
    if (dial == '880' && !RegExp(r'^01\d{9}$').hasMatch(mobile) && !RegExp(r'^1\d{9}$').hasMatch(mobile)) {
      return 'auth.bdMobile'.tr();
    }
    if (mobile.length < 8) return 'auth.mobileShort'.tr();
    if (_selectedGameServer == null || _selectedGameServer!.isEmpty) {
      return 'auth.gameServerRequired'.tr();
    }
    return null;
  }

  Future<void> _goNext() async {
    setState(() => _errorMessage = null);
    await _runEmailCheck(_emailController.text);
    if (!mounted) return;
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

    final profileError = _profileError();
    if (profileError != null) {
      setState(() => _errorMessage = profileError);
      return;
    }

    final mobile = (_phoneNumber ?? '').replaceAll(RegExp(r'\D'), '').replaceFirst(RegExp(r'^0'), '');
    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.signUp(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      username: _inGameUserNameController.text.trim(),
      countryCode: _countryCode,
      mobileNo: mobile,
      pubgId: _pubgIdController.text.trim(),
      gameServer: _selectedGameServer,
      referredBy: _referredBy.isEmpty ? null : _referredBy,
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
            if (_referredBy.isNotEmpty) ...[
              Text(
                '${'auth.refApplied'.tr()}: $_referredBy',
                style: AppTheme.bodySmall.copyWith(color: const Color(0xFFCCFF00)),
              ),
              const SizedBox(height: 12),
            ],
            if (_step == 1) ...[
              AuthTextField(
                controller: _emailController,
                label: 'auth.email'.tr(),
                hint: 'auth.emailPlaceholder'.tr(),
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
              ),
              if (_emailChecking)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text('auth.emailChecking'.tr(), style: AppTheme.bodySmall.copyWith(color: AppColors.textMuted)),
                ),
              if (!_emailChecking && _emailHint != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(_emailHint!, style: AppTheme.bodySmall.copyWith(color: const Color(0xFFEF9B88))),
                ),
              if (!_emailChecking && _emailOk)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text('auth.emailOk'.tr(), style: AppTheme.bodySmall.copyWith(color: const Color(0xFFB7CF62))),
                ),
              const SizedBox(height: 14),
              AuthTextField(
                controller: _passwordController,
                label: 'auth.password'.tr(),
                hint: 'auth.passwordPlaceholder'.tr(),
                obscureText: _obscurePassword,
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
              if (_passwordController.text.isNotEmpty) _passwordMeter(),
              const SizedBox(height: 14),
              AuthTextField(
                controller: _confirmPasswordController,
                label: 'auth.confirmPassword'.tr(),
                hint: 'auth.confirmPasswordHint'.tr(),
                obscureText: _obscureConfirmPassword,
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
              const SizedBox(height: 16),
              AuthPrimaryButton(
                label: 'auth.continue'.tr(),
                onPressed: _goNext,
              ),
            ] else ...[
              AuthTextField(
                controller: _inGameUserNameController,
                label: 'auth.inGameName'.tr(),
                hint: 'auth.inGameNameHint'.tr(),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'auth.inGameNameRequired'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AuthTextField(
                controller: _pubgIdController,
                label: 'auth.pubgId'.tr(),
                hint: 'auth.pubgIdHint'.tr(),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'auth.pubgIdRequired'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AuthPhoneField(
                controller: _phoneController,
                onNumberChanged: (n) => _phoneNumber = n,
                onCountryChanged: (c) => _countryCode = c,
              ),
              const SizedBox(height: 12),
              _GameServerDropdown(
                value: _selectedGameServer,
                onChanged: (v) => setState(() => _selectedGameServer = v),
              ),
              const SizedBox(height: 12),
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
                    child: Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          'auth.agreeLead'.tr(),
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.white.withValues(alpha: 0.55),
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const LegalScreen.terms()),
                            );
                          },
                          child: Text(
                            'legal.termsTitle'.tr(),
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.gold,
                              fontSize: 13,
                              height: 1.5,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                        Text(
                          ' ${'auth.agreeAnd'.tr()} ',
                          style: AppTheme.bodyMedium.copyWith(
                            color: Colors.white.withValues(alpha: 0.55),
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const LegalScreen.privacy()),
                            );
                          },
                          child: Text(
                            'legal.privacyTitle'.tr(),
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.gold,
                              fontSize: 13,
                              height: 1.5,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () => setState(() {
                  _step = 1;
                  _errorMessage = null;
                }),
                child: Text(
                  '← ${'auth.back'.tr()}',
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              AuthPrimaryButton(
                label: 'auth.createAccount'.tr(),
                loading: authProvider.isLoading,
                onPressed: authProvider.isLoading ? null : _handleSignUp,
              ),
            ],
            const SizedBox(height: 14),
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

  Widget _passwordMeter() {
    final value = _passwordController.text;
    final score = _scorePassword(value);
    final rules = _passwordRules(value);
    final labels = [
      'auth.pwWeak'.tr(),
      'auth.pwWeak'.tr(),
      'auth.pwFair'.tr(),
      'auth.pwGood'.tr(),
      'auth.pwStrong'.tr(),
    ];
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              for (var n = 1; n <= 4; n++)
                Container(
                  width: 28,
                  height: 4,
                  margin: const EdgeInsets.only(right: 4),
                  color: n <= score ? const Color(0xFFCCFF00) : Colors.white24,
                ),
              Text(labels[score], style: AppTheme.bodySmall.copyWith(color: Colors.white70)),
            ],
          ),
          const SizedBox(height: 6),
          _hintLine(rules.length, 'auth.pwHint.length'.tr()),
          _hintLine(rules.caseMix, 'auth.pwHint.case'.tr()),
          _hintLine(rules.number, 'auth.pwHint.number'.tr()),
          _hintLine(rules.special, 'auth.pwHint.special'.tr()),
        ],
      ),
    );
  }

  Widget _hintLine(bool ok, String text) {
    return Text(
      text,
      style: AppTheme.bodySmall.copyWith(
        color: ok ? const Color(0xFFB7CF62) : const Color(0xFFEF9B88),
        fontSize: 12,
      ),
    );
  }
}

int _scorePassword(String value) {
  if (value.isEmpty) return 0;
  var score = 1;
  if (value.length >= 8) score += 1;
  if (RegExp(r'[A-Z]').hasMatch(value) && RegExp(r'[a-z]').hasMatch(value)) score += 1;
  if (RegExp(r'\d').hasMatch(value) && RegExp(r'[^A-Za-z0-9]').hasMatch(value)) score += 1;
  return score > 4 ? 4 : score;
}

class _PwRules {
  final bool length;
  final bool caseMix;
  final bool number;
  final bool special;
  const _PwRules({required this.length, required this.caseMix, required this.number, required this.special});
}

_PwRules _passwordRules(String value) {
  return _PwRules(
    length: value.length >= 8,
    caseMix: RegExp(r'[A-Z]').hasMatch(value) && RegExp(r'[a-z]').hasMatch(value),
    number: RegExp(r'\d').hasMatch(value),
    special: RegExp(r'[^A-Za-z0-9]').hasMatch(value),
  );
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
              borderRadius: BorderRadius.zero,
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.zero,
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
