import 'dart:convert';

import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/utils/api_client.dart';

class LabsService {
  final AuthService _authService = AuthService();
  String get _baseUrl => AppConfig.serverUrl;

  Future<Map<String, String>> _headers() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> _send(String method, String path, {Map<String, dynamic>? body}) async {
    try {
      final headers = await _headers();
      final uri = Uri.parse('$_baseUrl$path');
      final response = method == 'GET'
          ? await ApiClient.get(uri, headers: headers)
          : await ApiClient.post(uri, headers: headers, body: body == null ? null : jsonEncode(body));
      final raw = response.body;
      if (raw.isEmpty) return {'success': false, 'message': 'Empty response from server'};
      final data = jsonDecode(raw) as Map<String, dynamic>;
      if ((response.statusCode == 200 || response.statusCode == 201) && data['status'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {'success': false, 'message': data['message'] as String? ?? 'Request failed'};
    } catch (e) {
      return {'success': false, 'message': e.toString().replaceAll('Exception: ', '')};
    }
  }

  Future<Map<String, dynamic>> flags() => _send('GET', '/api/v2/app-settings/p2');

  Future<Map<String, dynamic>> list(String kind) => _send('GET', '/api/v2/labs/$kind');

  Future<Map<String, dynamic>> create(String kind, Map<String, dynamic> body) => _send('POST', '/api/v2/labs/$kind', body: body);

  Future<Map<String, dynamic>> join(String kind, String id) => _send('POST', '/api/v2/labs/$kind/$id/join');

  Future<Map<String, dynamic>> heart(String kind, String id) => _send('POST', '/api/v2/labs/$kind/$id/heart');

  Future<Map<String, dynamic>> message(String kind, String id, String body) =>
      _send('POST', '/api/v2/labs/$kind/$id/message', body: {'body': body});

  Future<Map<String, dynamic>> gift(String kind, String id, num amount) =>
      _send('POST', '/api/v2/labs/$kind/$id/gift', body: {'amount': amount});

  Future<Map<String, dynamic>> watchEarn(String kind, String id) => _send('POST', '/api/v2/labs/$kind/$id/watch-earn');

  Future<Map<String, dynamic>> resolveDuel(String id, String winnerId) =>
      _send('POST', '/api/v2/labs/duel/$id/resolve', body: {'winnerId': winnerId});

  Future<Map<String, dynamic>> war(String id, String opponentId) =>
      _send('POST', '/api/v2/labs/clan/$id/war', body: {'opponentId': opponentId});

  Future<Map<String, dynamic>> score(String id) => _send('POST', '/api/v2/labs/fantasy/$id/score');

  Future<Map<String, dynamic>> creators() => _send('GET', '/api/v2/labs/creators');
}
