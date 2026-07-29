import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:battleasia_app/core/providers/auth_provider.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/responsive_utils.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/presentation/widgets/common/battleasia_logo.dart';
import 'package:battleasia_app/presentation/screens/auth/sign_in_screen.dart';
import 'package:battleasia_app/presentation/screens/auth/email_verification_screen.dart';
import 'package:battleasia_app/presentation/screens/account/account_screen.dart';

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
  String? _countryCode = '+1'; // Default to US dial code
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
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _errorMessage = null;
    });

    // Get phone number from the IntlPhoneField
    String? countryCode = _countryCode;
    String? mobileNo = _phoneNumber;

    // Validate phone number if provided
    if (_phoneController.text.trim().isNotEmpty) {
      if (countryCode == null || countryCode.isEmpty) {
        setState(() {
          _errorMessage = 'Please select a country code';
        });
        return;
      }

      if (mobileNo == null || mobileNo.isEmpty) {
        setState(() {
          _errorMessage = 'Please enter a valid phone number';
        });
        return;
      }
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final result = await authProvider.signUp(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      username: _inGameUserNameController.text.trim(),
      countryCode: countryCode,
      mobileNo: mobileNo,
      pubgId: _pubgIdController.text.trim().isNotEmpty
          ? _pubgIdController.text.trim()
          : null,
      gameServer: _selectedGameServer?.isNotEmpty == true
          ? _selectedGameServer
          : null,
    );

    if (result['success'] == true && mounted) {
      // Check if email verification is required
      if (result['emailVerificationRequired'] == true) {
        final email = result['email'] as String? ?? _emailController.text.trim();
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => EmailVerificationScreen(email: email),
          ),
        );
      } else {
        // Direct login (shouldn't happen with new flow)
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const AccountScreen()),
        );
      }
    } else {
      setState(() {
        _errorMessage = result['message'] ?? 'Sign up failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = ResponsiveUtils.isMobile(context);
    final titleFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 28.0,
      min: 24.0,
      max: 40.0,
    );
    final bodyFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 16.0,
    );
    final labelFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 14.0,
      min: 12.0,
      max: 16.0,
    );
    final buttonFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 18.0,
      min: 16.0,
      max: 20.0,
    );
    final smallFontSize = ResponsiveUtils.getResponsiveFontSize(
      context,
      baseSize: 12.0,
      min: 10.0,
      max: 14.0,
    );

    return Theme(
      data: Theme.of(context).copyWith(
        textSelectionTheme: TextSelectionThemeData(
          selectionColor: AppTheme.accentColor.withOpacity(0.3),
          selectionHandleColor: AppTheme.accentColor,
          cursorColor: AppTheme.accentColor,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          toolbarTextStyle: const TextStyle(color: Colors.black),
          titleTextStyle: const TextStyle(color: Colors.black),
        ),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/auth_m.webp'),
              fit: BoxFit.cover,
            ),
          ),
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: isMobile ? 24 : 40,
                  vertical: 40,
                ),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 500),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Logo
                      const BattleAsiaLogo(
                        logoSize: 80,
                        showText: true,
                        alignment: MainAxisAlignment.center,
                      ),
                      const SizedBox(height: 40),

                      // Title
                      Text(
                        'SIGN UP',
                        style: AppTheme.heading2.copyWith(
                          fontSize: titleFontSize,
                          foreground: Paint()
                            ..shader = AppTheme.accentGradient.createShader(
                              const Rect.fromLTWH(0, 0, 200, 70),
                            ),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),

                      // Description
                      Text.rich(
                        TextSpan(
                          text: "Already have an account? ",
                          style: AppTheme.bodyMedium.copyWith(
                            fontSize: bodyFontSize,
                            color: Colors.white70,
                          ),
                          children: [
                            TextSpan(
                              text: 'Sign In',
                              style: AppTheme.bodyMedium.copyWith(
                                fontSize: bodyFontSize,
                                color: AppTheme.accentColor,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () {
                                  Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          const SignInScreen(),
                                    ),
                                  );
                                },
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Error message
                      if (_errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 24),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(
                              color: Colors.red,
                              fontSize: bodyFontSize,
                            ),
                          ),
                        ),

                      // Form
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // In Game User Name
                            TextFormField(
                              controller: _inGameUserNameController,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: bodyFontSize,
                              ),
                              decoration: InputDecoration(
                                labelText: 'In Game User Name *',
                                labelStyle: TextStyle(
                                  color: Colors.white70,
                                  fontSize: labelFontSize,
                                ),
                                prefixIcon: const Icon(
                                  Icons.person,
                                  color: Colors.white70,
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.1),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'In Game User Name is required';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 20),

                            // Mobile No
                            Builder(
                              builder: (context) {
                                final countryNameFontSize =
                                    ResponsiveUtils.getResponsiveFontSize(
                                      context,
                                      baseSize: 14.0,
                                      min: 12.0,
                                      max: 16.0,
                                    );

                                final countryCodeFontSize =
                                    ResponsiveUtils.getResponsiveFontSize(
                                      context,
                                      baseSize: 14.0,
                                      min: 12.0,
                                      max: 16.0,
                                    );

                                final searchFontSize =
                                    ResponsiveUtils.getResponsiveFontSize(
                                      context,
                                      baseSize: 14.0,
                                      min: 12.0,
                                      max: 16.0,
                                    );

                                return Theme(
                                  data: Theme.of(context).copyWith(
                                    dialogTheme: DialogThemeData(
                                      backgroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                    textTheme: TextTheme(
                                      bodyLarge: TextStyle(
                                        color: Colors.black,
                                        fontSize: countryNameFontSize,
                                      ),
                                      bodyMedium: TextStyle(
                                        color: Colors.black,
                                        fontSize: countryCodeFontSize,
                                      ),
                                      bodySmall: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                      titleMedium: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                      titleSmall: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                      labelLarge: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                      labelMedium: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                      labelSmall: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                    ),
                                    inputDecorationTheme: InputDecorationTheme(
                                      hintStyle: TextStyle(
                                        color: Colors.grey,
                                        fontSize: searchFontSize,
                                      ),
                                      labelStyle: TextStyle(
                                        color: Colors.black,
                                        fontSize: searchFontSize,
                                      ),
                                    ),
                                    listTileTheme: ListTileThemeData(
                                      textColor: Colors.black,
                                      titleTextStyle: TextStyle(
                                        color: Colors.black,
                                        fontSize: countryNameFontSize,
                                      ),
                                      subtitleTextStyle: TextStyle(
                                        color: Colors.black,
                                        fontSize: countryCodeFontSize,
                                      ),
                                    ),
                                  ),
                                  child: IntlPhoneField(
                                    controller: _phoneController,
                                    decoration: InputDecoration(
                                      labelText: 'Mobile No',
                                      labelStyle: TextStyle(
                                        color: Colors.white70,
                                        fontSize: labelFontSize,
                                      ),
                                      hintText: 'Enter phone number',
                                      hintStyle: TextStyle(
                                        color: Colors.white.withOpacity(0.5),
                                        fontSize: bodyFontSize,
                                      ),
                                      filled: true,
                                      fillColor: Colors.white.withOpacity(0.1),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(
                                          color: Colors.white30,
                                        ),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(
                                          color: Colors.white30,
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(
                                          color: AppTheme.accentColor,
                                          width: 2,
                                        ),
                                      ),
                                    ),
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: bodyFontSize,
                                    ),
                                    dropdownTextStyle: TextStyle(
                                      color: Colors.white,
                                      fontSize: bodyFontSize,
                                    ),
                                    dropdownIcon: const Icon(
                                      Icons.arrow_drop_down,
                                      color: Colors.white70,
                                    ),
                                    initialCountryCode: 'US',
                                    onChanged: (phone) {
                                      setState(() {
                                        // phone.number is the phone number without country code
                                        _phoneNumber = phone.number;
                                        // _countryCode is set in onCountryChanged
                                      });
                                    },
                                    onCountryChanged: (country) {
                                      setState(() {
                                        // country.dialCode is the dial code (e.g., "+1", "+44")
                                        _countryCode = country.dialCode;
                                      });
                                    },
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 20),

                            // PUBG ID
                            TextFormField(
                              controller: _pubgIdController,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: bodyFontSize,
                              ),
                              decoration: InputDecoration(
                                labelText: 'Enter your PUBG ID',
                                labelStyle: TextStyle(
                                  color: Colors.white70,
                                  fontSize: labelFontSize,
                                ),
                                prefixIcon: const Icon(
                                  Icons.videogame_asset,
                                  color: Colors.white70,
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.1),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Game Server
                            DropdownButtonFormField<String>(
                              value:
                                  _selectedGameServer != null &&
                                      AppConstants.gameServers.any(
                                        (s) =>
                                            s['value'] == _selectedGameServer,
                                      )
                                  ? _selectedGameServer
                                  : null,
                              decoration: InputDecoration(
                                labelText: 'Game Server',
                                labelStyle: TextStyle(
                                  color: Colors.white70,
                                  fontSize: labelFontSize,
                                ),
                                prefixIcon: const Icon(
                                  Icons.dns,
                                  color: Colors.white70,
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.1),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                ),
                              ),
                              dropdownColor: Colors.white,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: bodyFontSize,
                              ),
                              items: AppConstants.gameServers.map((server) {
                                return DropdownMenuItem<String>(
                                  value: server['value']!,
                                  child: Text(
                                    server['label'] ?? server['value']!,
                                    style: TextStyle(
                                      fontSize: bodyFontSize,
                                      color: Colors.black,
                                    ),
                                  ),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  _selectedGameServer = value;
                                });
                              },
                            ),
                            const SizedBox(height: 20),

                            // Email
                            TextFormField(
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: bodyFontSize,
                              ),
                              decoration: InputDecoration(
                                labelText: 'Email *',
                                labelStyle: TextStyle(
                                  color: Colors.white70,
                                  fontSize: labelFontSize,
                                ),
                                prefixIcon: const Icon(
                                  Icons.email,
                                  color: Colors.white70,
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.1),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Email is required';
                                }
                                if (!value.contains('@')) {
                                  return 'Please enter a valid email';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 20),

                            // Password
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: bodyFontSize,
                              ),
                              decoration: InputDecoration(
                                labelText: 'Password *',
                                labelStyle: TextStyle(
                                  color: Colors.white70,
                                  fontSize: labelFontSize,
                                ),
                                prefixIcon: const Icon(
                                  Icons.lock,
                                  color: Colors.white70,
                                ),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility
                                        : Icons.visibility_off,
                                    color: Colors.white70,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.1),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Password is required';
                                }
                                if (value.length < 8) {
                                  return 'Password must be at least 8 characters';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 20),

                            // Confirm Password
                            TextFormField(
                              controller: _confirmPasswordController,
                              obscureText: _obscureConfirmPassword,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: bodyFontSize,
                              ),
                              decoration: InputDecoration(
                                labelText: 'Confirm Password *',
                                labelStyle: TextStyle(
                                  color: Colors.white70,
                                  fontSize: labelFontSize,
                                ),
                                prefixIcon: const Icon(
                                  Icons.lock_outline,
                                  color: Colors.white70,
                                ),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscureConfirmPassword
                                        ? Icons.visibility
                                        : Icons.visibility_off,
                                    color: Colors.white70,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscureConfirmPassword =
                                          !_obscureConfirmPassword;
                                    });
                                  },
                                ),
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.1),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: Colors.white30,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(
                                    color: AppTheme.accentColor,
                                    width: 2,
                                  ),
                                ),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Confirm Password is required';
                                }
                                if (value != _passwordController.text) {
                                  return "Passwords don't match";
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 32),

                            // Sign up button
                            Consumer<AuthProvider>(
                              builder: (context, authProvider, child) {
                                return ElevatedButton(
                                  onPressed: authProvider.isLoading
                                      ? null
                                      : _handleSignUp,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.accentColor,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: authProvider.isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor:
                                                AlwaysStoppedAnimation<Color>(
                                                  Colors.black,
                                                ),
                                          ),
                                        )
                                      : Text(
                                          'Create account',
                                          style: AppTheme.bodyLarge.copyWith(
                                            fontSize: buttonFontSize,
                                            color: Colors.black,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                );
                              },
                            ),
                            const SizedBox(height: 24),

                            // Terms and Privacy
                            Text(
                              'By signing up, I agree to Terms of service and Privacy policy.',
                              style: AppTheme.bodySmall.copyWith(
                                fontSize: smallFontSize,
                                color: Colors.white70,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
