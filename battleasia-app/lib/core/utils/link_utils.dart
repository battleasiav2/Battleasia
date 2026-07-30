import 'package:url_launcher/url_launcher.dart';

class LinkUtils {
  LinkUtils._();

  static const String youtubeChannelUrl = 'https://www.youtube.com/@BattleAsia';

  static Future<void> openYoutubeLive() async {
    final uri = Uri.parse(youtubeChannelUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
