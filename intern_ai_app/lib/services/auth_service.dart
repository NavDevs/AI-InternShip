import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_database/firebase_database.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseDatabase _rtdb = FirebaseDatabase.instance;

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // ──────────── EMAIL / PASSWORD ────────────

  Future<UserCredential> signInWithEmail(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  Future<UserCredential> registerWithEmail({
    required String email,
    required String password,
    required String name,
    String role = 'student',
    String? skills,
  }) async {
    final cred = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    await cred.user?.updateDisplayName(name);

    // Create Firestore profile
    await _firestore.collection('users').doc(cred.user!.uid).set({
      'uid': cred.user!.uid,
      'name': name,
      'email': email,
      'role': role,
      if (skills != null) 'skills': skills,
      'createdAt': DateTime.now().toIso8601String(),
    });

    return cred;
  }

  // ──────────── GOOGLE SIGN-IN ────────────

  Future<UserCredential?> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null; // user cancelled

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCred = await _auth.signInWithCredential(credential);

    // Create Firestore profile if first time
    final userDoc =
        await _firestore.collection('users').doc(userCred.user!.uid).get();
    if (!userDoc.exists) {
      await _firestore.collection('users').doc(userCred.user!.uid).set({
        'uid': userCred.user!.uid,
        'name': userCred.user!.displayName ?? '',
        'email': userCred.user!.email ?? '',
        'role': 'student',
        'createdAt': DateTime.now().toIso8601String(),
      });
    }

    return userCred;
  }

  // ──────────── FIRESTORE PROFILE ────────────

  Stream<DocumentSnapshot> getUserProfileStream(String uid) {
    return _firestore.collection('users').doc(uid).snapshots();
  }

  Future<Map<String, dynamic>?> getUserProfile(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    return doc.data();
  }

  Future<void> updateUserProfile(String uid, Map<String, dynamic> data) async {
    await _firestore.collection('users').doc(uid).update(data);
  }

  // ──────────── RTDB STATUS ────────────

  void setOnlineStatus(String uid) {
    final statusRef = _rtdb.ref('status/$uid');
    statusRef.set({
      'state': 'online',
      'last_changed': DateTime.now().toIso8601String(),
    });
    statusRef.onDisconnect().set({
      'state': 'offline',
      'last_changed': DateTime.now().toIso8601String(),
    });
  }

  // ──────────── SIGN OUT ────────────

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }
}
