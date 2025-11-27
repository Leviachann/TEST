import 'package:flutter/material.dart';
import '../models/supplier.dart';
import '../models/product.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class SuppliersProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Supplier> _suppliers = [];
  List<Product> _supplierProducts = [];
  bool _isLoading = false;
  String? _error;

  List<Supplier> get suppliers => _suppliers;
  List<Product> get supplierProducts => _supplierProducts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchSuppliers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.suppliers);
      _suppliers = (response.data as List).map((json) => Supplier.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load suppliers';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchSupplierProducts(String supplierId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.get('${ApiConfig.products}/supplier/$supplierId');
      _supplierProducts = (response.data as List).map((json) => Product.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _supplierProducts = [];
      _isLoading = false;
      notifyListeners();
    }
  }

  Supplier? getSupplierById(String id) {
    try {
      return _suppliers.firstWhere((s) => s.id == id);
    } catch (e) {
      return null;
    }
  }
}