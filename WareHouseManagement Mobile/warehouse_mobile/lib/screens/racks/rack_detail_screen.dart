import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/racks_provider.dart';
import '../../providers/blueprints_provider.dart';
import '../../core/constants/app_colors.dart';
import '../blueprints/navigator_screen.dart';
import '../locations/location_detail_screen.dart';

class RackDetailScreen extends StatefulWidget {
  final String rackId;

  const RackDetailScreen({super.key, required this.rackId});

  @override
  State<RackDetailScreen> createState() => _RackDetailScreenState();
}

class _RackDetailScreenState extends State<RackDetailScreen> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final racksProvider = context.read<RacksProvider>();
      
      if (racksProvider.getRackById(widget.rackId) == null) {
        await racksProvider.fetchRackById(widget.rackId);
      }

      racksProvider.fetchRackLocations(widget.rackId);

      final blueprintsProvider = context.read<BlueprintsProvider>();
      if (blueprintsProvider.blueprints.isEmpty) {
        blueprintsProvider.fetchBlueprints();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final racksProvider = context.watch<RacksProvider>();
    final rack = racksProvider.getRackById(widget.rackId);

    if (rack == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Rack Details')),
        body: const Center(child: Text('Rack not found')),
      );
    }

    final blueprintsProvider = context.watch<BlueprintsProvider>();
    final blueprint = blueprintsProvider.getBlueprintById(rack.blueprintId);

    return Scaffold(
      appBar: AppBar(title: const Text('Rack Details')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              color: const Color(0xFF722ED1),
              child: Column(
                children: [
                  const Icon(Icons.view_module, size: 64, color: Colors.white),
                  const SizedBox(height: 12),
                  Text(
                    rack.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Rack Information',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          _DetailRow(
                            label: 'Position X',
                            value: '${rack.positionX.toStringAsFixed(1)}m',
                          ),
                          const Divider(),
                          _DetailRow(
                            label: 'Position Y',
                            value: '${rack.positionY.toStringAsFixed(1)}m',
                          ),
                          const Divider(),
                          _DetailRow(
                            label: 'Dimensions',
                            value: '${rack.width}m × ${rack.height}m',
                          ),
                          const Divider(),
                          _DetailRow(label: 'Rows', value: '${rack.rows}'),
                          const Divider(),
                          _DetailRow(label: 'Grids', value: '${rack.grids}'),
                          const Divider(),
                          _DetailRow(
                            label: 'Total Locations',
                            value: '${rack.locationCount}',
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (blueprint != null)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.map, color: AppColors.primary),
                        title: const Text('View Blueprint'),
                        subtitle: Text(blueprint.name),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.pop(context);
                        },
                      ),
                    ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => NavigatorScreen(
                              blueprintId: rack.blueprintId,
                              targetRackId: rack.id,
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.navigation),
                      label: const Text('Navigate to This Rack'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Locations in this Rack',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Consumer<RacksProvider>(
                    builder: (context, provider, _) {
                      if (provider.isLoading) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(32),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }

                      if (provider.rackLocations.isEmpty) {
                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.location_off_outlined,
                                    size: 48,
                                    color: Colors.grey[400],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'No locations in this rack',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }

                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: provider.rackLocations.length,
                      itemBuilder: (context, index) {
                        final location = provider.rackLocations[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: const Icon(Icons.location_on, color: AppColors.primary),
                            title: Text(location.name),
                            subtitle: Text('Row ${location.row} • Grid ${location.grid}'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => LocationDetailScreen(locationId: location.id),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    );

                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
