import 'package:battleasia_app/data/models/role_model.dart';

class UserModel {
  final String id;
  final String email;
  final String username;
  final String? inGameUserName;
  final String? countryCode;
  final String? mobileNo;
  final String? pubgId;
  final String? gameServer;
  final String? referralCode;
  final String? twitterLink;
  final String? facebookLink;
  final String? instagramLink;
  final bool? status;
  final String? avatar;
  final int? followers;
  final int? following;
  final String? createdAt;
  final String? updatedAt;
  final RoleModel? role;
  final double? balance;
  // Premium fields
  final bool? isPremium;
  final String? premiumSince;
  final String? premiumExpiresAt;

  UserModel({
    required this.id,
    required this.email,
    required this.username,
    this.inGameUserName,
    this.countryCode,
    this.mobileNo,
    this.pubgId,
    this.gameServer,
    this.referralCode,
    this.twitterLink,
    this.facebookLink,
    this.instagramLink,
    this.status,
    this.avatar,
    this.followers,
    this.following,
    this.createdAt,
    this.updatedAt,
    this.role,
    this.balance,
    this.isPremium,
    this.premiumSince,
    this.premiumExpiresAt,
  });

  /// Returns true if the user currently has an active premium subscription.
  bool get isPremiumActive {
    if (isPremium != true) return false;
    if (premiumExpiresAt == null) return true;
    try {
      return DateTime.parse(premiumExpiresAt!).isAfter(DateTime.now());
    } catch (_) {
      return false;
    }
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      username: json['username'] ?? '',
      inGameUserName: json['inGameUserName'],
      countryCode: json['countryCode'] != null
          ? (json['countryCode'] is int
                ? json['countryCode'].toString()
                : int.tryParse(json['countryCode'].toString())?.toString())
          : null,
      mobileNo: json['mobileNo'],
      pubgId: json['pubgId'],
      gameServer: json['gameServer'],
      referralCode: json['referralCode'],
      twitterLink: json['twitterLink'],
      facebookLink: json['facebookLink'],
      instagramLink: json['instagramLink'],
      status: json['status'] is bool
          ? json['status'] as bool?
          : json['status'] != null
          ? (json['status'].toString().toLowerCase() == 'true')
          : null,
      avatar: json['avatar'],
      followers: json['followers'] != null
          ? (json['followers'] is int
                ? json['followers'] as int
                : int.tryParse(json['followers'].toString()))
          : null,
      following: json['following'] != null
          ? (json['following'] is int
                ? json['following'] as int
                : int.tryParse(json['following'].toString()))
          : null,
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
      role: json['role'] != null && json['role'] is Map
          ? RoleModel.fromJson(json['role'] as Map<String, dynamic>)
          : null,
      balance: json['balance'] != null
          ? (json['balance'] is int
                ? json['balance'].toDouble()
                : json['balance'] as double?)
          : null,
      isPremium: json['isPremium'] != null
          ? (json['isPremium'] is bool
                ? json['isPremium'] as bool
                : json['isPremium'].toString().toLowerCase() == 'true')
          : null,
      premiumSince: json['premiumSince']?.toString(),
      premiumExpiresAt: json['premiumExpiresAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'id': id,
      'email': email,
      'username': username,
      'inGameUserName': inGameUserName,
      'countryCode': countryCode,
      'mobileNo': mobileNo,
      'pubgId': pubgId,
      'gameServer': gameServer,
      'referralCode': referralCode,
      'twitterLink': twitterLink,
      'facebookLink': facebookLink,
      'instagramLink': instagramLink,
      'status': status,
      'avatar': avatar,
      'followers': followers,
      'following': following,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'role': role?.toJson(),
      'balance': balance,
      'isPremium': isPremium,
      'premiumSince': premiumSince,
      'premiumExpiresAt': premiumExpiresAt,
    };
  }
}
