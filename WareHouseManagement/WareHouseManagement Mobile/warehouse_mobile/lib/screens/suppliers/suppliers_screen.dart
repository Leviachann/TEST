import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/suppliers_provider.dart';
import '../../core/constants/app_colors.dart';
import 'supplier_detail_screen.dart';

class SuppliersScreen extends StatefulWidget {
  const SuppliersScreen({super.key});

  @override
  State<SuppliersScreen> createState() => _SuppliersScreenState();
}

class _SuppliersScreenState extends State<SuppliersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SuppliersProvider>().fetchSuppliers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SuppliersProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading && provider.suppliers.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && provider.suppliers.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                const SizedBox(height: 16),
                Text(provider.error!),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => provider.fetchSuppliers(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (provider.suppliers.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.business_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('No suppliers found'),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.fetchSuppliers(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.suppliers.length,
            itemBuilder: (context, index) {
              final supplier = provider.suppliers[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.business, color: Colors.white),
                  ),
                  title: Text(
                    supplier.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    '${supplier.country}\n${supplier.email}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  isThreeLine: true,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SupplierDetailScreen(supplierId: supplier.id),
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