class Supplier {
  final String id;
  final String name;
  final String country;
  final String adress;
  final String email;
  final String phone;

  Supplier({
    required this.id,
    required this.name,
    required this.country,
    required this.adress,
    required this.email,
    required this.phone,
  });

  factory Supplier.fromJson(Map<String, dynamic> json) {
    return Supplier(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      country: json['country'] ?? '',
      adress: json['adress'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
    );
  }
}