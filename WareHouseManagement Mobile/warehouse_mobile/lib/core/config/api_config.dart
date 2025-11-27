class ApiConfig {
  static const String baseUrl = 'http://192.168.0.109:5000/api';
  
  static const String login = '/Auth/login';
  static const String suppliers = '/Suppliers';
  static const String categories = '/Categories';
  static const String products = '/Products';
  static const String inventories = '/Inventories';
  static const String blueprints = '/Blueprints';
  static const String racks = '/Racks';
  static const String locations = '/Locations';
  
  static const Duration timeout = Duration(seconds: 30);
}