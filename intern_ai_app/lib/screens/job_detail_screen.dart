import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';

class JobDetailScreen extends StatefulWidget {
  final Map<String, dynamic> job;
  const JobDetailScreen({super.key, required this.job});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  late final ApiService _api;
  Map<String, dynamic>? _eligibility;
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

  Future<void> _checkEligibility() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to use AI analysis')),
      );
      return;
    }
    setState(() => _isAnalyzing = true);
    try {
      final result = await _api.checkEligibility(
        job: widget.job,
        userSkills: auth.skills,
      );
      setState(() {
        _eligibility = result;
        _isAnalyzing = false;
      });
    } catch (e) {
      setState(() => _isAnalyzing = false);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Analysis failed: $e')));
    }
  }

  Future<void> _applyToJob() async {
    final auth = context.read<AuthProvider>();
    final jobLink = widget.job['link'];

    if (jobLink != null && jobLink.isNotEmpty) {
      try {
        final Uri url = Uri.parse(jobLink);
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.externalApplication);
        } else {
          throw 'Could not launch $jobLink';
        }
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Could not open job link: $e')));
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No application link available for this job'),
        ),
      );
    }

    // Save to application tracker if logged in
    if (auth.isLoggedIn) {
      try {
        await _api.createApplication({
          'company': widget.job['company'] ?? '',
          'role':
              widget.job['title']?.replaceAll(RegExp(r'<[^>]*>?'), '') ?? '',
          'location': widget.job['location'] ?? '',
          'status': 'Applied',
          'appliedDate': DateTime.now().toIso8601String(),
          'source': widget.job['source'] ?? 'Intern-AI',
        });
      } catch (e) {
        // Silently handle tracker save failure
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final job = widget.job;
    final skills =
        (job['requiredSkills'] as List?)?.map((s) => s.toString()).toList() ??
        [];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          job['title'] ?? 'Job Detail',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Job Header
            Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    Icons.business_rounded,
                    color: theme.colorScheme.primary,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job['title'] ?? '',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        job['company'] ?? '',
                        style: TextStyle(
                          color: theme.colorScheme.onSurface.withValues(
                            alpha: 0.6,
                          ),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Info chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (job['location'] != null)
                  _buildInfoChip(
                    context,
                    Icons.location_on_outlined,
                    job['location'],
                  ),
                if (job['salary'] != null)
                  _buildInfoChip(context, Icons.currency_rupee, job['salary']),
                if (job['type'] != null)
                  _buildInfoChip(context, Icons.work_outline, job['type']),
              ],
            ),
            const SizedBox(height: 24),

            // Description
            Text(
              'Description',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              job['description'] ?? 'No description available.',
              style: TextStyle(
                height: 1.6,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
              ),
            ),
            const SizedBox(height: 24),

            // Required Skills
            if (skills.isNotEmpty) ...[
              Text(
                'Required Skills',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: skills
                    .map(
                      (s) => Chip(
                        label: Text(s),
                        backgroundColor: theme.colorScheme.primary.withValues(
                          alpha: 0.1,
                        ),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),
            ],

            // AI Eligibility Button
            FilledButton.icon(
              onPressed: _isAnalyzing ? null : _checkEligibility,
              icon: _isAnalyzing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.psychology_rounded),
              label: Text(
                _isAnalyzing ? 'Analyzing...' : 'Check AI Eligibility',
              ),
              style: FilledButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
                backgroundColor: const Color(0xFF8B5CF6),
              ),
            ),

            // Action Buttons
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _applyToJob,
                    icon: const Icon(Icons.open_in_new),
                    label: const Text('Apply Now'),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back),
                    label: const Text('Back'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                    ),
                  ),
                ),
              ],
            ),

            // Eligibility Results
            if (_eligibility != null) ...[
              const SizedBox(height: 24),
              _buildEligibilityResults(context),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(BuildContext context, IconData icon, String text) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: 6),
          Text(text, style: const TextStyle(fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildEligibilityResults(BuildContext context) {
    final theme = Theme.of(context);
    final score = _eligibility!['eligibilityScore'] ?? 0;
    final isEligible = _eligibility!['isEligible'] ?? false;
    final matched = (_eligibility!['matchedSkills'] as List?) ?? [];
    final missing = (_eligibility!['missingSkills'] as List?) ?? [];
    final summary = _eligibility!['summary'] ?? '';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isEligible
                      ? Icons.check_circle_rounded
                      : Icons.warning_rounded,
                  color: isEligible ? Colors.green : Colors.orange,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Text(
                  'Eligibility: ${score}%',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isEligible ? Colors.green : Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Progress bar
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: (score as num).toDouble() / 100,
                minHeight: 8,
                backgroundColor: theme.colorScheme.onSurface.withValues(
                  alpha: 0.1,
                ),
                valueColor: AlwaysStoppedAnimation(
                  isEligible ? Colors.green : Colors.orange,
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (summary.isNotEmpty) ...[
              Text(
                summary,
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (matched.isNotEmpty) ...[
              Text(
                '✅ Matched Skills',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: matched
                    .map(
                      (s) => Chip(
                        label: Text(
                          s.toString(),
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: Colors.green.withValues(alpha: 0.1),
                        side: BorderSide(
                          color: Colors.green.withValues(alpha: 0.3),
                        ),
                        visualDensity: VisualDensity.compact,
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
            ],
            if (missing.isNotEmpty) ...[
              Text(
                '❌ Missing Skills',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: missing
                    .map(
                      (s) => Chip(
                        label: Text(
                          s.toString(),
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: Colors.red.withValues(alpha: 0.1),
                        side: BorderSide(
                          color: Colors.red.withValues(alpha: 0.3),
                        ),
                        visualDensity: VisualDensity.compact,
                      ),
                    )
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
