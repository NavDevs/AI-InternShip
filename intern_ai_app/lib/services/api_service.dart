import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://ai-internship.onrender.com/api';
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  // ──────────── AUTH ────────────

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String role = 'student',
    String? skills,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        if (skills != null) 'skills': skills,
      }),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getProfile() async {
    final res = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: _headers,
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/auth/profile'),
      headers: _headers,
      body: jsonEncode(data),
    );
    return _handleResponse(res);
  }

  // ──────────── JOBS ────────────

  Future<List<dynamic>> getJobs({
    String? role,
    String? company,
    String? skills,
    String? state,
  }) async {
    final params = <String, String>{};
    if (role != null && role.isNotEmpty) params['role'] = role;
    if (company != null && company.isNotEmpty) params['company'] = company;
    if (skills != null && skills.isNotEmpty) params['skills'] = skills;
    if (state != null && state.isNotEmpty) params['state'] = state;

    final uri = Uri.parse('$baseUrl/jobs').replace(queryParameters: params.isNotEmpty ? params : null);
    final res = await http.get(uri, headers: _headers);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw ApiException(_extractMessage(res));
  }

  Future<List<dynamic>> getLatestJobs() async {
    final res = await http.get(Uri.parse('$baseUrl/jobs/latest'), headers: _headers);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw ApiException(_extractMessage(res));
  }

  Future<List<dynamic>> getLiveJobs() async {
    final res = await http.get(Uri.parse('$baseUrl/jobs/live'), headers: _headers);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw ApiException(_extractMessage(res));
  }

  Future<Map<String, dynamic>> getJob(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/jobs/$id'), headers: _headers);
    return _handleResponse(res);
  }

  // ──────────── AI ────────────

  Future<Map<String, dynamic>> analyzeJD(String jdText) async {
    final res = await http.post(
      Uri.parse('$baseUrl/ai/analyze'),
      headers: _headers,
      body: jsonEncode({'jdText': jdText}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> checkEligibility({
    required Map<String, dynamic> job,
    required List<String> userSkills,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/ai/eligibility'),
      headers: _headers,
      body: jsonEncode({'job': job, 'userSkills': userSkills}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> generateRoadmap(String dreamJob) async {
    final res = await http.post(
      Uri.parse('$baseUrl/ai/roadmap'),
      headers: _headers,
      body: jsonEncode({'dreamJob': dreamJob}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> getInterviewQuestions({
    required String jobRole,
    required String difficulty,
    int count = 10,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/ai/interview-questions'),
      headers: _headers,
      body: jsonEncode({
        'jobRole': jobRole,
        'difficulty': difficulty,
        'count': count,
      }),
    );
    return _handleResponse(res);
  }

  // ──────────── APPLICATIONS ────────────

  Future<List<dynamic>> getApplications() async {
    final res = await http.get(Uri.parse('$baseUrl/applications'), headers: _headers);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw ApiException(_extractMessage(res));
  }

  Future<Map<String, dynamic>> createApplication(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/applications'),
      headers: _headers,
      body: jsonEncode(data),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> updateApplication(String id, Map<String, dynamic> data) async {
    final res = await http.put(
      Uri.parse('$baseUrl/applications/$id'),
      headers: _headers,
      body: jsonEncode(data),
    );
    return _handleResponse(res);
  }

  Future<void> deleteApplication(String id) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/applications/$id'),
      headers: _headers,
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(_extractMessage(res));
    }
  }

  Future<Map<String, dynamic>> getAnalytics() async {
    final res = await http.get(
      Uri.parse('$baseUrl/applications/analytics'),
      headers: _headers,
    );
    return _handleResponse(res);
  }

  // ──────────── HELPERS ────────────

  Map<String, dynamic> _handleResponse(http.Response res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw ApiException(_extractMessage(res));
  }

  String _extractMessage(http.Response res) {
    try {
      final body = jsonDecode(res.body);
      return body['message'] ?? 'Request failed (${res.statusCode})';
    } catch (_) {
      return 'Request failed (${res.statusCode})';
    }
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
