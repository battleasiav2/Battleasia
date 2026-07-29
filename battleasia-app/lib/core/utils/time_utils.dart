import 'package:intl/intl.dart';

/// Utility functions for time formatting
/// Similar to fToNow in the web version
class TimeUtils {
  TimeUtils._();

  /// Format time as "time ago" (e.g., "2 hours ago", "3 days ago")
  static String timeAgo(String? dateTime) {
    if (dateTime == null || dateTime.isEmpty) {
      return 'N/A';
    }

    try {
      final date = DateTime.parse(dateTime);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 365) {
        final years = (difference.inDays / 365).floor();
        return years == 1 ? '1 year ago' : '$years years ago';
      } else if (difference.inDays > 30) {
        final months = (difference.inDays / 30).floor();
        return months == 1 ? '1 month ago' : '$months months ago';
      } else if (difference.inDays > 0) {
        return difference.inDays == 1
            ? '1 day ago'
            : '${difference.inDays} days ago';
      } else if (difference.inHours > 0) {
        return difference.inHours == 1
            ? '1 hour ago'
            : '${difference.inHours} hours ago';
      } else if (difference.inMinutes > 0) {
        return difference.inMinutes == 1
            ? '1 minute ago'
            : '${difference.inMinutes} minutes ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return dateTime;
    }
  }
}

