import 'dart:convert';

import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/utils/api_client.dart';

class SocialService {
  final AuthService _authService = AuthService();

  String get _baseUrl => AppConfig.serverUrl;

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> getReels({int page = 1, int limit = 20}) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/social/reels').replace(
        queryParameters: {'page': '$page', 'limit': '$limit'},
      );
      final response = await ApiClient.get(uri, headers: headers);
      return _parsePaginated(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getConversations({
    int page = 1,
    int limit = 30,
  }) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/social/messages/conversations')
          .replace(queryParameters: {'page': '$page', 'limit': '$limit'});
      final response = await ApiClient.get(uri, headers: headers);
      return _parsePaginated(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getDirectMessages(
    String conversationId, {
    int page = 1,
    int limit = 100,
  }) async {
    try {
      final headers = await _getHeaders();
      final uri =
          Uri.parse('$_baseUrl/api/v2/social/messages/$conversationId').replace(
        queryParameters: {'page': '$page', 'limit': '$limit'},
      );
      final response = await ApiClient.get(uri, headers: headers);
      return _parsePaginated(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> sendDirectMessage(
    String conversationId,
    String body,
  ) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/messages/$conversationId'),
        headers: headers,
        body: jsonEncode({'body': body}),
      );
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to send message',
      };
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Map<String, dynamic> _parsePaginated(dynamic response) {
    final responseBody = response.body as String;
    if (responseBody.isEmpty) {
      return {'success': false, 'message': 'Empty response from server'};
    }
    final data = jsonDecode(responseBody) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['status'] == true) {
      return {'success': true, 'data': data['data']};
    }
    return {
      'success': false,
      'message': data['message'] as String? ?? 'Request failed',
    };
  }
}
