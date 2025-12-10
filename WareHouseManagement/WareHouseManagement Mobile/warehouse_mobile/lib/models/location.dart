class Location {
  final String id;
  final String name;
  final String rackId;
  final String zone;
  final int row;
  final int grid;
  final int capacity;
  final String? productId;

  Location({
    required this.id,
    required this.name,
    required this.rackId,
    required this.zone,
    required this.row,
    required this.grid,
    required this.capacity,
    this.productId,
  });

  bool get isOccupied => productId != null;

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      rackId: json['rackId'] ?? '',
      zone: json['zone'] ?? '',
      row: json['row'] ?? 0,
      grid: json['grid'] ?? 0,
      capacity: json['capacity'] ?? 0,
      productId: json['productId'],
    );
  }
}