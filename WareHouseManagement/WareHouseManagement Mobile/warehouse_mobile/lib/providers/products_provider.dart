import 'package:flutter/material.dart';
import '../models/product.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class ProductsProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Product> _products = [];
  bool _isLoading = false;
  String? _error;

  List<Product> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.products);
      _products = (response.data as List).map((json) => Product.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load products';
      _isLoading = false;
      notifyListeners();
    }
  }

  Product? getProductById(String id) {
    try {
      return _products.firstWhere((p) => p.id == id);
    } catch (e) {
      return null;
    }
  }

  int getProductStock(String productId, List<dynamic> inventories) {
    try {
      final inventory = inventories.firstWhere(
        (inv) => inv.productId == productId,
      );
      return inventory.currentStock;
    } catch (e) {
      return 0;
    }
  }

  bool isProductLowStock(String productId, List<dynamic> inventories) {
    try {
      final inventory = inventories.firstWhere(
        (inv) => inv.productId == productId,
      );
      return inventory.isLowStock;
    } catch (e) {
      return false;
    }
  }

  bool isProductOutOfStock(String productId, List<dynamic> inventories) {
    final stock = getProductStock(productId, inventories);
    return stock == 0;
  }
}