import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/blueprints_provider.dart';
import '../../core/constants/app_colors.dart';
import 'blueprint_detail_screen.dart';

class BlueprintsScreen extends StatefulWidget {
  const BlueprintsScreen({super.key});

  @override
  State<BlueprintsScreen> createState() => _BlueprintsScreenState();
}

class _BlueprintsScreenState extends State<BlueprintsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BlueprintsProvider>().fetchBlueprints();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<BlueprintsProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading && provider.blueprints.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && provider.blueprints.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                const SizedBox(height: 16),
                Text(provider.error!),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => provider.fetchBlueprints(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (provider.blueprints.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.map_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('No blueprints found'),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.fetchBlueprints(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.blueprints.length,
            itemBuilder: (context, index) {
              final blueprint = provider.blueprints[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.map, color: Colors.white),
                  ),
                  title: Text(
                    blueprint.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    '${blueprint.width}m × ${blueprint.height}m',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => BlueprintDetailScreen(blueprintId: blueprint.id),
                      ),
                    );
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }
}