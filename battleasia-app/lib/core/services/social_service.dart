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

  Future<Map<String, dynamic>> viewReel(String reelId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/reels/$reelId/view'),
        headers: headers,
        body: '{}',
      );
      final data = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to record view',
      };
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getStories() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/social/stories'),
        headers: headers,
      );
      final data = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch stories',
      };
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> createStory({
    required String mediaUrl,
    String mediaType = 'image',
    String? caption,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/stories'),
        headers: headers,
        body: jsonEncode({
          'mediaUrl': mediaUrl,
          'mediaType': mediaType,
          if (caption != null && caption.isNotEmpty) 'caption': caption,
        }),
      );
      final data = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;
      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to create story',
      };
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> viewStory(String storyId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/stories/$storyId/view'),
        headers: headers,
        body: '{}',
      );
      final data = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to record story view',
      };
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
    String body, {
    List<String>? attachments,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/messages/$conversationId'),
        headers: headers,
        body: jsonEncode({
          'body': body,
          if (attachments != null && attachments.isNotEmpty)
            'attachments': attachments,
        }),
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

  Future<Map<String, dynamic>> createReel({
    required String videoUrl,
    String? caption,
    String? musicTitle,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/reels'),
        headers: headers,
        body: jsonEncode({
          'videoUrl': videoUrl,
          if (caption != null && caption.isNotEmpty) 'caption': caption,
          if (musicTitle != null && musicTitle.isNotEmpty)
            'musicTitle': musicTitle,
        }),
      );
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> createConversation(String participantId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/messages/conversations'),
        headers: headers,
        body: jsonEncode({'participantId': participantId}),
      );
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> globalSearch(String query) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/social/search').replace(
        queryParameters: {'q': query},
      );
      final response = await ApiClient.get(uri, headers: headers);
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getMessagingSettings() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/social/messaging-settings'),
        headers: headers,
      );
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> blockUser(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/users/$userId/block'),
        headers: headers,
        body: '{}',
      );
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> unblockUser(String userId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.delete(
        Uri.parse('$_baseUrl/api/v2/users/$userId/block'),
        headers: headers,
      );
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> submitReport({
    required String targetType,
    required String targetId,
    required String reason,
    String? details,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/social/reports'),
        headers: headers,
        body: jsonEncode({
          'targetType': targetType,
          'targetId': targetId,
          'reason': reason,
          if (details != null && details.isNotEmpty) 'details': details,
        }),
      );
      return _parseBody(response);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Map<String, dynamic> _parseBody(dynamic response) {
    final responseBody = response.body as String;
    if (responseBody.isEmpty) {
      return {'success': false, 'message': 'Empty response from server'};
    }
    final data = jsonDecode(responseBody) as Map<String, dynamic>;
    if ((response.statusCode == 200 || response.statusCode == 201) &&
        data['status'] == true) {
      return {'success': true, 'data': data['data']};
    }
    return {
      'success': false,
      'message': data['message'] as String? ?? 'Request failed',
    };
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
