import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/data/models/shop_item_model.dart';

class ShopService {
  final AuthService _authService = AuthService();

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  String get _baseUrl => AppConfig.serverUrl;

  /// Returns auth + content-type headers.
  /// The Authorization header is omitted when the user is not logged in so the
  /// server falls back to the optionalAuth middleware (no token = no premium).
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Map<String, dynamic> _parseResponse(http.Response response) {
    final body = response.body;
    if (body.isEmpty) return {};
    try {
      return jsonDecode(body) as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }

  // ---------------------------------------------------------------------------
  // Shop items  (GET /api/v4/shop/items)
  // ---------------------------------------------------------------------------

  /// Fetch all active coin shop items from the server.
  ///
  /// The server attaches `isPremiumUser: true/false` to each item based on the
  /// current user's subscription (via optionalAuth). Client-side filtering
  /// (All / Premium / Normal) is done in the UI layer.
  Future<Map<String, dynamic>> getShopItems({
    int page = 1,
    int limit = 50,
    String? search,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final uri = Uri.parse('$_baseUrl/api/v4/shop/items')
          .replace(queryParameters: queryParams);
      final response = await ApiClient.get(uri, headers: headers);
      final data = _parseResponse(response);

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch shop items',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Fetch a single coin shop item by its MongoDB _id.
  Future<Map<String, dynamic>> getShopItemById(String itemId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v4/shop/items/$itemId'),
        headers: headers,
      );
      final data = _parseResponse(response);

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch shop item',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Currency rates  (GET /api/v4/shop/coins)
  // Used in the detail screen to show how much local currency the user pays.
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> getCurrencyRates() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v4/shop/coins'),
        headers: headers,
      );
      final data = _parseResponse(response);

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch rates',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Payment channels  (GET /api/v4/payments/payment-channels/public)
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> getPaymentChannels() async {
    try {
      final response = await ApiClient.get(
        Uri.parse(
            '$_baseUrl/api/v4/payments/payment-channels/public?limit=100'),
      );
      final data = _parseResponse(response);

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch payment channels',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Business wallets  (GET /api/v4/payments/business-wallets/public)
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> getBusinessWallets({
    required String channelId,
    required String currency,
  }) async {
    try {
      final uri = Uri.parse(
              '$_baseUrl/api/v4/payments/business-wallets/public')
          .replace(queryParameters: {
        'limit': '100',
        'channel': channelId,
        'currency': currency.toUpperCase(),
      });

      final response = await ApiClient.get(uri);
      final data = _parseResponse(response);

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch business wallets',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Submit deposit  (POST /api/v4/payments/deposit-history/submit)
  // Requires authentication.
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> submitDeposit({
    required String userEmail,
    required String username,
    required String transactionId,
    required int coinAmount,
    required String paymentCurrency,
    required double paymentAmount,
    required String fromAddress,
    required String paymentChannelId,
    required String toWalletAddress,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v4/payments/deposit-history/submit'),
        headers: headers,
        body: jsonEncode({
          'user_email': userEmail,
          'username': username,
          'transaction_id': transactionId,
          'coin_amount': coinAmount,
          'payment_currency': paymentCurrency.toUpperCase(),
          'payment_amount': paymentAmount,
          'from_address': fromAddress,
          'payment_channel': paymentChannelId,
          'to_wallet_address': toWalletAddress,
        }),
      );
      final data = _parseResponse(response);

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to submit deposit',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }
}

