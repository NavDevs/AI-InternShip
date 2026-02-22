import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../services/auth_service.dart';
import '../widgets/app_drawer.dart';

const List<String> indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authService = AuthService();
  bool _isEditing = false;
  final _nameController = TextEditingController();
  final _collegeController = TextEditingController();
  final _degreeController = TextEditingController();
  final _addSkillController = TextEditingController();
  
  String _role = 'student';
  String? _selectedState;
  List<String> _skills = [];
  bool _isSaving = false;
  bool _didInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_didInit) {
      _loadProfile();
      _didInit = true;
    }
  }

  void _loadProfile() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _nameController.text = auth.displayName;
    _collegeController.text = auth.profile?['education']?['college'] ?? '';
    _degreeController.text = auth.profile?['education']?['degree'] ?? '';
    _role = auth.role.isEmpty ? 'student' : auth.role;
    _skills = List<String>.from(auth.skills);
    
    final st = auth.profile?['profile']?['state'] ?? '';
    _selectedState = indianStates.contains(st) ? st : null;
  }

  void _addSkill() {
    final skill = _addSkillController.text.trim();
    if (skill.isNotEmpty && !_skills.contains(skill)) {
      setState(() {
        _skills.add(skill);
        _addSkillController.clear();
      });
    }
  }

  void _removeSkill(String skill) {
    setState(() {
      _skills.remove(skill);
    });
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      await _authService.updateUserProfile(auth.uid, {
        'name': _nameController.text.trim(),
        'skills': _skills,
        'role': _role,
        'profile': {
          'state': _selectedState ?? '',
        },
        'education': {
          'college': _collegeController.text.trim(),
          'degree': _degreeController.text.trim(),
        },
      });
      // Force refresh data in provider
      await auth.manualRefreshUserData();
      
      setState(() {
        _isEditing = false;
        _isSaving = false;
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() => _isSaving = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update: $e')),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _collegeController.dispose();
    _degreeController.dispose();
    _addSkillController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_rounded),
              onPressed: () => setState(() => _isEditing = true),
            ),
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
          children: [
            // Header Section
            _buildHeader(auth, theme),
            const SizedBox(height: 24),

            if (_isEditing) ...[
              // Edit Mode Sections
              _buildSectionCard(
                context: context,
                title: 'Personal Information',
                icon: Icons.person,
                iconColor: theme.colorScheme.primary,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.badge_outlined)),
                    ),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      value: _role,
                      decoration: const InputDecoration(labelText: 'Account Role', prefixIcon: Icon(Icons.work_outline)),
                      items: const [
                        DropdownMenuItem(value: 'student', child: Text('Student')),
                        DropdownMenuItem(value: 'employed', child: Text('Employed')),
                        DropdownMenuItem(value: 'unemployed', child: Text('Unemployed')),
                        DropdownMenuItem(value: 'fresher', child: Text('Fresher')),
                        DropdownMenuItem(value: 'professional', child: Text('Professional')),
                      ],
                      onChanged: (v) => setState(() => _role = v!),
                    ),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      value: _selectedState,
                      decoration: const InputDecoration(labelText: 'State', prefixIcon: Icon(Icons.location_on_outlined)),
                      hint: const Text('Select your state'),
                      isExpanded: true,
                      items: indianStates
                          .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedState = v),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              _buildSectionCard(
                context: context,
                title: 'Education',
                icon: Icons.school,
                iconColor: Colors.indigo,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _collegeController,
                      decoration: const InputDecoration(labelText: 'College / University', prefixIcon: Icon(Icons.account_balance_outlined)),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _degreeController,
                      decoration: const InputDecoration(labelText: 'Degree / Major', prefixIcon: Icon(Icons.menu_book_outlined)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              _buildSectionCard(
                context: context,
                title: 'Skills',
                icon: Icons.business_center,
                iconColor: Colors.orange,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _skills.map((s) => Chip(
                        label: Text(s, style: const TextStyle(fontSize: 12)),
                        deleteIcon: const Icon(Icons.close, size: 16),
                        onDeleted: () => _removeSkill(s),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      )).toList(),
                    ),
                    if (_skills.isNotEmpty) const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _addSkillController,
                            decoration: const InputDecoration(
                              hintText: 'Add a skill...',
                              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                            onFieldSubmitted: (_) => _addSkill(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton.filled(
                          onPressed: _addSkill,
                          icon: const Icon(Icons.add),
                          style: IconButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() => _isEditing = false);
                        _loadProfile();
                      },
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _isSaving ? null : _saveProfile,
                      child: _isSaving
                          ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            ] else ...[
              // View Mode Sections
              _buildSectionCard(
                context: context,
                title: 'Personal Information',
                icon: Icons.person,
                iconColor: theme.colorScheme.primary,
                child: Column(
                  children: [
                    _buildInfoRow(context, 'Full Name', auth.displayName, Icons.badge_outlined),
                    _buildInfoRow(context, 'Account Role', auth.role, Icons.work_outline),
                    _buildInfoRow(context, 'State', auth.profile?['profile']?['state'] ?? 'Not added yet', Icons.location_on_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              _buildSectionCard(
                context: context,
                title: 'Education',
                icon: Icons.school,
                iconColor: Colors.indigo,
                child: Column(
                  children: [
                    _buildInfoRow(context, 'College / University', auth.profile?['education']?['college'] ?? 'Not added yet', Icons.account_balance_outlined),
                    _buildInfoRow(context, 'Degree / Major', auth.profile?['education']?['degree'] ?? 'Not added yet', Icons.menu_book_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              _buildSectionCard(
                context: context,
                title: 'Skills',
                icon: Icons.business_center,
                iconColor: Colors.orange,
                child: auth.skills.isEmpty
                    ? Text('No skills added yet', style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.5)))
                    : Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: auth.skills.map((s) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(s, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: theme.colorScheme.onSurfaceVariant)),
                        )).toList(),
                      ),
              ),
            ],

            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: () async {
                await auth.logout();
                if (!context.mounted) return;
                Navigator.pushReplacementNamed(context, '/login');
              },
              icon: const Icon(Icons.logout_rounded, color: Colors.red),
              label: const Text('Log Out', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(AuthProvider auth, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.1),
            backgroundImage: auth.photoUrl.isNotEmpty ? NetworkImage(auth.photoUrl) : null,
            child: auth.photoUrl.isEmpty ? Icon(Icons.person, size: 40, color: theme.colorScheme.primary) : null,
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(auth.displayName.isNotEmpty ? auth.displayName : 'Your Name', 
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)
                ),
                const SizedBox(height: 4),
                Text(auth.email, style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.6), fontSize: 13)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    auth.role.isEmpty ? 'STUDENT' : auth.role.toUpperCase(),
                    style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({required BuildContext context, required String title, required IconData icon, required Color iconColor, required Widget child}) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 20),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value, IconData icon) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.onSurface.withValues(alpha: 0.4)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 12, color: theme.colorScheme.onSurface.withValues(alpha: 0.5))),
                const SizedBox(height: 2),
                Text(value.isEmpty ? 'Not added yet' : value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

