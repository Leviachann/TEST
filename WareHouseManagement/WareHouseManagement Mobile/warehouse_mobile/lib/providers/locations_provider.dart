import 'package:flutter/material.dart';
import '../models/location.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class LocationsProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Location> _locations = [];
  bool _isLoading = false;
  String? _error;

  List<Location> get locations => _locations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchLocations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.locations);
      _locations = (response.data as List).map((json) => Location.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load locations';
      _isLoading = false;
      notifyListeners();
    }
  }

  List<Location> getLocationsByRackId(String rackId) {
    return _locations.where((location) => location.rackId == rackId).toList();
  }

  Location? getLocationById(String id) {
    try {
      return _locations.firstWhere((l) => l.id == id);
    } catch (e) {
      return null;
    }
  }
}