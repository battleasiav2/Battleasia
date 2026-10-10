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

  /// Returns a fresh access token, or null when the session cannot be renewed.
  /// Registered by [AuthProvider] so a 401 can retry once with a new token.
  static Future<String?> Function()? renewAccess;

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
    bool skipAuthRenew = false,
  }) =>
      _send(
        url,
        headers,
        (next) => http.get(url, headers: next),
        skipAuthRenew: skipAuthRenew,
      );

  static Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
    bool skipAuthRenew = false,
  }) =>
      _send(
        url,
        headers,
        (next) => http.post(url, headers: next, body: body, encoding: encoding),
        skipAuthRenew: skipAuthRenew,
      );

  static Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
    bool skipAuthRenew = false,
  }) =>
      _send(
        url,
        headers,
        (next) => http.put(url, headers: next, body: body, encoding: encoding),
        skipAuthRenew: skipAuthRenew,
      );

  static Future<http.Response> patch(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
    bool skipAuthRenew = false,
  }) =>
      _send(
        url,
        headers,
        (next) => http.patch(url, headers: next, body: body, encoding: encoding),
        skipAuthRenew: skipAuthRenew,
      );

  static Future<http.Response> delete(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
    bool skipAuthRenew = false,
  }) =>
      _send(
        url,
        headers,
        (next) => http.delete(url, headers: next, body: body, encoding: encoding),
        skipAuthRenew: skipAuthRenew,
      );

  static Future<http.Response> _send(
    Uri url,
    Map<String, String>? headers,
    Future<http.Response> Function(Map<String, String>? headers) send, {
    bool skipAuthRenew = false,
  }) async {
    final first = await send(headers).timeout(kTimeout, onTimeout: () => _timeoutResponse);
    if (first.statusCode != 401 || !_canRenew(url, headers, skipAuthRenew)) return first;
    final next = await renewAccess!.call();
    if (next == null || next.isEmpty) return first;
    final retry = Map<String, String>.from(headers ?? {});
    retry['Authorization'] = 'Bearer $next';
    return send(retry).timeout(kTimeout, onTimeout: () => _timeoutResponse);
  }

  static bool _canRenew(Uri url, Map<String, String>? headers, bool skip) {
    if (skip || renewAccess == null) return false;
    if (url.path.contains('/refresh')) return false;
    final auth = headers?['Authorization'] ?? '';
    return auth.startsWith('Bearer ') && auth.length > 7;
  }

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
