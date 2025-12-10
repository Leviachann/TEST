import 'package:flutter/material.dart';
import '../models/rack.dart';
import '../models/location.dart';
import '../core/services/api_service.dart';
import '../core/config/api_config.dart';

class RacksProvider extends ChangeNotifier {
  final _api = ApiService();

  List<Rack> _racks = [];
  List<Location> _allLocations = [];
  List<Location> _rackLocations = [];
  bool _isLoading = false;
  String? _error;

  List<Rack> get racks => _racks;
  List<Location> get rackLocations => _rackLocations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchRacks() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.racks);
      _racks = (response.data as List).map((json) => Rack.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load racks';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Rack?> fetchRackById(String rackId) async {
    try {
      final response = await _api.get('${ApiConfig.racks}/$rackId');
      final rack = Rack.fromJson(response.data);
      
      final index = _racks.indexWhere((r) => r.id == rackId);
      if (index != -1) {
        _racks[index] = rack;
      } else {
        _racks.add(rack);
      }
      
      notifyListeners();
      return rack;
    } catch (e) {
      return null;
    }
  }

  Future<void> fetchRackLocations(String rackId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.get(ApiConfig.locations);
      _allLocations = (response.data as List).map((json) => Location.fromJson(json)).toList();
      
      _rackLocations = _allLocations.where((location) => location.rackId == rackId).toList();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _rackLocations = [];
      _isLoading = false;
      notifyListeners();
    }
  }

  Rack? getRackById(String id) {
    try {
      return _racks.firstWhere((r) => r.id == id);
    } catch (e) {
      return null;
    }
  }
}