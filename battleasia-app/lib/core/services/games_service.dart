import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/data/models/game_model.dart';

class GamesService {
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

  /// Join a match
  Future<Map<String, dynamic>> joinMatch(String matchId) async {
    try {
      final headers = await _getHeaders();
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

