import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/locations_provider.dart';
import '../../providers/racks_provider.dart';
import '../../providers/products_provider.dart';
import '../../providers/inventories_provider.dart';
import '../../core/constants/app_colors.dart';
import '../products/product_detail_screen.dart';
import '../racks/rack_detail_screen.dart';
import '../inventories/inventory_detail_screen.dart';

class LocationDetailScreen extends StatefulWidget {
  final String locationId;

  const LocationDetailScreen({super.key, required this.locationId});

  @override
  State<LocationDetailScreen> createState() => _LocationDetailScreenState();
}

class _LocationDetailScreenState extends State<LocationDetailScreen> {
  bool _isLoadingRack = false;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final locationsProvider = context.read<LocationsProvider>();
      if (locationsProvider.locations.isEmpty) {
        await locationsProvider.fetchLocations();
      }

      final location = locationsProvider.getLocationById(widget.locationId);
      
      if (location != null) {
        final racksProvider = context.read<RacksProvider>();
        
        final rack = racksProvider.getRackById(location.rackId);
        
        if (rack == null && mounted) {
          setState(() => _isLoadingRack = true);
          await racksProvider.fetchRackById(location.rackId);
          if (mounted) {
            setState(() => _isLoadingRack = false);
          }
        }
      }

      final productsProvider = context.read<ProductsProvider>();
      if (productsProvider.products.isEmpty) {
        await productsProvider.fetchProducts();
      }

      final inventoriesProvider = context.read<InventoriesProvider>();
      if (inventoriesProvider.inventories.isEmpty) {
        await inventoriesProvider.fetchInventories();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final locationsProvider = context.watch<LocationsProvider>();
    
    if (locationsProvider.isLoading && locationsProvider.locations.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Location Details')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final location = locationsProvider.getLocationById(widget.locationId);

    if (location == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Location Details')),
        body: const Center(child: Text('Location not found')),
      );
    }

    final racksProvider = context.watch<RacksProvider>();
    final rack = racksProvider.getRackById(location.rackId);

    final inventoriesProvider = context.watch<InventoriesProvider>();
    final inventory = inventoriesProvider.inventories
        .where((inv) => inv.locationId == location.id)
        .firstOrNull;

    final productsProvider = context.watch<ProductsProvider>();
    final product = inventory != null
        ? productsProvider.getProductById(inventory.productId)
        : null;

    final actualStock = inventory?.currentStock ?? 0;
    final isOccupied = inventory != null;

    return Scaffold(
      appBar: AppBar(title: const Text('Location Details')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              color: isOccupied ? AppColors.success : Colors.grey,
              child: Column(
                children: [
                  Icon(
                    isOccupied ? Icons.location_on : Icons.location_off,
                    size: 64,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    location.name,
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
                      isOccupied ? 'Occupied' : 'Empty',
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
                            'Location Information',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          _DetailRow(label: 'Zone', value: location.zone),
                          const Divider(),
                          _DetailRow(label: 'Row', value: '${location.row}'),
                          const Divider(),
                          _DetailRow(label: 'Grid', value: '${location.grid}'),
                          const Divider(),
                          _DetailRow(label: 'Capacity', value: '${location.capacity}'),
                          const Divider(),
                          _DetailRow(
                            label: 'Status',
                            value: isOccupied ? 'Occupied' : 'Empty',
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
                  if (_isLoadingRack)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                    )
                  else if (rack != null)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.view_module, color: Color(0xFF722ED1)),
                        title: const Text('View Rack'),
                        subtitle: Text('${rack.name} • ${rack.locationCount} locations'),
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
                    ),
                  
                  if (inventory != null)
                    Card(
                      child: ListTile(
                        leading: Icon(
                          inventory.isLowStock ? Icons.warning : Icons.inventory,
                          color: inventory.isLowStock ? AppColors.warning : AppColors.success,
                        ),
                        title: const Text('View Inventory'),
                        subtitle: Text(
                          'Stock: ${inventory.currentStock} / Reorder: ${inventory.reorderLevel}',
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => InventoryDetailScreen(
                                inventoryId: inventory.id,
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                  if (product != null)
                    Card(
                      color: AppColors.info.withOpacity(0.1),
                      child: Column(
                        children: [
                          const ListTile(
                            leading: Icon(Icons.inventory_2, color: AppColors.info),
                            title: Text(
                              'Product Stored Here',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                            title: Text(
                              product.name,
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      inventory!.isLowStock 
                                          ? Icons.warning_amber 
                                          : Icons.check_circle,
                                      size: 16,
                                      color: inventory!.isLowStock 
                                          ? AppColors.warning 
                                          : AppColors.success,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Stock: $actualStock',
                                      style: TextStyle(
                                        color: inventory!.isLowStock 
                                            ? AppColors.warning 
                                            : AppColors.success,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                                if (product.sku != null) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    'SKU: ${product.sku}',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                                if (inventory!.isLowStock)
                                  const Padding(
                                    padding: EdgeInsets.only(top: 4),
                                    child: Row(
                                      children: [
                                        Icon(Icons.warning, size: 16, color: AppColors.warning),
                                        SizedBox(width: 4),
                                        Text(
                                          'Low Stock Alert',
                                          style: TextStyle(
                                            color: AppColors.warning,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
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
                          const SizedBox(height: 8),
                        ],
                      ),
                    )
                  else
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.info_outline, color: Colors.grey[600]),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'This location is currently empty',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ),
                          ],
                        ),
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