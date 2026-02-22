import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/app_drawer.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late final ApiService _api;
  List<dynamic> _recentJobs = [];
  List<dynamic> _recentApplications = [];
  List<dynamic> _followUpApplications = [];
  Map<String, dynamic>? _analytics;
  bool _isLoading = true;
  bool _isLoadingApplications = true;
  bool _didInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_didInit) {
      _api = Provider.of<AuthProvider>(context, listen: false).api;
      _loadData();
      _didInit = true;
    }
  }

  Future<void> _loadData() async {
    try {
      // Load both jobs and applications
      final jobsFuture = _api.getLatestJobs();
      final appsFuture = _api.getApplications();
      
      final jobs = await jobsFuture;
      final apps = await appsFuture;
      
      // Process applications
      final appsList = List.from(apps).cast<Map<String, dynamic>>();
      appsList.sort((a, b) {
        final dateA = DateTime.tryParse(a['appliedDate'] ?? '');
        final dateB = DateTime.tryParse(b['appliedDate'] ?? '');
        if (dateA == null || dateB == null) return 0;
        return dateB.compareTo(dateA);
      });
      
      // Get recent applications (last 5)
      final recentApps = appsList.take(5).toList();
      
      // Get follow-up applications (those with follow-up dates in the future)
      final followUpApps = appsList.where((app) {
        final followUpDate = DateTime.tryParse(app['followUpDate'] ?? '');
        if (followUpDate == null) return false;
        return followUpDate.isAfter(DateTime.now());
      }).take(3).toList();
      
      setState(() {
        _recentJobs = jobs.take(5).toList();
        _recentApplications = recentApps;
        _followUpApplications = followUpApps;
        _isLoading = false;
        _isLoadingApplications = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _isLoadingApplications = false;
      });
    }
  }

  @override
  // Calculate application statistics
  Map<String, int> _getApplicationStats() {
    final counts = {
      'total': 0,
      'applied': 0,
      'interview': 0,
      'offer': 0,
      'rejected': 0,
    };
    
    for (final app in _recentApplications) {
      counts['total'] = counts['total']! + 1;
      final status = (app['status'] ?? '').toLowerCase();
      switch (status) {
        case 'applied':
          counts['applied'] = counts['applied']! + 1;
          break;
        case 'interview':
          counts['interview'] = counts['interview']! + 1;
          break;
        case 'offer':
          counts['offer'] = counts['offer']! + 1;
          break;
        case 'rejected':
          counts['rejected'] = counts['rejected']! + 1;
          break;
      }
    }
    
    return counts;
  }
  
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);
    final stats = _getApplicationStats();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      drawer: const AppDrawer(),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                          backgroundImage: auth.photoUrl.isNotEmpty
                              ? NetworkImage(auth.photoUrl)
                              : null,
                          child: auth.photoUrl.isEmpty
                              ? const Icon(Icons.person, color: Colors.white)
                              : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Welcome back,',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                auth.displayName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (auth.skills.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline,
                                color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Add your skills in Profile to get better AI analysis!',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.9),
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Quick Actions Grid
              Text('Quick Actions',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.4,
                children: [
                  _buildQuickAction(
                    context,
                    icon: Icons.work_outline_rounded,
                    label: 'Browse Jobs',
                    color: const Color(0xFF10B981),
                    route: '/jobs',
                  ),
                  _buildQuickAction(
                    context,
                    icon: Icons.analytics_rounded,
                    label: 'AI Analyzer',
                    color: const Color(0xFF8B5CF6),
                    route: '/analyzer',
                  ),
                  _buildQuickAction(
                    context,
                    icon: Icons.smart_toy_rounded,
                    label: 'Career Bot',
                    color: const Color(0xFFF59E0B),
                    route: '/career-bot',
                  ),
                  _buildQuickAction(
                    context,
                    icon: Icons.track_changes_rounded,
                    label: 'Tracker',
                    color: const Color(0xFFEF4444),
                    route: '/tracker',
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Stats Cards
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.4,
                children: [
                  _buildStatCard(
                    context,
                    label: 'Total Applications',
                    value: stats['total']?.toString() ?? '0',
                    icon: Icons.bar_chart,
                    color: const Color(0xFF3B82F6),
                    route: '/tracker',
                  ),
                  _buildStatCard(
                    context,
                    label: 'Active Interviews',
                    value: stats['interview']?.toString() ?? '0',
                    icon: Icons.access_time,
                    color: const Color(0xFFF59E0B),
                    route: '/tracker',
                  ),
                  _buildStatCard(
                    context,
                    label: 'Offers Received',
                    value: stats['offer']?.toString() ?? '0',
                    icon: Icons.check_circle,
                    color: const Color(0xFF10B981),
                    route: '/tracker',
                  ),
                  _buildStatCard(
                    context,
                    label: 'Rejections',
                    value: stats['rejected']?.toString() ?? '0',
                    icon: Icons.cancel,
                    color: const Color(0xFFEF4444),
                    route: '/tracker',
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Follow-ups
              Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.calendar_month, 
                            color: const Color(0xFFF59E0B), 
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Upcoming Follow-ups',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (_followUpApplications.isNotEmpty)
                        ..._followUpApplications.map((app) => _buildFollowUpCard(context, app))
                      else
                        Container(
                          padding: const EdgeInsets.all(16),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(Icons.check_circle, 
                                  color: theme.colorScheme.onSurface.withValues(alpha: 0.3), 
                                  size: 32,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'No follow-ups due',
                                  style: TextStyle(
                                    color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Recent Activity
              Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Recent Activity',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pushNamed(context, '/tracker'),
                            child: const Text('View All'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (_recentApplications.isNotEmpty)
                        ..._recentApplications.map((app) => _buildActivityCard(context, app))
                      else
                        Container(
                          padding: const EdgeInsets.all(16),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(Icons.dashboard, 
                                  color: theme.colorScheme.onSurface.withValues(alpha: 0.3), 
                                  size: 32,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'No activity yet',
                                  style: TextStyle(
                                    color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Recent Jobs
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Recent Jobs',
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/jobs'),
                    child: const Text('View All'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (_isLoading)
                const Center(
                    child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ))
              else if (_recentJobs.isEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.work_off_outlined,
                              size: 48,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.3)),
                          const SizedBox(height: 12),
                          Text('No jobs available',
                              style: TextStyle(
                                color: theme.colorScheme.onSurface
                                    .withValues(alpha: 0.5),
                              )),
                        ],
                      ),
                    ),
                  ),
                )
              else
                ...(_recentJobs.map((job) => _buildJobCard(context, job))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickAction(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required String route,
  }) {
    return Card(
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, route),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return Card(
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, route),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 10),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFollowUpCard(BuildContext context, Map<String, dynamic> app) {
    final theme = Theme.of(context);
    final followUpDate = DateTime.tryParse(app['followUpDate'] ?? '');
    final formattedDate = followUpDate != null
        ? '${followUpDate.day}/${followUpDate.month}'
        : 'N/A';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: theme.colorScheme.outline,
              ),
            ),
            child: Center(
              child: Text(
                app['company']?.substring(0, 1) ?? '?',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  app['company'] ?? 'Unknown Company',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  app['role'] ?? 'Unknown Role',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Due',
                style: TextStyle(
                  fontSize: 10,
                  color: const Color(0xFFF59E0B),
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                formattedDate,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivityCard(BuildContext context, Map<String, dynamic> app) {
    final theme = Theme.of(context);
    final appliedDate = DateTime.tryParse(app['appliedDate'] ?? '');
    final formattedDate = appliedDate != null
        ? '${appliedDate.day}/${appliedDate.month}'
        : 'N/A';
    
    String getStatusColor(String status) {
      switch (status.toLowerCase()) {
        case 'offer':
          return 'emerald';
        case 'interview':
          return 'amber';
        case 'rejected':
          return 'rose';
        default:
          return 'blue';
      }
    }
    
    Color getColor(String colorName) {
      switch (colorName) {
        case 'emerald':
          return const Color(0xFF10B981);
        case 'amber':
          return const Color(0xFFF59E0B);
        case 'rose':
          return const Color(0xFFEF4444);
        default:
          return const Color(0xFF3B82F6);
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: theme.colorScheme.outline,
              ),
            ),
            child: Center(
              child: Text(
                app['company']?.substring(0, 1) ?? '?',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  app['role'] ?? 'Unknown Role',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  '${app['company'] ?? 'Unknown Company'} · $formattedDate',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: getColor(getStatusColor(app['status'] ?? 'applied')).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: getColor(getStatusColor(app['status'] ?? 'applied')).withValues(alpha: 0.3),
              ),
            ),
            child: Text(
              app['status'] ?? 'Applied',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: getColor(getStatusColor(app['status'] ?? 'applied')),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard(BuildContext context, Map<String, dynamic> job) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, '/jobs'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.business_rounded,
                    color: theme.colorScheme.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      job['title'] ?? 'Unknown',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      job['company'] ?? '',
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios,
                  size: 14,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
            ],
          ),
        ),
      ),
    );
  }
}
