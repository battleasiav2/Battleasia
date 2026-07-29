class GameModeModel {
  final String title;
  final String description;
  final String icon;
  final int color;
  final List<GameModeFeature> features;

  GameModeModel({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.features,
  });
}

class GameModeFeature {
  final String text;
  final String icon;

  GameModeFeature({
    required this.text,
    required this.icon,
  });
}
