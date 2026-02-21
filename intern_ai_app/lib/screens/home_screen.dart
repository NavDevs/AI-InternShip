import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/app_drawer.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.rocket_launch_rounded,
                color: theme.colorScheme.primary, size: 24),
            const SizedBox(width: 8),
            const Text('Intern-AI',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Hero Section
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: theme.colorScheme.primary.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome,
                      size: 16, color: theme.colorScheme.primary),
                  const SizedBox(width: 6),
                  Text(
                    'AI-Powered Job Hunting',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Your copilot for',
              style: theme.textTheme.headlineLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
              ).createShader(bounds),
              child: Text(
                'internships & jobs',
                style: theme.textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Track applications, analyze job descriptions with AI, and get matched with roles that fit your skills.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            // Quick Action Buttons
            if (auth.isLoggedIn) ...[
              _buildActionButton(
                context,
                icon: Icons.dashboard_rounded,
                label: 'Dashboard',
                color: const Color(0xFF3B82F6),
                onTap: () => Navigator.pushNamed(context, '/dashboard'),
              ),
              const SizedBox(height: 12),
            ],
            _buildActionButton(
              context,
              icon: Icons.work_outline_rounded,
              label: 'Browse Jobs',
              color: const Color(0xFF10B981),
              onTap: () => Navigator.pushNamed(context, '/jobs'),
            ),
            if (auth.isLoggedIn) ...[
              const SizedBox(height: 12),
              _buildActionButton(
                context,
                icon: Icons.analytics_rounded,
                label: 'AI Analyzer',
                color: const Color(0xFF8B5CF6),
                onTap: () => Navigator.pushNamed(context, '/analyzer'),
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                context,
                icon: Icons.smart_toy_rounded,
                label: 'Career Bot',
                color: const Color(0xFFF59E0B),
                onTap: () => Navigator.pushNamed(context, '/career-bot'),
              ),
            ],
            if (!auth.isLoggedIn) ...[
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                icon: const Icon(Icons.arrow_forward_rounded),
                label: const Text('Get Started Free'),
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 52),
                ),
              ),
            ],

            const SizedBox(height: 40),

            // Stats Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildStat(context, '10k+', 'Jobs Listed'),
                _buildStat(context, '3 min', 'Avg. Setup'),
                _buildStat(context, 'Free', 'Forever'),
              ],
            ),

            const SizedBox(height: 40),

            // Feature Cards
            Text(
              'Powerful Features',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildFeatureCard(
              context,
              icon: Icons.search_rounded,
              title: 'Smart Job Search',
              description:
                  'Browse thousands of internships and jobs filtered by role, skills, and location.',
              color: const Color(0xFF3B82F6),
            ),
            const SizedBox(height: 12),
            _buildFeatureCard(
              context,
              icon: Icons.psychology_rounded,
              title: 'AI Job Analysis',
              description:
                  'Paste any job description and get instant eligibility analysis and skill matching.',
              color: const Color(0xFF8B5CF6),
            ),
            const SizedBox(height: 12),
            _buildFeatureCard(
              context,
              icon: Icons.route_rounded,
              title: 'Career Roadmaps',
              description:
                  'Get personalized career roadmaps with learning resources and certifications.',
              color: const Color(0xFF10B981),
            ),
            const SizedBox(height: 12),
            _buildFeatureCard(
              context,
              icon: Icons.track_changes_rounded,
              title: 'Application Tracker',
              description:
                  'Track all your job applications in one place with status updates.',
              color: const Color(0xFFF59E0B),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 16, color: color),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStat(BuildContext context, String value, String label) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
