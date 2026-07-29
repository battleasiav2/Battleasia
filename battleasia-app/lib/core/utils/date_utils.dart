import 'package:intl/intl.dart';

/// Utility functions for date and time formatting
/// Similar to fDateTime in the web version
class DateUtils {
  DateUtils._();

  /// Format date and time
  /// Format: 'DD/MM/YYYY hh:mm a' (e.g., "03/11/2025 12:23 PM")
  static String formatDateTime(
    String? dateTime, {
    String format = 'dd/MM/yyyy hh:mm a',
  }) {
    if (dateTime == null || dateTime.isEmpty) {
      return 'N/A';
    }

    try {
      final date = DateTime.parse(dateTime);
      return DateFormat(format).format(date);
    } catch (e) {
      return dateTime;
    }
  }

  /// Format date only
  static String formatDate(String? dateTime, {String format = 'dd/MM/yyyy'}) {
    if (dateTime == null || dateTime.isEmpty) {
      return 'N/A';
    }

    try {
      final date = DateTime.parse(dateTime);
      return DateFormat(format).format(date);
    } catch (e) {
      return dateTime;
    }
  }

  /// Format time only
  static String formatTime(String? dateTime, {String format = 'hh:mm a'}) {
    if (dateTime == null || dateTime.isEmpty) {
      return 'N/A';
    }

    try {
      final date = DateTime.parse(dateTime);
      return DateFormat(format).format(date);
    } catch (e) {
      return dateTime;
    }
  }
}
