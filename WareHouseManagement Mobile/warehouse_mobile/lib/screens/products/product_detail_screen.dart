import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/products_provider.dart';
import '../../providers/suppliers_provider.dart';
import '../../providers/categories_provider.dart';
import '../../providers/inventories_provider.dart';
import '../../providers/locations_provider.dart';
import '../../core/constants/app_colors.dart';
import '../suppliers/supplier_detail_screen.dart';
import '../categories/category_detail_screen.dart';
import '../inventories/inventory_detail_screen.dart';
import '../locations/location_detail_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productsProvider = context.read<ProductsProvider>();
      if (productsProvider.products.isEmpty) {
        productsProvider.fetchProducts();
      }
      
      final inventoriesProvider = context.read<InventoriesProvider>();
      if (inventoriesProvider.inventories.isEmpty) {
        inventoriesProvider.fetchInventories();
      }

      final locationsProvider = context.read<LocationsProvider>();
      if (locationsProvider.locations.isEmpty) {
        locationsProvider.fetchLocations();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final productsProvider = context.watch<ProductsProvider>();
    
    if (productsProvider.isLoading && productsProvider.products.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Product Details')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final product = productsProvider.getProductById(widget.productId);

    if (product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Product Details')),
        body: const Center(child: Text('Product not found')),
      );
    }

    final inventoriesProvider = context.watch<InventoriesProvider>();
    final inventories = inventoriesProvider.inventories;

    final actualStock = productsProvider.getProductStock(product.id, inventories);
    final isLowStock = productsProvider.isProductLowStock(product.id, inventories);
    final isOutOfStock = productsProvider.isProductOutOfStock(product.id, inventories);

    Color stockColor = AppColors.success;
    String stockStatus = 'In Stock';
    if (isOutOfStock) {
      stockColor = AppColors.error;
      stockStatus = 'Out of Stock';
    } else if (isLowStock) {
      stockColor = AppColors.warning;
      stockStatus = 'Low Stock';
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Product Details')),
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
                  const Icon(Icons.inventory_2, size: 64, color: Colors.white),
                  const SizedBox(height: 12),
                  Text(
                    product.name,
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
                      color: stockColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      stockStatus,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
                            'Product Information',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          _DetailRow(label: 'SKU', value: product.sku ?? 'N/A'),
                          const Divider(),
                          _DetailRow(
                            label: 'Price',
                            value: product.price != null
                                ? NumberFormat.currency(symbol: '\$').format(product.price)
                                : 'N/A',
                          ),
                          const Divider(),
                          _DetailRow(label: 'Stock', value: '$actualStock'),
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
                  if (product.supplierId != null)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.business, color: AppColors.primary),
                        title: const Text('View Supplier'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SupplierDetailScreen(supplierId: product.supplierId!),
                            ),
                          );
                        },
                      ),
                    ),
                  if (product.categoryId != null)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.category, color: AppColors.primary),
                        title: const Text('View Category'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CategoryDetailScreen(categoryId: product.categoryId!),
                            ),
                          );
                        },
                      ),
                    ),
                  
                  Consumer<InventoriesProvider>(
                    builder: (context, inventoriesProvider, _) {
                      final productInventory = inventoriesProvider.inventories
                          .where((inv) => inv.productId == product.id)
                          .firstOrNull;

                      if (productInventory == null) {
                        return const SizedBox.shrink();
                      }

                      return Column(
                        children: [
                          Card(
                            child: ListTile(
                              leading: Icon(
                                productInventory.isLowStock ? Icons.warning : Icons.inventory,
                                color: productInventory.isLowStock ? AppColors.warning : AppColors.success,
                              ),
                              title: const Text('View Inventory'),
                              subtitle: Text(
                                'Stock: ${productInventory.currentStock} / Reorder: ${productInventory.reorderLevel}',
                              ),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => InventoryDetailScreen(
                                      inventoryId: productInventory.id,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          Consumer<LocationsProvider>(
                            builder: (context, locationsProvider, _) {
                              final location = locationsProvider.getLocationById(
                                productInventory.locationId,
                              );

                              if (location == null) {
                                return const SizedBox.shrink();
                              }

                              return Card(
                                child: ListTile(
                                  leading: const Icon(Icons.location_on, color: AppColors.info),
                                  title: const Text('View Location'),
                                  subtitle: Text('${location.name} • Zone ${location.zone}'),
                                  trailing: const Icon(Icons.chevron_right),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => LocationDetailScreen(
                                          locationId: location.id,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
                        ],
                      );
                    },
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