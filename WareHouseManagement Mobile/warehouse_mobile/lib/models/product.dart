class Product {
  final String id;
  final String name;
  final String? sku;
  final double? price;
  final int stock;
  final String? categoryId;
  final String? supplierId;

  Product({
    required this.id,
    required this.name,
    this.sku,
    this.price,
    required this.stock,
    this.categoryId,
    this.supplierId,
  });

  bool get isLowStock => stock > 0 && stock <= 10;
  bool get isOutOfStock => stock == 0;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sku: json['sku'],
      price: json['price']?.toDouble(),
      stock: json['stock'] ?? 0,
      categoryId: json['categoryId'],
      supplierId: json['supplierId'],
    );
  }
}