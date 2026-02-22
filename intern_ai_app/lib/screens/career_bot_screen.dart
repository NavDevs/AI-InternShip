import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
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

  bool _didInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_didInit) {
      _api = Provider.of<AuthProvider>(context, listen: false).api;
      _messages.add(_ChatMessage(
        text:
            "Hi! I'm your AI Career Assistant 🚀\n\nI can help you with:\n• **Career Roadmaps** — Type a dream job like 'Flutter Developer'\n• **Interview Questions** — Ask me for interview prep\n• **Career Advice** — Ask anything about your career!\n\nWhat would you like to explore?",
        isBot: true,
      ));
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
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final lower = text.toLowerCase();
      String botResponse;

      // Match the website's career keyword detection regex
      final isCareerQuery = RegExp(
        r'\b(developer|engineer|designer|manager|analyst|scientist|architect|devops|frontend|backend|fullstack|full stack|data|cloud|machine learning|ml|ai|software|web|mobile|ios|android|product|ux|ui|security|blockchain|fsd|mern|mean|python|java|react|angular|vue|node|django|flask|spring|dotnet|golang|rust|ruby|php|kotlin|swift|flutter|aws|azure|gcp|docker|kubernetes|cybersecurity|qa|tester|dba|sysadmin|intern|fresher|career|become|want to be|how to become)\b',
        caseSensitive: false,
      ).hasMatch(text);

      final isGreeting = RegExp(r'^(hi|hello|hey|hola|yo|help|who are you)', caseSensitive: false).hasMatch(text);

      if (isCareerQuery && !isGreeting) {
        // Send the FULL user input as dreamJob — exactly like the website does
        final result = await _api.generateRoadmap(text);
        botResponse = _formatRoadmap(result);
      } else if (lower.contains('interview') || lower.contains('questions')) {
        // Extract role for interview questions
        final role = text
            .replaceAll(RegExp(r'(interview|questions|for|give|me|some|prep)', caseSensitive: false), '')
            .trim();
        if (role.isNotEmpty) {
          final result = await _api.getInterviewQuestions(
            jobRole: role,
            difficulty: 'mixed',
            count: 5,
          );
          botResponse = _formatQuestions(result);
        } else {
          botResponse =
              "Which role should I prepare interview questions for? E.g., 'Interview questions for React Developer'";
        }
      } else {
        // General AI Chat
        final chatHistory = _messages.map((m) => {
          'role': m.isBot ? 'model' : 'user',
          'parts': [{'text': m.text}],
        }).toList();

        final result = await _api.sendChatMatch(
          message: text,
          chatHistory: chatHistory,
        );
        botResponse = result['text'] ?? "Sorry, I couldn't generate a response.";
      }

      setState(() {
        _messages.add(_ChatMessage(text: botResponse, isBot: true));
        _isTyping = false;
      });
    } catch (e) {
      setState(() {
        _messages.add(_ChatMessage(
          text: "Sorry, I encountered an error. Please try again! 🔄",
          isBot: true,
        ));
        _isTyping = false;
      });
    }
    _scrollToBottom();
  }

  String _formatRoadmap(Map<String, dynamic> data) {
    final buf = StringBuffer();
    final dreamJob = data['dreamJob'] ?? 'Your Dream Job';
    buf.writeln('🗺️ Career Roadmap: $dreamJob\n');

    final phases = data['phases'] as List? ?? [];
    for (var i = 0; i < phases.length; i++) {
      final phase = phases[i] as Map<String, dynamic>;
      // Use correct API keys: month, topics, actionItems
      buf.writeln('📅 ${phase['month'] ?? 'Phase ${i + 1}'}');

      final topics = phase['topics'] as List? ?? [];
      if (topics.isNotEmpty) {
        buf.writeln('Topics: ${topics.join(', ')}');
      }

      final actions = phase['actionItems'] as List? ?? [];
      for (final action in actions) {
        buf.writeln('  • $action');
      }
      buf.writeln('');
    }

    final resources = data['recommendedResources'] as List? ?? [];
    if (resources.isNotEmpty) {
      buf.writeln('📚 Resources:');
      for (final res in resources) {
        if (res is Map) {
          buf.writeln('  • ${res['name'] ?? res}');
        } else {
          buf.writeln('  • $res');
        }
      }
    }

    return buf.toString().trim();
  }

  String _formatQuestions(Map<String, dynamic> data) {
    final buf = StringBuffer();
    buf.writeln('📝 **Interview Questions**\n');

    final questions = data['questions'] as List? ?? [];
    for (var i = 0; i < questions.length; i++) {
      final q = questions[i];
      if (q is Map) {
        buf.writeln('**Q${i + 1}:** ${q['question'] ?? q['q'] ?? ''}');
        if (q['answer'] != null || q['a'] != null) {
          buf.writeln('💡 ${q['answer'] ?? q['a']}');
        }
        buf.writeln('');
      } else {
        buf.writeln('**Q${i + 1}:** $q\n');
      }
    }
    return buf.toString().trim();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.smart_toy_rounded, size: 22),
            const SizedBox(width: 8),
            const Text('Career Bot',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      drawer: const AppDrawer(),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return _buildTypingIndicator(context);
                }
                return _buildBubble(context, _messages[index]);
              },
            ),
          ),
          // Input Bar
          Container(
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
                            horizontal: 20, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: theme.colorScheme.primary,
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded,
                          color: Colors.white, size: 20),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
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
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
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
                  p: TextStyle(
                      color: theme.colorScheme.onSurface, height: 1.4),
                  strong: TextStyle(
                      color: theme.colorScheme.onSurface,
                      fontWeight: FontWeight.bold),
                  listBullet: TextStyle(
                      color: theme.colorScheme.onSurface),
                ),
              )
            : Text(
                msg.text,
                style: const TextStyle(
                  color: Colors.white,
                  height: 1.4,
                ),
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
          children: [
            _buildDot(0),
            _buildDot(1),
            _buildDot(2),
          ],
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
            color: Theme.of(context)
                .colorScheme
                .onSurface
                .withValues(alpha: 0.4),
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
