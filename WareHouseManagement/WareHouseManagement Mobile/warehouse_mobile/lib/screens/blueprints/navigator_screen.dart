import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math' as math;
import 'package:vector_math/vector_math_64.dart' as vector;
import '../../providers/blueprints_provider.dart';
import '../../models/blueprint.dart';
import '../../models/rack.dart';
import '../../core/constants/app_colors.dart';

class NavigatorScreen extends StatefulWidget {
  final String blueprintId;
  final String? targetRackId;

  const NavigatorScreen({
    super.key,
    required this.blueprintId,
    this.targetRackId,
  });

  @override
  State<NavigatorScreen> createState() => _NavigatorScreenState();
}

class _NavigatorScreenState extends State<NavigatorScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  bool _isNavigating = false;
  List<vector.Vector2> _routePoints = [];
  vector.Vector2 _startPosition = vector.Vector2(0, 0);
  bool _isSelectingStartPoint = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BlueprintsProvider>().fetchBlueprintRacks(widget.blueprintId);
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  bool _isPointInsideRack(vector.Vector2 point, List<Rack> racks) {
    for (final rack in racks) {
      if (point.x >= rack.positionX &&
          point.x <= rack.positionX + rack.width &&
          point.y >= rack.positionY &&
          point.y <= rack.positionY + rack.height) {
        return true;
      }
    }
    return false;
  }

  bool _isPointInsideWarehouse(vector.Vector2 point, Blueprint blueprint) {
    return point.x >= 0 &&
        point.x <= blueprint.width &&
        point.y >= 0 &&
        point.y <= blueprint.height;
  }

  void _handleTapOnMap(TapDownDetails details, Blueprint blueprint, List<Rack> racks, double scale, double offsetX, double offsetY) {
    if (!_isSelectingStartPoint) return;

    // Convert screen coordinates to warehouse coordinates
    final tapX = (details.localPosition.dx - offsetX) / scale;
    final tapY = (details.localPosition.dy - offsetY) / scale;
    final tappedPoint = vector.Vector2(tapX, tapY);

    // Check if the point is valid (inside warehouse and not on a rack)
    if (_isPointInsideWarehouse(tappedPoint, blueprint) &&
        !_isPointInsideRack(tappedPoint, racks)) {
      setState(() {
        _startPosition = tappedPoint;
        _isSelectingStartPoint = false;
        _isNavigating = false;
        _routePoints.clear();
      });
      _animationController.reset();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Start point set at (${tapX.toStringAsFixed(1)}, ${tapY.toStringAsFixed(1)})'),
          duration: const Duration(seconds: 2),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid location! Please tap on an empty space inside the warehouse.'),
          duration: Duration(seconds: 2),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _startNavigation(Rack targetRack) {
    setState(() {
      _isNavigating = true;
      _routePoints = _generateRoute(targetRack);
    });
    _animationController.forward(from: 0.0);
  }

  List<vector.Vector2> _generateRoute(Rack targetRack) {
    final provider = context.read<BlueprintsProvider>();
    final racks = provider.blueprintRacks;
    final gridStep = 1.0;

    final start = _startPosition.clone();
    final target = vector.Vector2(
      targetRack.positionX + targetRack.width / 2,
      targetRack.positionY + targetRack.height / 2,
    );

    bool isBlocked(vector.Vector2 point) {
      for (final rack in racks) {
        if (rack.id == targetRack.id) continue;
        if (point.x >= rack.positionX &&
            point.x <= rack.positionX + rack.width &&
            point.y >= rack.positionY &&
            point.y <= rack.positionY + rack.height) {
          return true;
        }
      }
      return false;
    }

    vector.Vector2 roundGrid(vector.Vector2 v) =>
        vector.Vector2((v.x / gridStep).roundToDouble(), (v.y / gridStep).roundToDouble());

    final visited = <vector.Vector2>{};
    final parentMap = <vector.Vector2, vector.Vector2>{};
    final queue = <vector.Vector2>[];

    queue.add(start);
    visited.add(roundGrid(start));

    final directions = [
      vector.Vector2(1, 0),
      vector.Vector2(-1, 0),
      vector.Vector2(0, 1),
      vector.Vector2(0, -1),
    ];

    while (queue.isNotEmpty) {
      final current = queue.removeAt(0);
      if ((current - target).length <= gridStep) {
        // Reconstruct path
        final path = <vector.Vector2>[];
        var node = current;
        path.add(target.clone());
        while (node != start) {
          path.add(node.clone());
          node = parentMap[node]!;
        }
        path.add(start.clone());
        return path.reversed.toList();
      }

      for (final dir in directions) {
        final neighbor = current + dir * gridStep;
        final gridNeighbor = roundGrid(neighbor);
        if (visited.contains(gridNeighbor)) continue;
        if (isBlocked(neighbor)) continue;

        queue.add(neighbor);
        visited.add(gridNeighbor);
        parentMap[neighbor] = current;
      }
    }

    // No path found
    return [start, target];
  }

  String _getDirections(Rack targetRack) {
    final rackPos = vector.Vector2(
      targetRack.positionX + targetRack.width / 2,
      targetRack.positionY + targetRack.height / 2,
    );

    final horizontalDist = rackPos.x - _startPosition.x;
    final verticalDist = rackPos.y - _startPosition.y;

    final directions = StringBuffer();

    if (horizontalDist.abs() > 0.5) {
      directions.write(
        '${horizontalDist > 0 ? "Go forward" : "Go backward"} ${horizontalDist.abs().toStringAsFixed(1)}m\n',
      );
    }

    if (verticalDist.abs() > 0.5) {
      directions.write(
        'Turn ${verticalDist > 0 ? "left" : "right"}\n',
      );
      directions.write('Go forward ${verticalDist.abs().toStringAsFixed(1)}m\n');
    }

    directions.write('You have arrived at ${targetRack.name}');
    return directions.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Warehouse Navigator'),
        actions: [
          IconButton(
            icon: Icon(_isSelectingStartPoint ? Icons.close : Icons.location_searching),
            onPressed: () {
              setState(() {
                _isSelectingStartPoint = !_isSelectingStartPoint;
                if (_isSelectingStartPoint) {
                  _isNavigating = false;
                  _routePoints.clear();
                  _animationController.reset();
                }
              });
            },
            tooltip: _isSelectingStartPoint ? 'Cancel' : 'Set Start Point',
          ),
          if (_isNavigating)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () {
                setState(() {
                  _isNavigating = false;
                  _routePoints.clear();
                });
                _animationController.reset();
              },
            ),
        ],
      ),
      body: Consumer<BlueprintsProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) return const Center(child: CircularProgressIndicator());

          final blueprint = provider.getBlueprintById(widget.blueprintId);
          if (blueprint == null) return const Center(child: Text('Blueprint not found'));

          Rack? targetRack;
          if (widget.targetRackId != null) {
            try {
              targetRack = provider.blueprintRacks
                  .firstWhere((r) => r.id == widget.targetRackId);
            } catch (_) {
              targetRack = null;
            }
          }

          return Stack(
            children: [
              Positioned.fill(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final scale = math.min(
                      constraints.maxWidth / blueprint.width,
                      constraints.maxHeight / blueprint.height,
                    ) * 0.8;
                    final offsetX = (constraints.maxWidth - blueprint.width * scale) / 2;
                    final offsetY = (constraints.maxHeight - blueprint.height * scale) / 2;

                    return GestureDetector(
                      onTapDown: (details) => _handleTapOnMap(
                        details,
                        blueprint,
                        provider.blueprintRacks,
                        scale,
                        offsetX,
                        offsetY,
                      ),
                      child: InteractiveViewer(
                        boundaryMargin: const EdgeInsets.all(100),
                        minScale: 0.5,
                        maxScale: 4.0,
                        child: AnimatedBuilder(
                          animation: _animation,
                          builder: (context, child) {
                            return CustomPaint(
                              painter: WarehouseMapPainter(
                                blueprint: blueprint,
                                racks: provider.blueprintRacks,
                                targetRackId: widget.targetRackId,
                                routePoints: _routePoints,
                                animationProgress: _animation.value,
                                isNavigating: _isNavigating,
                                startPosition: _startPosition,
                                isSelectingStartPoint: _isSelectingStartPoint,
                              ),
                              size: Size.infinite,
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Start point selection banner
              if (_isSelectingStartPoint)
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Card(
                    color: AppColors.warning.withOpacity(0.95),
                    child: const Padding(
                      padding: EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(Icons.touch_app, color: Colors.white),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Tap on an empty space to set your starting point',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

              // Navigation directions card
              if (_isNavigating && targetRack != null && !_isSelectingStartPoint)
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Card(
                    color: AppColors.info.withOpacity(0.95),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.navigation, color: Colors.white),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Route to ${targetRack.name}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _getDirections(targetRack),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

              // Start navigation button
              if (!_isNavigating && targetRack != null && !_isSelectingStartPoint)
                Positioned(
                  bottom: 32,
                  left: 16,
                  right: 16,
                  child: ElevatedButton.icon(
                    onPressed: () => _startNavigation(targetRack!),
                    icon: const Icon(Icons.navigation),
                    label: const Text('Start Navigation'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      textStyle: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class WarehouseMapPainter extends CustomPainter {
  final Blueprint blueprint;
  final List<Rack> racks;
  final String? targetRackId;
  final List<vector.Vector2> routePoints;
  final double animationProgress;
  final bool isNavigating;
  final vector.Vector2 startPosition;
  final bool isSelectingStartPoint;

  WarehouseMapPainter({
    required this.blueprint,
    required this.racks,
    this.targetRackId,
    required this.routePoints,
    required this.animationProgress,
    required this.isNavigating,
    required this.startPosition,
    required this.isSelectingStartPoint,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final scale = math.min(
      size.width / blueprint.width,
      size.height / blueprint.height,
    ) * 0.8;
    final offsetX = (size.width - blueprint.width * scale) / 2;
    final offsetY = (size.height - blueprint.height * scale) / 2;

    // Draw floor
    final floorPaint = Paint()
      ..color = Colors.grey[200]!
      ..style = PaintingStyle.fill;
    canvas.drawRect(
      Rect.fromLTWH(
        offsetX,
        offsetY,
        blueprint.width * scale,
        blueprint.height * scale,
      ),
      floorPaint,
    );

    // Draw grid
    final gridPaint = Paint()
      ..color = Colors.grey[300]!
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    for (double x = 0; x <= blueprint.width; x += blueprint.gridSize / 100) {
      canvas.drawLine(
        Offset(offsetX + x * scale, offsetY),
        Offset(offsetX + x * scale, offsetY + blueprint.height * scale),
        gridPaint,
      );
    }

    for (double y = 0; y <= blueprint.height; y += blueprint.gridSize / 100) {
      canvas.drawLine(
        Offset(offsetX, offsetY + y * scale),
        Offset(offsetX + blueprint.width * scale, offsetY + y * scale),
        gridPaint,
      );
    }

    // Draw racks
    for (final rack in racks) {
      _drawRack(canvas, rack, offsetX, offsetY, scale, rack.id == targetRackId);
    }

    // Draw start position
    _drawStartPosition(canvas, offsetX, offsetY, scale);

    // Draw route if navigating
    if (isNavigating && routePoints.isNotEmpty) {
      _drawRoute(canvas, offsetX, offsetY, scale);
    }
  }

  void _drawRack(
    Canvas canvas,
    Rack rack,
    double offsetX,
    double offsetY,
    double scale,
    bool isTarget,
  ) {
    final rackPaint = Paint()
      ..color = isTarget ? AppColors.error : const Color(0xFF722ED1)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = isTarget
          ? AppColors.error.withOpacity(0.7)
          : const Color(0xFF531DAB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = isTarget ? 3 : 2;

    final rect = Rect.fromLTWH(
      offsetX + rack.positionX * scale,
      offsetY + rack.positionY * scale,
      rack.width * scale,
      rack.height * scale,
    );

    canvas.drawRect(rect, rackPaint);
    canvas.drawRect(rect, borderPaint);

    final textPainter = TextPainter(
      text: TextSpan(
        text: rack.name,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(
        rect.center.dx - textPainter.width / 2,
        rect.center.dy - textPainter.height / 2,
      ),
    );
  }

  void _drawStartPosition(
    Canvas canvas,
    double offsetX,
    double offsetY,
    double scale,
  ) {
    final startPaint = Paint()
      ..color = AppColors.success
      ..style = PaintingStyle.fill;

    final startX = offsetX + startPosition.x * scale;
    final startY = offsetY + startPosition.y * scale;

    // Draw pulsing circle if selecting start point
    if (isSelectingStartPoint) {
      final pulsePaint = Paint()
        ..color = AppColors.success.withOpacity(0.3)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(startX, startY), 15, pulsePaint);
    }

    canvas.drawCircle(Offset(startX, startY), 10, startPaint);

    final textPainter = TextPainter(
      text: const TextSpan(
        text: 'START',
        style: TextStyle(
          color: AppColors.success,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(startX - textPainter.width / 2, startY + 15),
    );
  }

  void _drawRoute(Canvas canvas, double offsetX, double offsetY, double scale) {
    if (routePoints.length < 2) return;

    final routePaint = Paint()
      ..color = AppColors.info
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;

    final arrowPaint = Paint()
      ..color = AppColors.info
      ..style = PaintingStyle.fill;

    final totalSegments = routePoints.length - 1;
    final animatedSegments = animationProgress * totalSegments;
    final completeSegments = animatedSegments.floor();
    final partialProgress = animatedSegments - completeSegments;

    for (int i = 0; i < completeSegments && i < routePoints.length - 1; i++) {
      final start = Offset(
        offsetX + routePoints[i].x * scale,
        offsetY + routePoints[i].y * scale,
      );
      final end = Offset(
        offsetX + routePoints[i + 1].x * scale,
        offsetY + routePoints[i + 1].y * scale,
      );
      canvas.drawLine(start, end, routePaint);
    }

    if (completeSegments < routePoints.length - 1 && partialProgress > 0) {
      final start = Offset(
        offsetX + routePoints[completeSegments].x * scale,
        offsetY + routePoints[completeSegments].y * scale,
      );
      final end = Offset(
        offsetX + routePoints[completeSegments + 1].x * scale,
        offsetY + routePoints[completeSegments + 1].y * scale,
      );
      final partialEnd = Offset(
        start.dx + (end.dx - start.dx) * partialProgress,
        start.dy + (end.dy - start.dy) * partialProgress,
      );
      canvas.drawLine(start, partialEnd, routePaint);

      _drawArrow(canvas, start, partialEnd, arrowPaint);
    }
  }

  void _drawArrow(Canvas canvas, Offset start, Offset end, Paint paint) {
    final direction = (end - start);
    final angle = math.atan2(direction.dy, direction.dx);
    final arrowSize = 12.0;

    final path = Path();
    path.moveTo(end.dx, end.dy);
    path.lineTo(
      end.dx - arrowSize * math.cos(angle - math.pi / 6),
      end.dy - arrowSize * math.sin(angle - math.pi / 6),
    );
    path.lineTo(
      end.dx - arrowSize * math.cos(angle + math.pi / 6),
      end.dy - arrowSize * math.sin(angle + math.pi / 6),
    );
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(WarehouseMapPainter oldDelegate) => true;
}