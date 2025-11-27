import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/products_provider.dart';
import '../../providers/inventories_provider.dart';
import '../../core/constants/app_colors.dart';
import 'product_detail_screen.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductsProvider>().fetchProducts();
      context.read<InventoriesProvider>().fetchInventories();
    });
  }

  @override
  Widget build(BuildContext context) {
    final productsProvider = context.watch<ProductsProvider>();
    final inventoriesProvider = context.watch<InventoriesProvider>();

    if ((productsProvider.isLoading && productsProvider.products.isEmpty) ||
        (inventoriesProvider.isLoading && inventoriesProvider.inventories.isEmpty)) {
      return const Center(child: CircularProgressIndicator());
    }

    if (productsProvider.error != null && productsProvider.products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text(productsProvider.error!),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                productsProvider.fetchProducts();
                inventoriesProvider.fetchInventories();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (productsProvider.products.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No products found'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await Future.wait([
          productsProvider.fetchProducts(),
          inventoriesProvider.fetchInventories(),
        ]);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: productsProvider.products.length,
        itemBuilder: (context, index) {
          final product = productsProvider.products[index];
          
          final actualStock = productsProvider.getProductStock(
            product.id,
            inventoriesProvider.inventories,
          );
          
          final isOutOfStock = productsProvider.isProductOutOfStock(
            product.id,
            inventoriesProvider.inventories,
          );
          
          final isLowStock = productsProvider.isProductLowStock(
            product.id,
            inventoriesProvider.inventories,
          );

          Color stockColor = AppColors.success;
          IconData stockIcon = Icons.inventory_2;
          
          if (isOutOfStock) {
            stockColor = AppColors.error;
            stockIcon = Icons.remove_circle_outline;
          } else if (isLowStock) {
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
                product.name,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        isOutOfStock 
                            ? Icons.cancel 
                            : isLowStock 
                                ? Icons.warning_amber 
                                : Icons.check_circle,
                        size: 16,
                        color: stockColor,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Stock: $actualStock',
                        style: TextStyle(
                          color: stockColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  if (product.sku != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text('SKU: ${product.sku}'),
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
          );
        },
      ),
    );
  }
}