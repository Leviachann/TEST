import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/inventories_provider.dart';
import '../../core/constants/app_colors.dart';
import 'inventory_detail_screen.dart';

class InventoriesScreen extends StatefulWidget {
  const InventoriesScreen({super.key});

  @override
  State<InventoriesScreen> createState() => _InventoriesScreenState();
}

class _InventoriesScreenState extends State<InventoriesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InventoriesProvider>().fetchInventories();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<InventoriesProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading && provider.inventories.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && provider.inventories.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                const SizedBox(height: 16),
                Text(provider.error!),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => provider.fetchInventories(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (provider.inventories.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inventory_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('No inventories found'),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.fetchInventories(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.inventories.length,
            itemBuilder: (context, index) {
              final inventory = provider.inventories[index];
              
              Color stockColor = AppColors.success;
              IconData stockIcon = Icons.check_circle;
              if (inventory.isLowStock) {
                stockColor = AppColors.warning;
                stockIcon = Icons.warning;
              }

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: stockColor.withOpacity(0.2),
                    child: Icon(stockIcon, color: stockColor),
                  ),
                  title: Text(
                    'Inventory #${inventory.id.substring(0, 8)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    'Stock: ${inventory.currentStock} / Reorder: ${inventory.reorderLevel}',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => InventoryDetailScreen(inventoryId: inventory.id),
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