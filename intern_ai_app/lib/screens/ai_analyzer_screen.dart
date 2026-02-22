import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class AIAnalyzerScreen extends StatefulWidget {
  const AIAnalyzerScreen({super.key});

  @override
  State<AIAnalyzerScreen> createState() => _AIAnalyzerScreenState();
}

class _AIAnalyzerScreenState extends State<AIAnalyzerScreen> {
  late final ApiService _api;
  final _jdController = TextEditingController();
  Map<String, dynamic>? _result;
  bool _isAnalyzing = false;
  bool _didInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_didInit) {
      _api = Provider.of<AuthProvider>(context, listen: false).api;
      _didInit = true;
    }
  }

  @override
  void dispose() {
    _jdController.dispose();
    super.dispose();
  }

  Future<void> _analyze() async {
    if (_jdController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please paste a job description')),
      );
      return;
    }
    setState(() {
      _isAnalyzing = true;
      _result = null;
    });
    try {
      final result = await _api.analyzeJD(_jdController.text.trim());
      setState(() {
        _result = result;
        _isAnalyzing = false;
      });
    } catch (e) {
      setState(() => _isAnalyzing = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Analysis failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Analyzer',
            style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF8B5CF6).withValues(alpha: 0.1),
                    const Color(0xFF3B82F6).withValues(alpha: 0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                ),
              ),
              child: Column(
                children: [
                  const Icon(Icons.psychology_rounded,
                      size: 40, color: Color(0xFF8B5CF6)),
                  const SizedBox(height: 8),
                  Text('Paste a Job Description',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      )),
                  const SizedBox(height: 4),
                  Text(
                    'Get instant AI analysis of your eligibility',
                    style: TextStyle(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Input
            TextField(
              controller: _jdController,
              maxLines: 8,
              decoration: InputDecoration(
                hintText: 'Paste the full job description here...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Analyze Button
            FilledButton.icon(
              onPressed: _isAnalyzing ? null : _analyze,
              icon: _isAnalyzing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.auto_awesome),
              label: Text(_isAnalyzing ? 'Analyzing...' : 'Analyze with AI'),
              style: FilledButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
                backgroundColor: const Color(0xFF8B5CF6),
              ),
            ),

            // Results
            if (_result != null) ...[
              const SizedBox(height: 24),
              _buildResults(context),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildResults(BuildContext context) {
    final theme = Theme.of(context);
    final title = _result!['title'] ?? '';
    final score = _result!['eligibilityScore'] ?? _result!['score'] ?? 0;
    final matched = (_result!['matchedSkills'] as List?) ?? [];
    final missing = (_result!['missingSkills'] as List?) ?? [];
    final summary = _result!['summary'] ?? _result!['analysis'] ?? '';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (title.isNotEmpty) ...[
              Text(title,
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
            ],
            // Score
            Row(
              children: [
                Text(
                  '${score}%',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: (score as num) >= 70
                        ? Colors.green
                        : Colors.orange,
                  ),
                ),
                const SizedBox(width: 8),
                Text('Match',
                    style: TextStyle(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    )),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: score.toDouble() / 100,
                minHeight: 8,
                valueColor: AlwaysStoppedAnimation(
                  score >= 70 ? Colors.green : Colors.orange,
                ),
              ),
            ),
            if (summary.toString().isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(summary.toString(),
                  style: TextStyle(
                    height: 1.5,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                  )),
            ],
            if (matched.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text('✅ Matched Skills',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: matched
                    .map((s) => Chip(
                          label: Text(s.toString(),
                              style: const TextStyle(fontSize: 12)),
                          backgroundColor: Colors.green.withValues(alpha: 0.1),
                          visualDensity: VisualDensity.compact,
                        ))
                    .toList(),
              ),
            ],
            if (missing.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('❌ Missing Skills',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: missing
                    .map((s) => Chip(
                          label: Text(s.toString(),
                              style: const TextStyle(fontSize: 12)),
                          backgroundColor: Colors.red.withValues(alpha: 0.1),
                          visualDensity: VisualDensity.compact,
                        ))
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
