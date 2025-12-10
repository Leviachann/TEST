import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../core/services/storage_service.dart';
import '../core/config/api_config.dart';
import '../models/user.dart';

class AuthProvider extends ChangeNotifier {
  final _api = ApiService();
  final _storage = StorageService();

  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> login(String userName, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.post(
        ApiConfig.login,
        data: {'userName': userName, 'password': password},
      );

      final data = response.data;
      await _storage.saveAccessToken(data['accessToken']);
      await _storage.saveRefreshToken(data['refreshToken']);

      _user = User(
        id: data['userId'],
        userName: data['userName'],
        email: data['email'],
        name: data['role'],
      );

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Login failed';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.clearUserData();
    _user = null;
    notifyListeners();
  }

  Future<bool> checkAuth() async {
    return await _storage.isLoggedIn();
  }
}