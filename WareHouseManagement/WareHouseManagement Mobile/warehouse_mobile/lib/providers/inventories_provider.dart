import 'package:flutter/material.dart';
import '../models/inventory.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class InventoriesProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Inventory> _inventories = [];
  bool _isLoading = false;
  String? _error;

  List<Inventory> get inventories => _inventories;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchInventories() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.inventories);
      _inventories = (response.data as List).map((json) => Inventory.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load inventories';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateStock(String inventoryId, int newStock) async {
    try {
      final currentInventory = getInventoryById(inventoryId);
      if (currentInventory == null) return false;

      final updatedInventory = currentInventory.copyWith(currentStock: newStock);

      await _api.put(
        '${ApiConfig.inventories}/$inventoryId',
        data: updatedInventory.toJson(),
      );

      await fetchInventories();
      return true;
    } catch (e) {
      return false;
    }
  }

  Inventory? getInventoryById(String id) {
    try {
      return _inventories.firstWhere((i) => i.id == id);
    } catch (e) {
      return null;
    }
  }
}