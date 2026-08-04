import 'dart:convert';
import 'package:battleasia_app/core/config/app_config.dart';
import 'package:battleasia_app/core/utils/api_client.dart';
import 'package:battleasia_app/data/models/public_dashboard_model.dart';

/// Public marketing dashboard — same data as web `/dashboard` pulse widgets.
class PublicDashboardService {
  String get _baseUrl => AppConfig.serverUrl;

  Future<Map<String, dynamic>> fetchDashboard() async {
    try {
      final response = await ApiClient.get(
        Uri.parse('$_baseUrl/api/v3/public/dashboard'),
      );
      final body = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && body['status'] == true) {
        final data = body['data'];
        if (data is Map<String, dynamic>) {
          return {
            'success': true,
            'data': PublicDashboardStats.fromJson(data),
          };
        }
        if (data is Map) {
          return {
            'success': true,
            'data': PublicDashboardStats.fromJson(
              Map<String, dynamic>.from(data),
            ),
          };
        }
      }

      return {
        'success': false,
        'message': body['message']?.toString() ?? 'Failed to load dashboard',
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString().replaceAll('Exception: ', ''),
      };
    }
  }
}
