import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class ApplicationTrackerScreen extends StatefulWidget {
  const ApplicationTrackerScreen({super.key});

  @override
  State<ApplicationTrackerScreen> createState() =>
      _ApplicationTrackerScreenState();
}

class _ApplicationTrackerScreenState extends State<ApplicationTrackerScreen> {
  late final ApiService _api;
  List<dynamic> _apps = [];
  bool _isLoading = true;
  bool _didInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_didInit) {
      _api = Provider.of<AuthProvider>(context, listen: false).api;
      _loadApps();
      _didInit = true;
    }
  }

  Future<void> _loadApps() async {
    setState(() => _isLoading = true);
    try {
      final apps = await _api.getApplications();
      setState(() {
        _apps = apps;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Color _statusColor(String? status) {
    return switch (status?.toLowerCase()) {
      'applied' => const Color(0xFF3B82F6),
      'interview' => const Color(0xFFF59E0B),
      'offer' => const Color(0xFF10B981),
      'rejected' => const Color(0xFFEF4444),
      _ => Colors.grey,
    };
  }

  IconData _statusIcon(String? status) {
    return switch (status?.toLowerCase()) {
      'applied' => Icons.send_rounded,
      'interview' => Icons.calendar_today_rounded,
      'offer' => Icons.check_circle_rounded,
      'rejected' => Icons.cancel_rounded,
      _ => Icons.circle_outlined,
    };
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Count statuses
    final applied = _apps.where((a) => a['status'] == 'applied').length;
    final interview = _apps.where((a) => a['status'] == 'interview').length;
    final offer = _apps.where((a) => a['status'] == 'offer').length;
    final rejected = _apps.where((a) => a['status'] == 'rejected').length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Application Tracker',
            style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      drawer: const AppDrawer(),
      body: RefreshIndicator(
        onRefresh: _loadApps,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  // Stats Bar
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        _buildStatChip(context, 'Applied', applied,
                            const Color(0xFF3B82F6)),
                        const SizedBox(width: 8),
                        _buildStatChip(context, 'Interview', interview,
                            const Color(0xFFF59E0B)),
                        const SizedBox(width: 8),
                        _buildStatChip(context, 'Offers', offer,
                            const Color(0xFF10B981)),
                        const SizedBox(width: 8),
                        _buildStatChip(context, 'Rejected', rejected,
                            const Color(0xFFEF4444)),
                      ],
                    ),
                  ),

                  // List
                  Expanded(
                    child: _apps.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.inbox_rounded,
                                    size: 56,
                                    color: theme.colorScheme.onSurface
                                        .withValues(alpha: 0.2)),
                                const SizedBox(height: 16),
                                Text('No applications tracked yet',
                                    style: theme.textTheme.titleMedium),
                                const SizedBox(height: 8),
                                Text(
                                  'Start browsing jobs and track your applications here!',
                                  style: TextStyle(
                                    color: theme.colorScheme.onSurface
                                        .withValues(alpha: 0.5),
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 20),
                                FilledButton.icon(
                                  onPressed: () =>
                                      Navigator.pushNamed(context, '/jobs'),
                                  icon: const Icon(Icons.search),
                                  label: const Text('Browse Jobs'),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _apps.length,
                            itemBuilder: (context, index) {
                              final app =
                                  _apps[index] as Map<String, dynamic>;
                              return _buildAppCard(context, app);
                            },
                          ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildStatChip(
      BuildContext context, String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text('$count',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: color,
                )),
            Text(label,
                style: TextStyle(fontSize: 11, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildAppCard(BuildContext context, Map<String, dynamic> app) {
    final theme = Theme.of(context);
    final status = app['status'] ?? 'applied';
    final color = _statusColor(status);
    final job = app['job'] as Map<String, dynamic>?;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_statusIcon(status), color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    job?['title'] ?? app['jobTitle'] ?? 'Unknown Job',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    job?['company'] ?? app['company'] ?? '',
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                status.toString().toUpperCase(),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
