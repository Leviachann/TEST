import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<void> saveAccessToken(String token) async {
    await _prefs?.setString('access_token', token);
  }

  String? getAccessToken() {
    return _prefs?.getString('access_token');
  }

  Future<void> saveRefreshToken(String token) async {
    await _prefs?.setString('refresh_token', token);
  }

  String? getRefreshToken() {
    return _prefs?.getString('refresh_token');
  }

  Future<void> clearUserData() async {
    await _prefs?.clear();
  }

  Future<bool> isLoggedIn() async {
    return getAccessToken() != null;
  }
}