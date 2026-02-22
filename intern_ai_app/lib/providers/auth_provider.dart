import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  User? _firebaseUser;
  Map<String, dynamic>? _profile;
  bool _isLoading = true;
  String? _error;

  User? get firebaseUser => _firebaseUser;
  Map<String, dynamic>? get profile => _profile;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _firebaseUser != null;
  String? get error => _error;
  ApiService get api => _apiService;

  String get displayName =>
      _profile?['name'] ??
      _firebaseUser?.displayName ??
      'User';

  String get email =>
      _profile?['email'] ??
      _firebaseUser?.email ??
      '';

  String get photoUrl => _firebaseUser?.photoURL ?? '';

  String get uid => _firebaseUser?.uid ?? '';

  List<String> get skills {
    final s = _profile?['skills'];
    if (s == null) return [];
    if (s is List) return s.map((e) => e.toString()).toList();
    if (s is String) return s.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    return [];
  }

  String get role => _profile?['role'] ?? 'student';

  AuthProvider() {
    _init();
  }

  void _init() {
    _authService.authStateChanges.listen((user) async {
      _firebaseUser = user;
      if (user != null) {
        // Get token and pass to API service
        final token = await user.getIdToken();
        _apiService.setToken(token);

        // Listen to Firestore profile
        _authService.getUserProfileStream(user.uid).listen((snap) {
          if (snap.exists) {
            _profile = snap.data() as Map<String, dynamic>?;
            notifyListeners();
          }
        });
        _authService.setOnlineStatus(user.uid);
      } else {
        _profile = null;
        _apiService.setToken(null);
      }
      _isLoading = false;
      notifyListeners();
    });

    // Also listen to token refreshes
    FirebaseAuth.instance.idTokenChanges().listen((user) async {
      if (user != null) {
        final token = await user.getIdToken();
        _apiService.setToken(token);
      }
    });
  }

  // Email / Password Login
  Future<bool> loginWithEmail(String email, String password) async {
    try {
      _error = null;
      await _authService.signInWithEmail(email, password);
      return true;
    } on FirebaseAuthException catch (e) {
      _error = _parseFirebaseError(e.code);
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Login failed. Please try again.';
      notifyListeners();
      return false;
    }
  }

  // Email / Password Register
  Future<bool> registerWithEmail({
    required String name,
    required String email,
    required String password,
    String role = 'student',
    String? skills,
  }) async {
    try {
      _error = null;
      await _authService.registerWithEmail(
        email: email,
        password: password,
        name: name,
        role: role,
        skills: skills,
      );
      return true;
    } on FirebaseAuthException catch (e) {
      _error = _parseFirebaseError(e.code);
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Registration failed. Please try again.';
      notifyListeners();
      return false;
    }
  }

  // Google Sign-In
  Future<bool> signInWithGoogle() async {
    try {
      _error = null;
      final result = await _authService.signInWithGoogle();
      return result != null;
    } catch (e) {
      _error = 'Google sign-in failed. Please try again.';
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await _authService.signOut();
    _profile = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  String _parseFirebaseError(String code) {
    switch (code) {
      case 'user-not-found':
        return 'No account found with this email.';
      case 'wrong-password':
        return 'Incorrect password.';
      case 'email-already-in-use':
        return 'An account already exists with this email.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      case 'invalid-email':
        return 'Invalid email address.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
