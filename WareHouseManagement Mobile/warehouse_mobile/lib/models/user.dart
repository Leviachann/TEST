class User {
  final String id;
  final String userName;
  final String email;
  final String name;

  User({
    required this.id,
    required this.userName,
    required this.email,
    required this.name,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['userId'] ?? '',
      userName: json['userName'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? json['role'] ?? '',
    );
  }
}