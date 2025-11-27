class Inventory {
  final String id;
  final String productId;
  final String locationId;
  final int currentStock;
  final int reorderLevel;
  final int unitsOnOrder;

  Inventory({
    required this.id,
    required this.productId,
    required this.locationId,
    required this.currentStock,
    required this.reorderLevel,
    required this.unitsOnOrder,
  });

  bool get isLowStock => currentStock <= reorderLevel;

  factory Inventory.fromJson(Map<String, dynamic> json) {
    return Inventory(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      locationId: json['locationId'] ?? '',
      currentStock: json['currentStock'] ?? 0,
      reorderLevel: json['reorderLevel'] ?? 0,
      unitsOnOrder: json['unitsOnOrder'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'locationId': locationId,
      'currentStock': currentStock,
      'reorderLevel': reorderLevel,
      'unitsOnOrder': unitsOnOrder,
    };
  }

  Inventory copyWith({
    String? id,
    String? productId,
    String? locationId,
    int? currentStock,
    int? reorderLevel,
    int? unitsOnOrder,
  }) {
    return Inventory(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      locationId: locationId ?? this.locationId,
      currentStock: currentStock ?? this.currentStock,
      reorderLevel: reorderLevel ?? this.reorderLevel,
      unitsOnOrder: unitsOnOrder ?? this.unitsOnOrder,
    );
  }
}