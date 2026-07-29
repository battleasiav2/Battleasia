class AppConstants {
  // App Info
  static const String appName = 'BattleAsia';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.battleasia.com',
  );

  // Image Paths
  static const String bannerImage = 'assets/images/banner.webp';
  static const String logoImage = 'assets/images/logo.webp';

  // Statistics
  static const Map<String, String> statistics = {
    'activePlayers': '500K+',
    'prizeMoney': '\$2M+',
    'gamesSupported': '15+',
    'tournaments': '24/7',
  };

  // Game Modes
  static const List<Map<String, dynamic>> gameModes = [
    {
      'title': 'Solo Mode',
      'description': 'Play alone and test your skills against other players',
      'icon': '👤',
      'color': 0xFF9333EA,
    },
    {
      'title': 'Duo Mode',
      'description': 'Team up with a partner for double the action',
      'icon': '👥',
      'color': 0xFF9333EA,
    },
    {
      'title': 'Squad Mode',
      'description': 'Form a team of four and dominate the battlefield',
      'icon': '👥',
      'color': 0xFFFF8C00,
    },
    {
      'title': 'TDM Mode',
      'description': 'Fast-paced Team Deathmatch action',
      'icon': '⚡',
      'color': 0xFFFF8C00,
    },
  ];

  // Game Servers
  static const List<Map<String, String>> gameServers = [
    {'value': 'europe', 'label': 'Europe'},
    {'value': 'asia', 'label': 'Asia'},
    {'value': 'south-america', 'label': 'South America'},
    {'value': 'middle-east', 'label': 'Middle East'},
    {'value': 'krjp', 'label': 'KRJP'},
  ];

  // FAQ Data
  static const List<Map<String, String>> faqData = [
    {
      'question': 'No Hacks or Emulators',
      'answer':
          'Using cheats, hacks, or unauthorized tools will result in a permanent ban. Emulators are only allowed if specifically permitted for a tournament.',
    },
    {
      'question': 'Match Join Time',
      'answer':
          'Room ID & Password will be shared 10–15 minutes before the match starts in the app or Telegram group.',
    },
    {
      'question': 'Name Must Match',
      'answer':
          'Your PUBG username must match exactly with the name you entered during registration.',
    },
    {
      'question': 'Kill & Prize Claims',
      'answer':
          'Kills and ranks will be verified via official match result screenshots. Always verify your results before leaving the match.',
    },
    {
      'question': 'No Teaming',
      'answer':
          'Teaming with enemy squads is strictly prohibited and will result in immediate disqualification.',
    },
    {
      'question': 'Payment Rules',
      'answer':
          'All entry fees must be paid before match time. No refunds will be issued after the match starts.',
    },
    {
      'question': 'Disconnect = No Refund',
      'answer':
          "We're not responsible for disconnections, lag, or game glitches. No refunds will be provided for such issues.",
    },
    {
      'question': 'Abusive Behaviour = Ban',
      'answer':
          'Respect other players and staff. Abusive language in voice or chat will result in a permanent ban.',
    },
    {
      'question': 'Prize Distribution',
      'answer':
          'Prize money will be paid within 24 hours to your provided payment method after verification.',
    },
    {
      'question': 'Final Decision',
      'answer':
          'All decisions taken by BattleAsia admins will be final and are not subject to appeal.',
    },
  ];
}
