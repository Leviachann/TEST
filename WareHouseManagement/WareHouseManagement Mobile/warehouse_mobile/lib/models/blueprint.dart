class Blueprint {
  final String id;
  final String name;
  final double width;
  final double height;
  final int gridSize;

  Blueprint({
    required this.id,
    required this.name,
    required this.width,
    required this.height,
    required this.gridSize,
  });

  factory Blueprint.fromJson(Map<String, dynamic> json) {
    return Blueprint(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      width: (json['width'] ?? 0).toDouble(),
      height: (json['height'] ?? 0).toDouble(),
      gridSize: json['gridSize'] ?? 100,
    );
  }
}