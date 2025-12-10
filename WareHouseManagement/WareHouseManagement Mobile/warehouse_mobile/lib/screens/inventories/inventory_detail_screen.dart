import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/inventories_provider.dart';
import '../../providers/products_provider.dart';
import '../../providers/locations_provider.dart';
import '../../core/constants/app_colors.dart';
import '../products/product_detail_screen.dart';
import '../locations/location_detail_screen.dart';

class InventoryDetailScreen extends StatefulWidget {
  final String inventoryId;

  const InventoryDetailScreen({super.key, required this.inventoryId});

  @override
  State<InventoryDetailScreen> createState() => _InventoryDetailScreenState();
}

class _InventoryDetailScreenState extends State<InventoryDetailScreen> {
  final _stockController = TextEditingController();

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final productsProvider = context.read<ProductsProvider>();
      if (productsProvider.products.isEmpty) {
        await productsProvider.fetchProducts();
      }

      final locationsProvider = context.read<LocationsProvider>();
      if (locationsProvider.locations.isEmpty) {
        await locationsProvider.fetchLocations();
      }
    });
  }

  @override
  void dispose() {
    _stockController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final inventoriesProvider = context.watch<InventoriesProvider>();
    final inventory = inventoriesProvider.getInventoryById(widget.inventoryId);

    if (inventory == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Inventory Details')),
        body: const Center(child: Text('Inventory not found')),
      );
    }

    _stockController.text = inventory.currentStock.toString();

    final productsProvider = context.watch<ProductsProvider>();
    final product = productsProvider.getProductById(inventory.productId);

    final locationsProvider = context.watch<LocationsProvider>();
    final location = locationsProvider.getLocationById(inventory.locationId);

    Color stockColor = AppColors.success;
    String stockStatus = 'Normal';
    if (inventory.isLowStock) {
      stockColor = AppColors.warning;
      stockStatus = 'Low Stock';
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Inventory Details')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              color: stockColor,
              child: Column(
                children: [
                  const Icon(Icons.inventory, size: 64, color: Colors.white),
                  const SizedBox(height: 12),
                  Text(
                    'Inventory #${inventory.id.substring(0, 8)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      stockStatus,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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
                            'Stock Information',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          _DetailRow(
                            label: 'Current Stock',
                            value: '${inventory.currentStock}',
                          ),
                          const Divider(),
                          _DetailRow(
                            label: 'Reorder Level',
                            value: '${inventory.reorderLevel}',
                          ),
                          const Divider(),
                          _DetailRow(
                            label: 'Units On Order',
                            value: '${inventory.unitsOnOrder}',
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    color: AppColors.primary.withOpacity(0.1), 
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.edit, color: AppColors.primary),
                              SizedBox(width: 8),
                              Text(
                                'Update Stock',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _stockController,
                            decoration: InputDecoration(
                              labelText: 'New Stock Level',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: inventoriesProvider.isLoading
                                  ? null
                                  : () async {
                                      final newStock = int.tryParse(_stockController.text);
                                      if (newStock == null || newStock < 0) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Please enter a valid positive number'),
                                            backgroundColor: AppColors.error,
                                          ),
                                        );
                                        return;
                                      }

                                      final success = await inventoriesProvider.updateStock(
                                        inventory.id,
                                        newStock,
                                      );

                                      if (!mounted) return;

                                      if (success) {
                                        await context.read<ProductsProvider>().fetchProducts();
                                        
                                        if (!mounted) return;
                                        
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Stock updated successfully'),
                                            backgroundColor: AppColors.success,
                                          ),
                                        );
                                      } else {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Failed to update stock'),
                                            backgroundColor: AppColors.error,
                                          ),
                                        );
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                              child: inventoriesProvider.isLoading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : const Text('Update Stock'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Quick Actions',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  
                  if (product != null)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.inventory_2, color: AppColors.primary),
                        title: const Text('View Product'),
                        subtitle: Text(product.name),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailScreen(productId: product.id),
                            ),
                          );
                        },
                      ),
                    ),
                  
                  if (location != null)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.location_on, color: AppColors.info),
                        title: const Text('View Location'),
                        subtitle: Text('${location.name} • Zone ${location.zone}'),
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
                    ),
                  
                  const SizedBox(height: 32),
                ],
              ),
            ),
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