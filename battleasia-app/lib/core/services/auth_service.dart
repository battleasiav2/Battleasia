import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/data/models/session_model.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Get base URL from config
  String get _baseUrl => AppConfig.serverUrl;

  // Get stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Save token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Get stored user
  Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return UserModel.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  // Save user
  Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  // Clear auth data
  Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Sign in
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/signin'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        // Check if user hasn't verified email yet
        final emailVerified = data['emailVerified'];
        if (emailVerified == false) {
          return {
            'success': true,
            'emailVerificationRequired': true,
            'email': email,
            'message': 'Please verify your email before signing in',
          };
        }

        final sessionData = data['session'] as Map<String, dynamic>?;
        final userData = data['user'] as Map<String, dynamic>?;

        if (sessionData == null || !sessionData.containsKey('accessToken')) {
          return {
            'success': false,
            'message':
                data['message'] as String? ??
                'Access token not found in response',
          };
        }

        final session = SessionModel.fromJson(sessionData);
        final user = userData != null ? UserModel.fromJson(userData) : null;

        // Save token and user
        await saveToken(session.accessToken);
        if (user != null) {
          await saveUser(user);
        }

        return {'success': true, 'user': user, 'session': session};
      } else {
        // Check for email verification pending
        if (data['emailVerificationPending'] == true || 
            (data['emailVerified'] == false && data['message']?.toString().contains('verify') == true)) {
          return {
            'success': true,
            'emailVerificationRequired': true,
            'email': email,
            'message': data['message'] as String? ?? 'Please verify your email',
          };
        }
        
        return {
          'success': false,
          'message': data['message'] as String? ?? 'Login failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  // Sign up
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String username,
    String? countryCode,
    String? mobileNo,
    String? pubgId,
    String? gameServer,
    String? referralCode,
    String? referredBy,
  }) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'username': username,
          if (countryCode != null && countryCode.isNotEmpty)
            'countryCode': countryCode,
          if (mobileNo != null && mobileNo.isNotEmpty) 'mobileNo': mobileNo,
          if (pubgId != null && pubgId.isNotEmpty) 'pubgId': pubgId,
          if (gameServer != null && gameServer.isNotEmpty)
            'gameServer': gameServer,
          if (referredBy != null && referredBy.isNotEmpty)
            'referredBy': referredBy,
          if (referralCode != null && referralCode.isNotEmpty)
            'referralCode': referralCode,
        }),
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        // Check if email verification is required
        final emailVerificationRequired = data['emailVerificationRequired'] == true;
        final responseEmail = data['email'] as String?;
        
        if (emailVerificationRequired) {
          // Don't save session - user must verify email first
          return {
            'success': true,
            'emailVerificationRequired': true,
            'email': responseEmail ?? email,
            'message': data['message'] as String? ?? 'Please verify your email',
          };
        }

        final sessionData = data['session'] as Map<String, dynamic>?;
        final userData = data['user'] as Map<String, dynamic>?;

        if (sessionData == null || !sessionData.containsKey('accessToken')) {
          return {
            'success': false,
            'message':
                data['message'] as String? ??
                'Access token not found in response',
          };
        }

        final session = SessionModel.fromJson(sessionData);
        final user = userData != null ? UserModel.fromJson(userData) : null;

        // Save token and user
        await saveToken(session.accessToken);
        if (user != null) {
          await saveUser(user);
        }

        return {'success': true, 'user': user, 'session': session};
      } else {
        // Check if there's a pending email verification
        final errorData = data;
        if (errorData['emailVerificationPending'] == true && errorData['email'] != null) {
          return {
            'success': true,
            'emailVerificationRequired': true,
            'email': errorData['email'] as String,
            'message': 'Please verify your email',
          };
        }
        
        return {
          'success': false,
          'message': data['message'] as String? ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  // Sign out
  Future<void> signOut() async {
    await clearAuth();
  }
}
