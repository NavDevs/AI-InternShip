import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class CareerBotScreen extends StatefulWidget {
  const CareerBotScreen({super.key});

  @override
  State<CareerBotScreen> createState() => _CareerBotScreenState();
}

class _CareerBotScreenState extends State<CareerBotScreen> {
  late final ApiService _api;
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isTyping = false;

  Map<String, dynamic>? _roadmapResult;
  Map<String, dynamic>? _interviewQuestionsResult;
  Map<String, dynamic>? _careerInsightsResult;

  bool _didInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_didInit) {
      _api = Provider.of<AuthProvider>(context, listen: false).api;
      _messages.add(
        _ChatMessage(
          text:
              "Hi! I'm your AI Career Assistant 🚀\n\nI can help you with:\n• **Career Roadmaps** — Type a dream job like 'Flutter Developer'\n• **Interview Questions** — Ask me for interview prep\n• **Career Advice** — Ask anything about your career!",
          isBot: true,
        ),
      );
      _didInit = true;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(text: text, isBot: false));
      _isTyping = true;
      _roadmapResult = null;
      _interviewQuestionsResult = null;
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final lower = text.toLowerCase();
      String botResponse;

      final isCareerQuery = RegExp(
        r'\b(developer|engineer|designer|manager|analyst|scientist|architect|devops|frontend|backend|fullstack|full stack|data|cloud|machine learning|ml|ai|software|web|mobile|ios|android|product|ux|ui|security|blockchain|fsd|mern|mean|python|java|react|angular|vue|node|django|flask|spring|dotnet|golang|rust|ruby|php|kotlin|swift|flutter|aws|azure|gcp|docker|kubernetes|cybersecurity|qa|tester|dba|sysadmin|intern|fresher|career|become|want to be|how to become|roadmap|road map|roadmaps|syllabus|curriculum)\b',
        caseSensitive: false,
      ).hasMatch(text);

      final isGreeting = RegExp(
        r'^(hi|hello|hey|hola|yo|who are you|help)$',
        caseSensitive: false,
      ).hasMatch(text);

      if (isCareerQuery && !isGreeting) {
        final result = await _api.generateRoadmap(text);
        setState(() {
          _roadmapResult = result;
        });
        botResponse =
            "I've crafted a personalized 6-month roadmap for you to become a ${result['dreamJob']}. Check it out above! ☝️";
      } else if (lower.contains('interview') || lower.contains('questions')) {
        final role = text
            .replaceAll(
              RegExp(
                r'(interview|questions|for|give|me|some|prep)',
                caseSensitive: false,
              ),
              '',
            )
            .trim();
        if (role.isNotEmpty) {
          final result = await _api.getInterviewQuestions(
            jobRole: role,
            difficulty: 'mixed',
            count: 5,
          );
          setState(() {
            _interviewQuestionsResult = result;
          });
          botResponse =
              "I've prepared ${result['totalQuestions']} interview questions for $role. Good luck reviewing them above! 📝";
        } else {
          botResponse =
              "Which role should I prepare interview questions for? E.g., 'Interview questions for React Developer'";
        }
      } else if (lower.contains('insights') ||
          lower.contains('analysis') ||
          lower.contains('career insights') ||
          lower.contains('advice')) {
        // Handle career insights request
        _sendCareerInsights();
        return; // Early return since we handle this differently
      } else {
        final chatHistory = _messages
            .map(
              (m) => {
                'role': m.isBot ? 'model' : 'user',
                'parts': [
                  {'text': m.text},
                ],
              },
            )
            .toList();

        final result = await _api.sendChatMatch(
          message: text,
          chatHistory: chatHistory,
        );
        botResponse =
            result['text'] ?? "Sorry, I couldn't generate a response.";
      }

      setState(() {
        _messages.add(_ChatMessage(text: botResponse, isBot: true));
        _isTyping = false;
      });
    } catch (e) {
      setState(() {
        _messages.add(
          _ChatMessage(
            text: "Sorry, I encountered an error. Please try again! 🔄",
            isBot: true,
          ),
        );
        _isTyping = false;
      });
    }
    _scrollToBottom();
  }

  Future<void> _sendCareerInsights() async {
    setState(() {
      _isTyping = true;
      _roadmapResult = null;
      _interviewQuestionsResult = null;
      _careerInsightsResult = null; // Clear any previous insights
    });

    try {
      // Call the actual backend API to get career insights
      final result = await _api.getCareerAdvice();

      setState(() {
        _careerInsightsResult = result;
        _messages.add(
          _ChatMessage(
            text:
                "I've analyzed your application history and prepared personalized insights. Check them out above! 📊",
            isBot: true,
          ),
        );
        _isTyping = false;
      });
    } catch (e) {
      setState(() {
        _messages.add(
          _ChatMessage(
            text:
                "Sorry, I encountered an error getting your career insights. Please try again! 🔄",
            isBot: true,
          ),
        );
        _isTyping = false;
      });
    }
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.smart_toy_rounded, size: 22),
            SizedBox(width: 8),
            Text('Career Bot', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      drawer: const AppDrawer(),
      body: Column(
        children: [
          // Dynamic Result Panel (Shows Roadmap, Interview Questions, or Career Insights visually)
          if (_careerInsightsResult != null)
            Expanded(
              flex: 3,
              child: _buildCareerInsightsView(_careerInsightsResult!),
            )
          else if (_roadmapResult != null)
            Expanded(flex: 3, child: _buildRoadmapView(_roadmapResult!))
          else if (_interviewQuestionsResult != null)
            Expanded(
              flex: 3,
              child: _buildInterviewQuestionsView(_interviewQuestionsResult!),
            ),

          // Chat View Region
          Expanded(
            flex:
                (_careerInsightsResult != null ||
                    _roadmapResult != null ||
                    _interviewQuestionsResult != null)
                ? 2
                : 1,
            child: Container(
              color: theme.colorScheme.surface,
              child: Column(
                children: [
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length + (_isTyping ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == _messages.length && _isTyping)
                          return _buildTypingIndicator(context);
                        return _buildBubble(context, _messages[index]);
                      },
                    ),
                  ),
                  _buildInputBar(theme),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==== INTERACTIVE RESULT VIEWS ==== //

  Widget _buildRoadmapView(Map<String, dynamic> data) {
    final dreamJob = data['dreamJob'] ?? 'Your Dream Job';
    final phases = data['phases'] as List? ?? [];
    final resources = data['recommendedResources'] as List? ?? [];

    return Container(
      color: Theme.of(
        context,
      ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Theme.of(
                  context,
                ).colorScheme.outlineVariant.withValues(alpha: 0.5),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Career Roadmap',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  dreamJob,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                // Timeline Phases
                ...phases.asMap().entries.map((entry) {
                  int idx = entry.key;
                  Map<String, dynamic> phase = entry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Text(
                              '${idx + 1}',
                              style: const TextStyle(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                phase['month'] ?? '',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.blue,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              if ((phase['topics'] as List?)?.isNotEmpty ==
                                  true)
                                Text(
                                  (phase['topics'] as List).first,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              const SizedBox(height: 8),
                              ...((phase['actionItems'] as List?) ?? []).map(
                                (item) => Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Icon(
                                        Icons.check_circle,
                                        color: Colors.green,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          item,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            height: 1.4,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),

          if (resources.isNotEmpty) ...[
            const SizedBox(height: 20),
            const Text(
              '  Recommended Resources',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            ...resources.map((res) {
              String name = res is Map
                  ? res['name'] ?? 'Resource'
                  : res.toString();
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  leading: const Icon(
                    Icons.bookmark_outline,
                    color: Colors.blue,
                  ),
                  title: Text(
                    name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  trailing: const Icon(Icons.open_in_new, size: 16),
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildInterviewQuestionsView(Map<String, dynamic> data) {
    final questionsByRound =
        data['questionsByRound'] as Map<String, dynamic>? ?? {};

    return Container(
      color: Theme.of(
        context,
      ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Interview Questions',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          Text(
            'Role: ${data['role']}',
            style: TextStyle(
              color: Theme.of(
                context,
              ).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 24),

          ...questionsByRound.entries.map((entry) {
            String round = entry.key;
            List qList = entry.value as List? ?? [];
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.auto_awesome,
                      color: Colors.orange,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      round.toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                        fontSize: 12,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...qList.map((q) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Theme.of(
                          context,
                        ).colorScheme.outlineVariant.withValues(alpha: 0.5),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                q['question'] ?? '',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color:
                                    (q['difficulty'] == 'Hard'
                                            ? Colors.red
                                            : q['difficulty'] == 'Medium'
                                            ? Colors.orange
                                            : Colors.green)
                                        .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                q['difficulty'] ?? '',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: (q['difficulty'] == 'Hard'
                                      ? Colors.red
                                      : q['difficulty'] == 'Medium'
                                      ? Colors.orange
                                      : Colors.green),
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (q['answer'] != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Theme.of(context)
                                  .colorScheme
                                  .surfaceContainerHighest
                                  .withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(8),
                              border: Border(
                                left: BorderSide(
                                  color: Theme.of(context).colorScheme.primary,
                                  width: 3,
                                ),
                              ),
                            ),
                            child: Text(
                              q['answer'],
                              style: const TextStyle(fontSize: 13, height: 1.5),
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 24),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCareerInsightsView(Map<String, dynamic> data) {
    final theme = Theme.of(context);

    return Container(
      color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Overall Assessment Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: theme.colorScheme.outlineVariant.withOpacity(0.5),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lightbulb, color: Colors.amber),
                    const SizedBox(width: 8),
                    Text(
                      'Career Insights',
                      style: TextStyle(
                        color: Colors.amber[600],
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Personalized Career Insights',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),

                // Application Stats
                if (data['applicationStats'] != null) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'Your Application Journey',
                          style: theme.textTheme.titleMedium!.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatCard(
                              data['applicationStats']['total'] ?? 0,
                              'Total',
                              Colors.blue,
                            ),
                            _buildStatCard(
                              data['applicationStats']['applied'] ?? 0,
                              'Applied',
                              Colors.amber,
                            ),
                            _buildStatCard(
                              data['applicationStats']['interview'] ?? 0,
                              'Interviews',
                              Colors.green,
                            ),
                            _buildStatCard(
                              data['applicationStats']['offer'] ?? 0,
                              'Offers',
                              Colors.purple,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Overall Assessment
                Text(
                  data['overallAssessment'] ?? 'No assessment available',
                  style: const TextStyle(fontSize: 14, height: 1.5),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Strengths and Areas to Improve
          Row(
            children: [
              Expanded(
                flex: 1,
                child: _buildStrengthsCard(
                  data['strengths'] ?? [],
                  theme,
                  'Strengths',
                  Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 1,
                child: _buildStrengthsCard(
                  data['areasToImprove'] ?? [],
                  theme,
                  'Areas to Improve',
                  Colors.red,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Strategic Advice
          if (data['strategicAdvice'] != null &&
              (data['strategicAdvice'] as List).isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.tips_and_updates,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Strategic Advice',
                        style: theme.textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...(data['strategicAdvice'] as List).map((advice) {
                    String priority = advice['priority'] ?? 'medium';
                    Color priorityColor = priority == 'high'
                        ? Colors.red
                        : priority == 'medium'
                        ? Colors.orange
                        : Colors.blue;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border(
                          left: BorderSide(color: priorityColor, width: 4),
                        ),
                        color: theme.colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                advice['title'] ?? '',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: priorityColor,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: priorityColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  priority.toUpperCase(),
                                  style: TextStyle(
                                    color: priorityColor,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            advice['description'] ?? '',
                            style: const TextStyle(fontSize: 13, height: 1.4),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Recommended Roles
          if (data['roleRecommendations'] != null &&
              (data['roleRecommendations'] as List).isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.work_outline,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Recommended Roles',
                        style: theme.textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: (data['roleRecommendations'] as List).map((role) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: theme.colorScheme.primary.withOpacity(0.3),
                          ),
                        ),
                        child: Text(
                          role,
                          style: TextStyle(
                            color: theme.colorScheme.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Next Steps
          if (data['nextSteps'] != null &&
              (data['nextSteps'] as List).isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.arrow_forward,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Next Steps',
                        style: theme.textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...ListTile.divideTiles(
                    context: context,
                    tiles: (data['nextSteps'] as List).map((step) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                        title: Text(step, style: const TextStyle(fontSize: 14)),
                        dense: true,
                      );
                    }),
                  ).toList(),
                ],
              ),
            ),
          ],

          // Motivational Message
          if (data['motivationalMessage'] != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.deepPurple, Colors.indigo],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                '"${data['motivationalMessage']}"',
                style: const TextStyle(
                  color: Colors.white,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatCard(int count, String label, Color color) {
    return Container(
      width: 60,
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$count',
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 10, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStrengthsCard(
    List<dynamic> items,
    ThemeData theme,
    String title,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.check_circle, color: color),
              const SizedBox(width: 8),
              Text(
                title,
                style: theme.textTheme.titleMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...items.asMap().entries.map((entry) {
            int index = entry.key;
            String item = entry.value.toString();

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${index + 1}. ', style: TextStyle(color: color)),
                  Expanded(
                    child: Text(item, style: const TextStyle(fontSize: 13)),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ==== CHAT COMPONENTS ==== //

  Widget _buildInputBar(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 8, 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                onSubmitted: (_) => _sendMessage(),
                decoration: InputDecoration(
                  hintText: 'Ask about your career...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              backgroundColor: theme.colorScheme.primary,
              child: IconButton(
                icon: const Icon(
                  Icons.send_rounded,
                  color: Colors.white,
                  size: 20,
                ),
                onPressed: _sendMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBubble(BuildContext context, _ChatMessage msg) {
    final theme = Theme.of(context);
    return Align(
      alignment: msg.isBot ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        decoration: BoxDecoration(
          color: msg.isBot
              ? theme.colorScheme.surfaceContainerHighest
              : theme.colorScheme.primary,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isBot ? 4 : 16),
            bottomRight: Radius.circular(msg.isBot ? 16 : 4),
          ),
        ),
        child: msg.isBot
            ? MarkdownBody(
                data: msg.text,
                selectable: true,
                styleSheet: MarkdownStyleSheet(
                  p: TextStyle(color: theme.colorScheme.onSurface, height: 1.4),
                  strong: TextStyle(
                    color: theme.colorScheme.onSurface,
                    fontWeight: FontWeight.bold,
                  ),
                  listBullet: TextStyle(color: theme.colorScheme.onSurface),
                ),
              )
            : Text(
                msg.text,
                style: const TextStyle(color: Colors.white, height: 1.4),
              ),
      ),
    );
  }

  Widget _buildTypingIndicator(BuildContext context) {
    final theme = Theme.of(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(16),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [_buildDot(0), _buildDot(1), _buildDot(2)],
        ),
      ),
    );
  }

  Widget _buildDot(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 600 + index * 200),
      builder: (context, value, child) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: Theme.of(
              context,
            ).colorScheme.onSurface.withValues(alpha: 0.4),
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }
}

class _ChatMessage {
  final String text;
  final bool isBot;
  _ChatMessage({required this.text, required this.isBot});
}
