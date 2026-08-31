import 'dart:convert';

import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/services/auth_service.dart';
import 'package:battleasia_app/core/utils/api_client.dart';

class EngagementService {
  final AuthService _authService = AuthService();

  String get _baseUrl => AppConfig.serverUrl;

  Future<Map<String, String>> _headers() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> _parseResponse(
    dynamic response, {
    required String fallbackMessage,
  }) async {
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
      'message': data['message'] as String? ?? fallbackMessage,
    };
  }

  Future<Map<String, dynamic>> getHome() async {
    try {
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v2/engagement/home'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to load earn hub');
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }

  Future<Map<String, dynamic>> claimMission(String progressId) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/claim/$progressId'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim mission');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> claimStreak() async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/streak/claim'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim streak');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> claimWelcome(String key) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/welcome/claim/$key'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim welcome bonus');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> claimReferralMilestone(String key) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/referral/claim/$key'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim referral milestone');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> claimWeeklyArena() async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/weekly/claim'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim weekly bonus');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> createSquad(String name) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/squad/create'),
        headers: await _headers(),
        body: jsonEncode({'name': name}),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to create squad');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> joinSquad(String inviteCode) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/squad/join'),
        headers: await _headers(),
        body: jsonEncode({'inviteCode': inviteCode}),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to join squad');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> leaveSquad() async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/squad/leave'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to leave squad');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> claimSquad() async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/squad/claim'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim squad bonus');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> claimSeasonPass(int level, String track) async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/season/claim'),
        headers: await _headers(),
        body: jsonEncode({'level': level, 'track': track}),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to claim season reward');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> spinLucky() async {
    try {
      final response = await ApiClient.post(
        Uri.parse('$_baseUrl/api/v2/engagement/spin'),
        headers: await _headers(),
      );
      return _parseResponse(response, fallbackMessage: 'Failed to spin');
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
