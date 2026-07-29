class OrderModel {
  final String id;
  final String orderNo;
  final String productName;
  final String? productImage;
  final double price;
  final String status; // 'pending', 'processing', 'completed', 'cancelled'
  final String date;
  final String? shippingAddress;

  OrderModel({
    required this.id,
    required this.orderNo,
    required this.productName,
    this.productImage,
    required this.price,
    required this.status,
    required this.date,
    this.shippingAddress,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      orderNo: json['orderNo']?.toString() ?? json['orderNumber']?.toString() ?? '',
      productName: json['productName']?.toString() ?? 'Unknown Product',
      productImage: json['productImage']?.toString(),
      price: (json['price'] is num) ? json['price'].toDouble() : 0.0,
      status: json['status']?.toString() ?? 'pending',
      date: json['date']?.toString() ?? json['createdAt']?.toString() ?? '',
      shippingAddress: json['shippingAddress']?.toString(),
    );
  }
}

