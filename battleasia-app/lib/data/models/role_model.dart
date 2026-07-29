class RoleModel {
  final String id;
  final String name;
  final List<String> permissions;
  final int level;

  RoleModel({
    required this.id,
    required this.name,
    required this.permissions,
    required this.level,
  });

  factory RoleModel.fromJson(Map<String, dynamic> json) {
    return RoleModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      permissions: json['permissions'] != null
          ? List<String>.from(json['permissions'])
          : [],
      level: json['level'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      '_id': id,
      'name': name,
      'permissions': permissions,
      'level': level,
    };
  }
}

