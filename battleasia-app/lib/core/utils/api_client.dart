import 'dart:convert';
import 'package:http/http.dart' as http;

/// Centralized HTTP client wrapper with a 15-second timeout applied to every
/// request. All service classes must use this instead of the raw [http] package
/// so that a slow or unreachable server cannot leave the user stuck on a
/// loading screen indefinitely.
///
/// When a request exceeds [kTimeout], a synthetic HTTP 408 response is returned
/// with a user-friendly JSON body. The existing error-handling logic in each
/// service will pick this up and surface the message to the UI.
class ApiClient {
  // ------------------------------------------------------------------
  // Configuration
  // ------------------------------------------------------------------

  /// Maximum time to wait for any single API response.
  static const Duration kTimeout = Duration(seconds: 15);

  /// Synthetic 408 response returned when a request times out.
  static http.Response get _timeoutResponse => http.Response(
    '{"success":false,"status":false,"message":"Connection timeout. Please check your network connection and try again."}',
    408,
    headers: {'content-type': 'application/json'},
  );

  // ------------------------------------------------------------------
  // HTTP methods
  // ------------------------------------------------------------------

  static Future<http.Response> get(
    Uri url, {
    Map<String, String>? headers,
  }) =>
      http
          .get(url, headers: headers)
          .timeout(kTimeout, onTimeout: () => _timeoutResponse);

  static Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) =>
      http
          .post(url, headers: headers, body: body, encoding: encoding)
          .timeout(kTimeout, onTimeout: () => _timeoutResponse);

  static Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) =>
      http
          .put(url, headers: headers, body: body, encoding: encoding)
          .timeout(kTimeout, onTimeout: () => _timeoutResponse);

  static Future<http.Response> patch(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) =>
      http
          .patch(url, headers: headers, body: body, encoding: encoding)
          .timeout(kTimeout, onTimeout: () => _timeoutResponse);

  static Future<http.Response> delete(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) =>
      http
          .delete(url, headers: headers, body: body, encoding: encoding)
          .timeout(kTimeout, onTimeout: () => _timeoutResponse);

  /// Sends a multipart/streamed request with timeout.
  /// Used for file uploads.
  static Future<http.StreamedResponse> send(http.BaseRequest request) =>
      request
          .send()
          .timeout(kTimeout, onTimeout: () => http.StreamedResponse(
            Stream.value(
              '{"success":false,"status":false,"message":"Upload timeout. Please check your network connection and try again."}'.codeUnits,
            ),
            408,
          ));
}
