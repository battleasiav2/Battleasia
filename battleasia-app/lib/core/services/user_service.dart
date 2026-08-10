import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';

class UserService {
  final AuthService _authService = AuthService();

  // Get base URL from config
  String get _baseUrl => AppConfig.serverUrl;

  // Get authorization headers
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Get headers for multipart/form-data
  Future<Map<String, String>> _getMultipartHeaders() async {
    final token = await _authService.getToken();
    return {if (token != null) 'Authorization': 'Bearer $token'};
  }

  /// Get match history for current user
  Future<Map<String, dynamic>> getMatchHistory() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/match-history'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch match history',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Fetch the current user's live profile (including latest balance) from the server.
  /// Uses GET /api/v2/users/me — requires a valid auth token.
  Future<Map<String, dynamic>> getMe() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/me'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data'] ?? data['user']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch user profile',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile({
    required String username,
    required String email,
    String? countryCode,
    String? mobileNo,
    String? pubgId,
    String? gameServer,
    String? referralCode,
    String? avatar,
    String? twitterLink,
    String? facebookLink,
    String? instagramLink,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.put(
        Uri.parse('$_baseUrl/api/v2/users/me'),
        headers: headers,
        body: jsonEncode({
          'username': username,
          'email': email,
          if (countryCode != null) 'countryCode': countryCode,
          if (mobileNo != null) 'mobileNo': mobileNo,
          if (pubgId != null) 'pubgId': pubgId,
          if (gameServer != null) 'gameServer': gameServer,
          if (referralCode != null) 'referralCode': referralCode,
          if (avatar != null) 'avatar': avatar,
          if (twitterLink != null) 'twitterLink': twitterLink,
          if (facebookLink != null) 'facebookLink': facebookLink,
          if (instagramLink != null) 'instagramLink': instagramLink,
        }),
      );

      print('response: $response');
      print('---------------------------------');

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {
          'success': true,
          'data': data['data'],
          'user': data['user'],
          'message': data['message'] as String?,
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to update profile',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get referrals for current user
  Future<Map<String, dynamic>> getReferrals() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/referrals'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch referrals',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get referral settings (commission rate)
  Future<Map<String, dynamic>> getReferralSettings() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/referral-settings'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {
          'success': true,
          'commissionRate':
              data['referralSettings']?['commissionRate'] ?? 10,
        };
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch referral settings',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get referral dashboard stats
  Future<Map<String, dynamic>> getReferralStats() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/referral-stats'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch referral stats',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get referral commission history
  Future<Map<String, dynamic>> getReferralCommissions({
    int page = 1,
    int limit = 100,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse(
          '$_baseUrl/api/v2/users/referral-commissions?page=$page&limit=$limit',
        ),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ??
            'Failed to fetch referral commissions',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get withdrawable amount for current user
  Future<Map<String, dynamic>> getWithdrawableAmount() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/withdrawable-amount'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch withdrawable amount',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get currency exchange rates
  Future<Map<String, dynamic>> getCurrencyRates() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v4/shop/coins/public'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch currency rates',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Submit a withdrawal request
  Future<Map<String, dynamic>> submitWithdrawal({
    required String userEmail,
    required String username,
    required double coinAmount,
    required String walletType,
    required String walletAddress,
    required String currencyType,
    required double currencyAmount,
    String? description,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v4/payments/withdrawal-history/submit'),
        headers: headers,
        body: jsonEncode({
          'user_email': userEmail,
          'username': username,
          'coin_amount': coinAmount,
          'wallet_type': walletType,
          'wallet_address': walletAddress,
          'currency_type': currencyType,
          'currency_amount': currencyAmount,
          if (description != null) 'description': description,
        }),
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data'], 'message': data['message']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to submit withdrawal',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get current user's deposit history
  /// Calls GET /api/v4/payments/deposit-history/my-history
  Future<Map<String, dynamic>> getMyDepositHistory({
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse(
          '$_baseUrl/api/v4/payments/deposit-history/my-history?page=$page&limit=$limit',
        ),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        // Returns {data: {results: [...], total, page, limit, totalPages}}
        final results = data['data']?['results'] ?? data['data'] ?? [];
        return {'success': true, 'data': results};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch deposit history',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get current user's withdrawal history
  /// Calls GET /api/v4/payments/withdrawal-history/my-history
  Future<Map<String, dynamic>> getMyWithdrawalHistory() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v4/payments/withdrawal-history/my-history'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        // Returns {data: [...]} (array directly)
        final results = data['data'] is List ? data['data'] as List : [];
        return {'success': true, 'data': results};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch withdrawal history',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get balance history for current user
  Future<Map<String, dynamic>> getBalanceHistory({
    int page = 1,
    int limit = 100,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse(
          '$_baseUrl/api/v2/users/balance-history?page=$page&limit=$limit',
        ),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch balance history',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Upload avatar image
  Future<Map<String, dynamic>> uploadAvatar(
    List<int> imageBytes,
    String fileName,
  ) async {
    try {
      final headers = await _getMultipartHeaders();
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/api/v1/files/upload/avatar'),
      );

      // Add headers
      request.headers.addAll(headers);

      // Add file
      request.files.add(
        http.MultipartFile.fromBytes('file', imageBytes, filename: fileName),
      );

      final streamedResponse = await ApiClient.send(request);
      final response = await http.Response.fromStream(streamedResponse);

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {
          'success': true,
          'data': data['data'],
          'url': data['data']?['url'],
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to upload avatar',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get notifications for current user
  Future<Map<String, dynamic>> getNotifications() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/notifications'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch notifications',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Mark a notification as read
  Future<Map<String, dynamic>> markNotificationRead(
    String notificationId,
  ) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.patch(
        Uri.parse('$_baseUrl/api/v2/notifications/$notificationId/read'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to mark notification as read',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Mark all notifications as read
  Future<Map<String, dynamic>> markAllNotificationsRead() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.patch(
        Uri.parse('$_baseUrl/api/v2/notifications/read-all'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ??
            'Failed to mark all notifications as read',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get leaderboard data
  Future<Map<String, dynamic>> getLeaderboard({String? period}) async {
    try {
      final headers = await _getHeaders();
      final url = period != null
          ? '$_baseUrl/api/v2/users/leaderboard?period=$period'
          : '$_baseUrl/api/v2/users/leaderboard';

      final response = await ApiClient.get(Uri.parse(url), headers: headers);

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch leaderboard',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get user by ID (Public profile)
  Future<Map<String, dynamic>> getUserById(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/$userId'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch user',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get user match history by user ID
  Future<Map<String, dynamic>> getUserMatchHistory(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/$userId/match-history'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch user match history',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Follow a user
  Future<Map<String, dynamic>> followUser(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/$userId/follow'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to follow user',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Unfollow a user
  Future<Map<String, dynamic>> unfollowUser(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.delete(
        Uri.parse('$_baseUrl/api/v2/users/$userId/follow'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to unfollow user',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get user's feeds (for public profile)
  Future<Map<String, dynamic>> getUserFeeds(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/feed/user/$userId'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch user feeds',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get premium plan details (price and duration)
  Future<Map<String, dynamic>> getPremiumDetails() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/premium/details'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {
          'success': true,
          'premiumDuration': data['premium']?['premiumDuration'] ?? 30,
          'premiumPrice': data['premium']?['premiumPrice'] ?? 400,
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch premium details',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Activate (or extend) premium membership using BAC balance
  Future<Map<String, dynamic>> activatePremium() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/premium/activate'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {
          'success': true,
          'user': data['user'],
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to activate premium',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> getFollowers(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/$userId/followers'),
        headers: headers,
      );
      return _parseListResponse(response, 'Failed to fetch followers');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getFollowing(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/users/$userId/following'),
        headers: headers,
      );
      return _parseListResponse(response, 'Failed to fetch following');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getSuggestedFollows({String? contextUserId}) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/users/suggested-follows').replace(
        queryParameters: contextUserId != null && contextUserId.isNotEmpty
            ? {'contextUserId': contextUserId}
            : null,
      );
      final response = await ApiClient.get(uri, headers: headers);
      return _parseListResponse(response, 'Failed to fetch suggestions');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Map<String, dynamic> _parseListResponse(dynamic response, String fallback) {
    final body = response.body as String;
    if (body.isEmpty) {
      return {'success': false, 'message': 'Empty response from server'};
    }
    final data = jsonDecode(body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['status'] == true) {
      return {'success': true, 'data': data['data']};
    }
    return {
      'success': false,
      'message': data['message'] as String? ?? fallback,
    };
  }
}
