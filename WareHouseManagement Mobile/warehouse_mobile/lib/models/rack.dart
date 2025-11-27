class Rack {
  final String id;
  final String name;
  final String blueprintId;
  final double positionX;
  final double positionY;
  final double width;
  final double height;
  final int rows;
  final int grids;

  Rack({
    required this.id,
    required this.name,
    required this.blueprintId,
    required this.positionX,
    required this.positionY,
    required this.width,
    required this.height,
    required this.rows,
    required this.grids,
  });

  int get locationCount => rows * grids;

  factory Rack.fromJson(Map<String, dynamic> json) {
    return Rack(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      blueprintId: json['blueprintId'] ?? '',
      positionX: (json['positionX'] ?? 0).toDouble(),
      positionY: (json['positionY'] ?? 0).toDouble(),
      width: (json['width'] ?? 0).toDouble(),
      height: (json['height'] ?? 0).toDouble(),
      rows: json['rows'] ?? 0,
      grids: json['grids'] ?? 0,
    );
  }
}