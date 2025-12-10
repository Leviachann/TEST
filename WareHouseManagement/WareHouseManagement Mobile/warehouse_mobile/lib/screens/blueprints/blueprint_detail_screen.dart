import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/blueprints_provider.dart';
import '../../core/constants/app_colors.dart';
import '../racks/rack_detail_screen.dart';
import 'navigator_screen.dart';

class BlueprintDetailScreen extends StatefulWidget {
  final String blueprintId;

  const BlueprintDetailScreen({super.key, required this.blueprintId});

  @override
  State<BlueprintDetailScreen> createState() => _BlueprintDetailScreenState();
}

class _BlueprintDetailScreenState extends State<BlueprintDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BlueprintsProvider>().fetchBlueprintRacks(widget.blueprintId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final blueprintsProvider = context.watch<BlueprintsProvider>();
    final blueprint = blueprintsProvider.getBlueprintById(widget.blueprintId);

    if (blueprint == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Blueprint Details')),
        body: const Center(child: Text('Blueprint not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Blueprint Details')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              color: AppColors.primary,
              child: Column(
                children: [
                  const Icon(Icons.map, size: 64, color: Colors.white),
                  const SizedBox(height: 12),
                  Text(
                    blueprint.name,
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
                            'Blueprint Information',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          _DetailRow(label: 'Width', value: '${blueprint.width}m'),
                          const Divider(),
                          _DetailRow(label: 'Height', value: '${blueprint.height}m'),
                          const Divider(),
                          _DetailRow(label: 'Grid Size', value: '${blueprint.gridSize}cm'),
                          const Divider(),
                          _DetailRow(
                            label: 'Floor Area',
                            value: '${(blueprint.width * blueprint.height).toStringAsFixed(2)}m²',
                          ),
                        ],
                      ),
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
                              blueprintId: blueprint.id,
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.navigation),
                      label: const Text('Open Navigator'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Racks in this Blueprint',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Consumer<BlueprintsProvider>(
                    builder: (context, provider, _) {
                      if (provider.isLoading) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(32),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }

                      if (provider.blueprintRacks.isEmpty) {
                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.view_module_outlined,
                                    size: 48,
                                    color: Colors.grey[400],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'No racks in this blueprint',
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
                        itemCount: provider.blueprintRacks.length,
                        itemBuilder: (context, index) {
                          final rack = provider.blueprintRacks[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: const Icon(Icons.view_module, color: AppColors.primary),
                              title: Text(rack.name),
                              subtitle: Text(
                                'Position: (${rack.positionX.toStringAsFixed(1)}, ${rack.positionY.toStringAsFixed(1)}) • ${rack.locationCount} locations',
                              ),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => RackDetailScreen(rackId: rack.id),
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