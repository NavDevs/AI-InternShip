import 'package:flutter_test/flutter_test.dart';
import 'package:intern_ai_app/main.dart';

void main() {
  testWidgets('App loads splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const InternAIApp());
    expect(find.text('Intern-AI'), findsOneWidget);
    expect(find.text('Your Personal Career Assistant'), findsOneWidget);
  });
}
