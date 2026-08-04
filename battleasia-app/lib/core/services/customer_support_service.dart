import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/data/models/customer_support_model.dart';

class CustomerSupportService {
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

  // Get headers for multipart/form-data (file uploads)
  Future<Map<String, String>> _getMultipartHeaders() async {
    final token = await _authService.getToken();
    return {
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// List the current user's support tickets.
  Future<Map<String, dynamic>> getMyTickets({
    int page = 1,
    int limit = 50,
    String? status,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (status != null && status.isNotEmpty && status != 'all') {
        queryParams['status'] = status;
      }

      final uri = Uri.parse(
        '$_baseUrl/api/v2/customer-support/conversations/mine',
      ).replace(queryParameters: queryParams);

      final response = await ApiClient.get(uri, headers: headers);
      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == true) {
        final dataMap = data['data'] as Map<String, dynamic>? ?? {};
        final results = dataMap['results'] as List? ?? [];
        final tickets = results.map((item) {
          final map = item is Map<String, dynamic>
              ? item
              : Map<String, dynamic>.from(item as Map);
          return ConversationModel.fromJson(map);
        }).toList();
        return {
          'success': true,
          'data': {
            'results': tickets,
            'total': dataMap['total'] ?? tickets.length,
          },
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to load tickets',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Create a new support ticket (subject + category + first message).
  Future<Map<String, dynamic>> createTicket({
    required String subject,
    required String category,
    required String body,
    List<String>? attachments,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/customer-support/conversation'),
        headers: headers,
        body: jsonEncode({
          'subject': subject,
          'category': category,
          'body': body,
          if (attachments != null && attachments.isNotEmpty)
            'attachments': attachments,
        }),
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;
      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['status'] == true) {
        return {
          'success': true,
          'data': ConversationModel.fromJson(
            data['data'] is Map<String, dynamic>
                ? data['data'] as Map<String, dynamic>
                : {},
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to create ticket',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get or create conversation
  Future<Map<String, dynamic>> getOrCreateConversation() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/customer-support/conversation'),
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
          'data': ConversationModel.fromJson(
            data['data'] is Map<String, dynamic>
                ? data['data'] as Map<String, dynamic>
                : {},
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to get conversation',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get messages for a conversation
  Future<Map<String, dynamic>> getMessages(
    String conversationId, {
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      final uri = Uri.parse(
        '$_baseUrl/api/v2/customer-support/conversation/$conversationId/messages',
      ).replace(queryParameters: queryParams);

      final response = await ApiClient.get(uri, headers: headers);

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        final dataMap = data['data'] as Map<String, dynamic>? ?? {};
        final results = dataMap['results'] as List? ?? [];
        
        // Return raw JSON data instead of parsed objects
        // Let the screen handle the parsing to avoid serialization issues
        return {
          'success': true,
          'data': {
            'results': results, // Return raw JSON list
            'total': dataMap['total'] ?? results.length,
            'page': dataMap['page'] ?? page,
            'limit': dataMap['limit'] ?? limit,
          },
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to get messages',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Send a message
  Future<Map<String, dynamic>> sendMessage({
    required String body,
    required String conversationId,
    List<String>? attachments,
  }) async {
    try {
      final headers = await _getHeaders();
      final bodyData = <String, dynamic>{
        'body': body,
        'conversationId': conversationId,
      };
      if (attachments != null && attachments.isNotEmpty) {
        bodyData['attachments'] = attachments;
      }

      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/customer-support/message'),
        headers: headers,
        body: jsonEncode(bodyData),
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['status'] == true) {
        return {
          'success': true,
          'data': MessageModel.fromJson(
            data['data'] is Map<String, dynamic>
                ? data['data'] as Map<String, dynamic>
                : {},
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to send message',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Close a conversation
  Future<Map<String, dynamic>> closeConversation(String conversationId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.patch(
        Uri.parse(
          '$_baseUrl/api/v2/customer-support/conversation/$conversationId/close',
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
        'message': data['message'] as String? ?? 'Failed to close conversation',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Upload files (for attachments). Always uses multi endpoint for consistent response.
  Future<Map<String, dynamic>> uploadFiles(
    List<String> filePaths, {
    String folder = 'support',
  }) async {
    try {
      if (filePaths.isEmpty) {
        return {'success': false, 'message': 'No files selected'};
      }

      final headers = await _getMultipartHeaders();
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/api/v1/files/upload/$folder/multi'),
      );

      if (headers.containsKey('Authorization')) {
        request.headers['Authorization'] = headers['Authorization']!;
      }

      for (final filePath in filePaths) {
        request.files.add(await http.MultipartFile.fromPath('files', filePath));
      }

      final streamedResponse = await ApiClient.send(request);
      final response = await http.Response.fromStream(streamedResponse);

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['status'] == true) {
        final dataMap = data['data'] as Map<String, dynamic>? ?? {};
        final fileUrls = <String>[];

        final files = dataMap['files'] as List? ?? [];
        for (final file in files) {
          if (file is Map) {
            final url = file['url']?.toString();
            if (url != null && url.isNotEmpty) fileUrls.add(url);
          }
        }

        // Fallback: single-upload shaped response
        final single = dataMap['url']?.toString();
        if (fileUrls.isEmpty && single != null && single.isNotEmpty) {
          fileUrls.add(single);
        }

        return {
          'success': true,
          'data': {'files': fileUrls},
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to upload files',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }
}

