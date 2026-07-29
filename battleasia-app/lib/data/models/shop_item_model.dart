/// Coin shop item model — mirrors the backend IShopItem schema and the
/// web ShopView's ShopItem type.
class ShopItemModel {
  final String id;

  /// Coin amount offered (e.g. 100 BAC)
  final int amount;

  /// Badge label: 'Popular' | 'New' | 'Hot' | 'Best' | 'None'
  final String badge;

  /// Badge color hint from server (fallback only; UI uses BADGE_COLOR_MAP)
  final String badgeColor;

  /// Current selling price in USD
  final double price;

  /// Original price before any discount (displayed with strikethrough)
  final double originalPrice;

  /// Premium discount percentage (0 means no discount)
  final double discountPercent;

  /// Coin symbol (default "BAC")
  final String symbol;

  /// Server-relative image path (prefix with AppConfig.serverUrl)
  final String image;

  final bool isActive;

  /// True when the authenticated user holds an active premium subscription.
  /// Populated server-side via optionalAuth middleware.
  final bool isPremiumUser;

  const ShopItemModel({
    required this.id,
    required this.amount,
    required this.badge,
    required this.badgeColor,
    required this.price,
    required this.originalPrice,
    required this.discountPercent,
    required this.symbol,
    required this.image,
    required this.isActive,
    required this.isPremiumUser,
  });

  factory ShopItemModel.fromJson(Map<String, dynamic> json) {
    return ShopItemModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      amount: (json['amount'] is num) ? (json['amount'] as num).toInt() : 0,
      badge: json['badge']?.toString() ?? 'None',
      badgeColor: json['badgeColor']?.toString() ?? 'default',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      originalPrice: (json['originalPrice'] is num)
          ? (json['originalPrice'] as num).toDouble()
          : 0.0,
      discountPercent: (json['discountPercent'] is num)
          ? (json['discountPercent'] as num).toDouble()
          : 0.0,
      symbol: json['symbol']?.toString() ?? 'BAC',
      image: json['image']?.toString() ?? '',
      isActive: json['isActive'] == true,
      isPremiumUser: json['isPremiumUser'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'badge': badge,
      'badgeColor': badgeColor,
      'price': price,
      'originalPrice': originalPrice,
      'discountPercent': discountPercent,
      'symbol': symbol,
      'image': image,
      'isActive': isActive,
      'isPremiumUser': isPremiumUser,
    };
  }
}

