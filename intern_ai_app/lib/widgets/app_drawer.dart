import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Drawer(
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 24,
              bottom: 20,
              left: 20,
              right: 20,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white.withValues(alpha: 0.2),
                      backgroundImage: auth.photoUrl.isNotEmpty
                          ? NetworkImage(auth.photoUrl)
                          : null,
                      child: auth.photoUrl.isEmpty
                          ? const Icon(Icons.person,
                              size: 30, color: Colors.white)
                          : null,
                    ),
                    const Spacer(),
                    IconButton(
                      icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode,
                          color: Colors.white),
                      onPressed: () =>
                          context.read<ThemeProvider>().toggleTheme(),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (auth.isLoggedIn) ...[
                  Text(
                    auth.displayName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    auth.email,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 13,
                    ),
                  ),
                ] else ...[
                  const Text(
                    'Intern-AI',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Sign in to get started',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 13,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Menu Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                _buildItem(context, Icons.home_rounded, 'Home', '/home'),
                if (auth.isLoggedIn)
                  _buildItem(context, Icons.dashboard_rounded, 'Dashboard',
                      '/dashboard'),
                _buildItem(
                    context, Icons.work_outline_rounded, 'Jobs', '/jobs'),
                if (auth.isLoggedIn) ...[
                  _buildItem(context, Icons.analytics_rounded, 'AI Analyzer',
                      '/analyzer'),
                  _buildItem(context, Icons.smart_toy_rounded, 'Career Bot',
                      '/career-bot'),
                  _buildItem(context, Icons.track_changes_rounded, 'Tracker',
                      '/tracker'),
                  const Divider(height: 24, indent: 16, endIndent: 16),
                  _buildItem(context, Icons.person_rounded, 'Profile',
                      '/profile'),
                ],
                if (!auth.isLoggedIn) ...[
                  const Divider(height: 24, indent: 16, endIndent: 16),
                  _buildItem(
                      context, Icons.login_rounded, 'Sign In', '/login'),
                  _buildItem(context, Icons.person_add_rounded, 'Sign Up',
                      '/register'),
                ],
              ],
            ),
          ),

          // Footer
          if (auth.isLoggedIn)
            Padding(
              padding: const EdgeInsets.all(16),
              child: OutlinedButton.icon(
                onPressed: () async {
                  Navigator.pop(context); // close drawer
                  await auth.logout();
                  if (!context.mounted) return;
                  Navigator.pushReplacementNamed(context, '/login');
                },
                icon: const Icon(Icons.logout_rounded,
                    size: 18, color: Colors.red),
                label: const Text('Log Out',
                    style: TextStyle(color: Colors.red)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  side: BorderSide(color: Colors.red.withValues(alpha: 0.3)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  Widget _buildItem(
      BuildContext context, IconData icon, String label, String route) {
    final theme = Theme.of(context);
    // Determine if this is the current route
    final currentRoute = ModalRoute.of(context)?.settings.name;
    final isActive = currentRoute == route;

    return ListTile(
      leading: Icon(icon,
          color: isActive
              ? theme.colorScheme.primary
              : theme.colorScheme.onSurface.withValues(alpha: 0.7)),
      title: Text(
        label,
        style: TextStyle(
          fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          color: isActive
              ? theme.colorScheme.primary
              : theme.colorScheme.onSurface,
        ),
      ),
      selected: isActive,
      selectedTileColor: theme.colorScheme.primary.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
      onTap: () {
        Navigator.pop(context); // close drawer
        if (!isActive) {
          Navigator.pushReplacementNamed(context, route);
        }
      },
    );
  }
}
