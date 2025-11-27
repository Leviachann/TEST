import 'package:flutter/material.dart';
import '../models/blueprint.dart';
import '../models/rack.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class BlueprintsProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Blueprint> _blueprints = [];
  List<Rack> _blueprintRacks = [];
  bool _isLoading = false;
  String? _error;

  List<Blueprint> get blueprints => _blueprints;
  List<Rack> get blueprintRacks => _blueprintRacks;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchBlueprints() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.blueprints);
      _blueprints = (response.data as List).map((json) => Blueprint.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load blueprints';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchBlueprintRacks(String blueprintId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.get('${ApiConfig.racks}/blueprint/$blueprintId');
      _blueprintRacks = (response.data as List).map((json) => Rack.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _blueprintRacks = [];
      _isLoading = false;
      notifyListeners();
    }
  }

  Blueprint? getBlueprintById(String id) {
    try {
      return _blueprints.firstWhere((b) => b.id == id);
    } catch (e) {
      return null;
    }
  }
}