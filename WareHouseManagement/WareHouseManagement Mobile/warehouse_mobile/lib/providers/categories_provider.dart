import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class CategoriesProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Category> _categories = [];
  List<Product> _categoryProducts = [];
  bool _isLoading = false;
  String? _error;

  List<Category> get categories => _categories;
  List<Product> get categoryProducts => _categoryProducts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchCategories() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.categories);
      _categories = (response.data as List).map((json) => Category.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load categories';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchCategoryProducts(String categoryId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.get('${ApiConfig.products}/category/$categoryId');
      _categoryProducts = (response.data as List).map((json) => Product.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _categoryProducts = [];
      _isLoading = false;
      notifyListeners();
    }
  }

  Category? getCategoryById(String id) {
    try {
      return _categories.firstWhere((c) => c.id == id);
    } catch (e) {
      return null;
    }
  }
}