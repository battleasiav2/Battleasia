class GameModel {
  final String id;
  final String name;
  final String packageName;
  final String? image;
  final String? logo;
  final bool canCreateChallenge;
  final bool comingSoon;
  final String? idPrefix;
  final String? rules;

  GameModel({
    required this.id,
    required this.name,
    required this.packageName,
    this.image,
    this.logo,
    this.canCreateChallenge = false,
    this.comingSoon = false,
    this.idPrefix,
    this.rules,
  });

  factory GameModel.fromJson(Map<String, dynamic> json) {
    return GameModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      packageName: json['packageName'] ?? '',
      image: json['image'],
      logo: json['logo'],
      canCreateChallenge: json['canCreateChallenge'] ?? false,
      comingSoon: json['comingSoon'] ?? false,
      idPrefix: json['idPrefix'],
      rules: json['rules'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'id': id,
      'name': name,
      'packageName': packageName,
      'image': image,
      'logo': logo,
      'canCreateChallenge': canCreateChallenge,
      'comingSoon': comingSoon,
      'idPrefix': idPrefix,
      'rules': rules,
    };
  }
}
