import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/suppliers_provider.dart';
import '../providers/categories_provider.dart';
import '../providers/products_provider.dart';
import '../providers/inventories_provider.dart';
import '../providers/blueprints_provider.dart';
import '../providers/racks_provider.dart';
import '../providers/locations_provider.dart';
import '../core/constants/app_colors.dart';
import 'suppliers/suppliers_screen.dart';
import 'categories/categories_screen.dart';
import 'products/products_screen.dart';
import 'inventories/inventories_screen.dart';
import 'blueprints/blueprints_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Widget _currentScreen = const SuppliersScreen();
  String _currentTitle = 'Suppliers';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadAllData();
    });
  }

  Future<void> _loadAllData() async {
    await Future.wait([
      context.read<SuppliersProvider>().fetchSuppliers(),
      context.read<CategoriesProvider>().fetchCategories(),
      context.read<ProductsProvider>().fetchProducts(),
      context.read<InventoriesProvider>().fetchInventories(),
      context.read<BlueprintsProvider>().fetchBlueprints(),
      context.read<RacksProvider>().fetchRacks(),
      context.read<LocationsProvider>().fetchLocations(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_currentTitle),
        centerTitle: false,
      ),
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                color: AppColors.primary,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.warehouse_rounded,
                    size: 60,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Warehouse Mobile',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) => Text(
                      auth.user?.userName ?? '',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _DrawerItem(
                    icon: Icons.business,
                    title: 'Suppliers',
                    onTap: () {
                      setState(() {
                        _currentScreen = const SuppliersScreen();
                        _currentTitle = 'Suppliers';
                      });
                      Navigator.pop(context);
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.category,
                    title: 'Categories',
                    onTap: () {
                      setState(() {
                        _currentScreen = const CategoriesScreen();
                        _currentTitle = 'Categories';
                      });
                      Navigator.pop(context);
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.inventory_2,
                    title: 'Products',
                    onTap: () {
                      setState(() {
                        _currentScreen = const ProductsScreen();
                        _currentTitle = 'Products';
                      });
                      Navigator.pop(context);
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.inventory,
                    title: 'Inventories',
                    onTap: () {
                      setState(() {
                        _currentScreen = const InventoriesScreen();
                        _currentTitle = 'Inventories';
                      });
                      Navigator.pop(context);
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.map,
                    title: 'Blueprints',
                    onTap: () {
                      setState(() {
                        _currentScreen = const BlueprintsScreen();
                        _currentTitle = 'Blueprints';
                      });
                      Navigator.pop(context);
                    },
                  ),
                  const Divider(),
                  _DrawerItem(
                    icon: Icons.logout,
                    title: 'Logout',
                    color: AppColors.error,
                    onTap: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Logout'),
                          content: const Text('Are you sure you want to logout?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('Cancel'),
                            ),
                            ElevatedButton(
                              onPressed: () => Navigator.pop(context, true),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.error,
                              ),
                              child: const Text('Logout'),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true && mounted) {
                        await context.read<AuthProvider>().logout();
                        if (mounted) {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                          );
                        }
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: _currentScreen,
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? color;

  const _DrawerItem({
    required this.icon,
    required this.title,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(
        title,
        style: TextStyle(color: color),
      ),
      onTap: onTap,
    );
  }
}