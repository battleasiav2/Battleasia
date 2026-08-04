import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';

class FeedService {
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

  /// Get feeds list
  Future<Map<String, dynamic>> getFeeds({
    int page = 1,
    int limit = 20,
    String? categoryId,
    String? search,
    String? feedMode,
    String? sortBy,
  }) async {
    try {
      final headers = await _getHeaders();
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (categoryId != null && categoryId.isNotEmpty) {
        queryParams['categoryId'] = categoryId;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (feedMode != null && feedMode.isNotEmpty) {
        queryParams['feedMode'] = feedMode;
      }
      if (sortBy != null && sortBy.isNotEmpty) {
        queryParams['sortBy'] = sortBy;
      }

      final uri = Uri.parse('$_baseUrl/api/v2/feed').replace(queryParameters: queryParams);
      final response = await ApiClient.get(uri, headers: headers);

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
        'message': data['message'] as String? ?? 'Failed to fetch feeds',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get feed by ID
  Future<Map<String, dynamic>> getFeedById(String feedId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/feed/$feedId'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      // Handle premium access restriction (403)
      if (response.statusCode == 403) {
        return {
          'success': false,
          'statusCode': 403,
          'message': 'This content is available for premium members only',
        };
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'statusCode': response.statusCode,
        'message': data['message'] as String? ?? 'Failed to fetch feed',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Toggle like on a feed
  Future<Map<String, dynamic>> toggleFeedLike(String feedId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/feed/$feedId/like'),
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
        'message': data['message'] as String? ?? 'Failed to toggle like',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Increment feed views
  Future<Map<String, dynamic>> incrementFeedViews(String feedId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/feed/$feedId/view'),
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
        'message': data['message'] as String? ?? 'Failed to increment views',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get explore hub data
  Future<Map<String, dynamic>> getExplore({int page = 1, int limit = 20}) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/feed/explore').replace(
        queryParameters: {'page': '$page', 'limit': '$limit'},
      );
      final response = await ApiClient.get(uri, headers: headers);
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
        'message': data['message'] as String? ?? 'Failed to load explore',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get saved feeds for current user
  Future<Map<String, dynamic>> getSavedFeeds({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/feed/saved/me').replace(
        queryParameters: {'page': '$page', 'limit': '$limit'},
      );
      final response = await ApiClient.get(uri, headers: headers);
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
        'message': data['message'] as String? ?? 'Failed to fetch saved posts',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Toggle save on a feed post
  Future<Map<String, dynamic>> toggleSaveFeed(String feedId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/feed/$feedId/save'),
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
        'message': data['message'] as String? ?? 'Failed to save post',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get feed categories
  Future<Map<String, dynamic>> getFeedCategories() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/feed/categories'),
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
        'message': data['message'] as String? ?? 'Failed to fetch categories',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get feed comments
  Future<Map<String, dynamic>> getFeedComments(
    String feedId, {
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$_baseUrl/api/v2/feed/$feedId/comments')
          .replace(queryParameters: {
        'page': page.toString(),
        'limit': limit.toString(),
      });
      final response = await ApiClient.get(uri, headers: headers);

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
        'message': data['message'] as String? ?? 'Failed to fetch comments',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Add comment to feed
  Future<Map<String, dynamic>> addFeedComment(
    String feedId,
    String content,
  ) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/feed/$feedId/comments'),
        headers: headers,
        body: jsonEncode({'content': content}),
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (data['status'] == true) {
          return {'success': true, 'data': data['data']};
        }
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to add comment',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Create a feed post (description + optional cover image URL).
  Future<Map<String, dynamic>> createFeedPost({
    required String description,
    String? coverUrl,
    List<String>? mediaUrls,
    String postType = 'post',
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/feed'),
        headers: headers,
        body: jsonEncode({
          'description': description,
          if (coverUrl != null && coverUrl.isNotEmpty) 'coverUrl': coverUrl,
          if (mediaUrls != null && mediaUrls.isNotEmpty) 'mediaUrls': mediaUrls,
          'postType': postType,
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
        'message': data['message'] as String? ?? 'Failed to create post',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Upload a single file into a feed-related folder (`feed`, `stories`, `reels`).
  Future<Map<String, dynamic>> uploadMedia(
    String filePath, {
    String folder = 'feed',
  }) async {
    try {
      final token = await _authService.getToken();
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/api/v1/files/upload/$folder'),
      );
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.files.add(await http.MultipartFile.fromPath('file', filePath));

      final streamed = await ApiClient.send(request);
      final response = await http.Response.fromStream(streamed);
      final data = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['status'] == true) {
        final map = data['data'] as Map<String, dynamic>? ?? {};
        // Single upload returns { url } or { files: [{ url }] }
        final url = map['url']?.toString() ??
            ((map['files'] is List && (map['files'] as List).isNotEmpty)
                ? ((map['files'] as List).first as Map)['url']?.toString()
                : null);
        if (url != null && url.isNotEmpty) {
          return {'success': true, 'data': {'url': url}};
        }
      }
      return {
        'success': false,
        'message': data['message'] as String? ?? 'Upload failed',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }
}

