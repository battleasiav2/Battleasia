import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/data/models/user_model.dart';
import 'package:battleasia_app/data/models/session_model.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _refreshKey = 'auth_refresh';
  static const String _userKey = 'user_data';

  static Future<String?>? _refreshFlight;
  static void Function(String accessToken)? onTokensUpdated;
  static void Function()? onSignedOut;

  // Get base URL from config
  String get _baseUrl => AppConfig.serverUrl;

  Future<String?> _readStoredAccess() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// Access token, renewed first when the saved one is expired.
  Future<String?> getToken() async {
    if (_refreshFlight != null) {
      final next = await _refreshFlight;
      if (next != null && next.isNotEmpty) return next;
      return _readStoredAccess();
    }
    final access = await _readStoredAccess();
    if (access != null && access.isNotEmpty && _accessUsable(access)) return access;
    final refresh = await getRefreshToken();
    if ((refresh == null || refresh.isEmpty) && (access == null || access.isEmpty)) return null;
    final next = await refreshSession();
    if (next != null && next.isNotEmpty) return next;
    return _readStoredAccess();
  }

  // Save token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshKey);
  }

  Future<void> saveRefreshToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_refreshKey, token);
  }

  Future<void> storeSessionTokens(Map sessionData) async {
    final access = sessionData['accessToken'] ?? sessionData['token'];
    final refresh = sessionData['refreshToken'];
    if (access is String && access.isNotEmpty) await saveToken(access);
    if (refresh is String && refresh.isNotEmpty) await saveRefreshToken(refresh);
  }

  /// Ask the server for a new access token. One flight is shared by every caller.
  Future<String?> refreshSession() {
    final existing = _refreshFlight;
    if (existing != null) return existing;
    late final Future<String?> flight;
    flight = _refreshBody().whenComplete(() {
      if (identical(_refreshFlight, flight)) _refreshFlight = null;
    });
    _refreshFlight = flight;
    return flight;
  }

  Future<String?> _refreshBody() async {
    final refresh = await getRefreshToken();
    final access = await _readStoredAccess();
    if ((refresh == null || refresh.isEmpty) && (access == null || access.isEmpty)) {
      return null;
    }
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/refresh'),
        headers: {
          'Content-Type': 'application/json',
          if (access != null && access.isNotEmpty) 'Authorization': 'Bearer $access',
        },
        body: jsonEncode({
          if (refresh != null && refresh.isNotEmpty) 'refresh': refresh,
        }),
        skipAuthRenew: true,
      );
      if (response.statusCode == 401) {
        await clearAuth();
        onSignedOut?.call();
        return null;
      }
      if (response.statusCode != 200 || response.body.isEmpty) return null;
      final data = jsonDecode(response.body);
      if (data is! Map) return null;
      final session = data['session'];
      final nextAccess = data['token'] ??
          (session is Map ? session['accessToken'] : null) ??
          (data['data'] is Map ? (data['data'] as Map)['token'] : null);
      final nextRefresh = data['refreshToken'] ??
          (session is Map ? session['refreshToken'] : null);
      if (nextAccess is! String || nextAccess.isEmpty) return null;
      await saveToken(nextAccess);
      if (nextRefresh is String && nextRefresh.isNotEmpty) {
        await saveRefreshToken(nextRefresh);
      }
      onTokensUpdated?.call(nextAccess);
      return nextAccess;
    } catch (_) {
      return null;
    }
  }

  bool _accessUsable(String token) {
    try {
      final parts = token.split('.');
      if (parts.length < 2) return false;
      var payload = parts[1].replaceAll('-', '+').replaceAll('_', '/');
      while (payload.length % 4 != 0) {
        payload += '=';
      }
      final decoded = jsonDecode(utf8.decode(base64.decode(payload)));
      if (decoded is! Map) return false;
      final exp = decoded['exp'];
      if (exp is! num) return true;
      final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      return exp > now + 30;
    } catch (_) {
      return false;
    }
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
    await prefs.remove(_refreshKey);
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

        await storeSessionTokens(sessionData);
        if (user != null) {
          await saveUser(user);
        }

        return {'success': true, 'user': user, 'session': session};
      } else {
        if (response.statusCode == 429) {
          final retry = int.tryParse(response.headers['retry-after'] ?? '') ?? 60;
          return {
            'success': false,
            'retryAfter': retry,
            'message': data['message'] as String? ?? 'Too many requests, please try again later',
          };
        }
        // Check for email verification pending
        if (data['emailVerificationPending'] == true ||
            data['emailVerificationRequired'] == true ||
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

  // Public signup email check. Same response as the website.
  Future<Map<String, dynamic>> checkEmail(String email) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/v2/users/check-email').replace(
        queryParameters: {'email': email.trim().toLowerCase()},
      );
      final response = await ApiClient.get(uri);
      final data = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;
      return {
        'success': response.statusCode == 200 && data['status'] == true,
        'available': data['available'] == true,
        'pending': data['pending'] == true,
        'message': data['message'] as String?,
      };
    } catch (e) {
      return {'success': false, 'available': false, 'message': e.toString()};
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

        await storeSessionTokens(sessionData);
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

  Future<Map<String, dynamic>> _parseJsonResponse(http.Response response) async {
    final body = response.body;
    if (body.isEmpty) {
      return {'success': false, 'message': 'Empty response from server'};
    }
    final data = jsonDecode(body) as Map<String, dynamic>;
    final ok = response.statusCode >= 200 &&
        response.statusCode < 300 &&
        data['status'] == true;
    return {
      'success': ok,
      'message': data['message'] as String? ??
          (ok ? 'Success' : 'Request failed'),
      ...data,
    };
  }

  Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim()}),
      );
      return _parseJsonResponse(response);
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> verifyResetCode({
    required String email,
    required String code,
  }) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/verify-reset-code'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim(), 'code': code.trim()}),
      );
      final parsed = await _parseJsonResponse(response);
      parsed['codeValid'] = parsed['codeValid'] == true;
      return parsed;
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email.trim(),
          'code': code.trim(),
          'newPassword': newPassword,
        }),
      );
      return _parseJsonResponse(response);
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> socialProviders() async {
    try {
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/app-settings/oauth-public'),
      );
      final parsed = await _parseJsonResponse(response);
      final data = parsed['data'];
      if (data is Map) {
        return {
          'google': data['google'] == true,
          'discord': data['discord'] == true,
        };
      }
      return {'google': false, 'discord': false};
    } catch (_) {
      return {'google': false, 'discord': false};
    }
  }

  Future<Map<String, dynamic>> startSocial(String provider) async {
    try {
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/oauth/$provider/app'),
      );
      return _parseJsonResponse(response);
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> pollSocial(String handoff) async {
    try {
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/oauth/handoff/$handoff'),
      );
      final parsed = await _parseJsonResponse(response);
      if (parsed['pending'] == true || parsed['success'] != true) return parsed;
      final sessionData = parsed['session'];
      final userData = parsed['user'];
      if (sessionData is Map && sessionData['accessToken'] is String) {
        final session = SessionModel.fromJson(Map<String, dynamic>.from(sessionData));
        final user = userData is Map
            ? UserModel.fromJson(Map<String, dynamic>.from(userData))
            : null;
        await storeSessionTokens(Map<String, dynamic>.from(sessionData));
        if (user != null) await saveUser(user);
        parsed['session'] = session;
        parsed['user'] = user;
      }
      return parsed;
    } catch (e) {
      return {
        'success': false,
        'pending': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }
}
