import 'dart:convert';
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/utils/idempotency.dart';
import 'package:battleasia_app/data/models/game_model.dart';

class GamesService {
  final AuthService _authService = AuthService();

  // Get base URL from config
  String get _baseUrl => AppConfig.serverUrl;

  // Get authorization headers
  Future<Map<String, String>> _getHeaders({bool money = false}) async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      if (money) 'Idempotency-Key': newIdempotencyKey(),
    };
  }

  /// Get all games
  /// Returns a map with 'success', 'data' (List<GameModel>), and optional 'message'
  Future<Map<String, dynamic>> getGames() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/games'),
        headers: headers,
      );

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }

      final data = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['status'] == true) {
        final gamesData = data['data'] as List<dynamic>?;
        if (gamesData != null) {
          final games = gamesData
              .map((gameJson) => GameModel.fromJson(gameJson as Map<String, dynamic>))
              .toList();

          return {
            'success': true,
            'data': games,
          };
        }
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch games',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get match history for current user
  /// Returns a map with 'success', 'data' (List of match history items), and optional 'message'
  Future<Map<String, dynamic>> getMatchHistory() async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/games/matches/history/me'),
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
          'data': data['data'],
        };
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

  /// Get matches for a specific game (optional gameId filter)
  Future<Map<String, dynamic>> getMatches({String? gameId}) async {
    try {
      final headers = await _getHeaders();
      String endpoint = '$_baseUrl/api/v2/games/matches';
      if (gameId != null && gameId.isNotEmpty) {
        endpoint += '?gameId=$gameId';
      }

      final response = await ApiClient.get(
        Uri.parse(endpoint),
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
          'data': data['data'],
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch matches',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get match detail by ID
  Future<Map<String, dynamic>> getMatchDetail(String matchId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/games/matches/$matchId'),
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
          'data': data['data'],
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch match detail',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get room credentials for a joined match (room id + password).
  Future<Map<String, dynamic>> getMatchRoomCredentials(String matchId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/games/matches/$matchId/room'),
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
          'data': data['data'],
        };
      }

      return {
        'success': false,
        'message':
            data['message'] as String? ?? 'Failed to fetch room credentials',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  /// Get match result by ID (for completed matches)
  Future<Map<String, dynamic>> getMatchResult(String matchId) async {
    try {
      final headers = await _getHeaders();
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/games/matches/$matchId/result'),
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
          'data': data['data'],
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to fetch match result',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> _matchAction(
    String matchId,
    String action, {
    String method = 'POST',
    Map<String, dynamic>? body,
    bool money = false,
  }) async {
    try {
      final headers = await _getHeaders(money: money);
      final uri = Uri.parse('$_baseUrl/api/v2/games/matches/$matchId/$action');
      final response = method == 'GET'
          ? await ApiClient.get(uri, headers: headers)
          : await ApiClient.post(uri, headers: headers, body: body == null ? null : jsonEncode(body));
      final responseBody = response.body;
      if (responseBody.isEmpty) {
        return {'success': false, 'message': 'Empty response from server'};
      }
      final data = jsonDecode(responseBody) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == true) {
        return {'success': true, 'data': data['data'], 'message': data['message'] as String?};
      }
      return {'success': false, 'message': data['message'] as String? ?? 'Request failed'};
    } catch (e) {
      return {'success': false, 'message': e.toString().replaceAll('Exception: ', '')};
    }
  }

  Future<Map<String, dynamic>> checkJoin(String matchId) => _matchAction(matchId, 'check-join');

  /// Null means join may continue. A string is the website block message.
  Future<String?> joinBlockReason(String matchId) async {
    final check = await checkJoin(matchId);
    if (check['success'] == true) {
      final data = check['data'];
      if (data is Map && data['canJoin'] == false) {
        final issues = data['issues'];
        if (issues is List) {
          final text = issues.map((item) => item.toString()).where((item) => item.isNotEmpty).join(' · ');
          if (text.isNotEmpty) return text;
        }
        return '';
      }
      return null;
    }
    final message = check['message']?.toString() ?? '';
    if (message.toLowerCase().contains('not found')) return null;
    return message;
  }

  Future<Map<String, dynamic>> leaveMatch(String matchId) =>
      _matchAction(matchId, 'leave', money: true);

  Future<Map<String, dynamic>> setReady(String matchId, bool ready) =>
      _matchAction(matchId, 'ready', body: {'ready': ready});

  Future<Map<String, dynamic>> getMatchChat(String matchId) =>
      _matchAction(matchId, 'chat', method: 'GET');

  Future<Map<String, dynamic>> sendMatchChat(String matchId, String message) =>
      _matchAction(matchId, 'chat', body: {'message': message});

  Future<Map<String, dynamic>> reportPlayer(String matchId, String targetUserId, {String reason = 'collusion'}) =>
      _matchAction(matchId, 'report', body: {'targetUserId': targetUserId, 'reason': reason});

  /// Join a match
  Future<Map<String, dynamic>> joinMatch(String matchId) async {
    try {
      final headers = await _getHeaders(money: true);
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/games/matches/$matchId/join'),
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
          'data': data['data'],
          'message': data['message'] as String?,
        };
      }

      return {
        'success': false,
        'message': data['message'] as String? ?? 'Failed to join match',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }
}

