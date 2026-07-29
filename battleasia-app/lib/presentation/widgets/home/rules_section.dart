import 'package:flutter/material.dart';
import 'package:battleasia_app/core/constants/app_constants.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';
import 'package:battleasia_app/core/utils/app_utils.dart';
import 'package:battleasia_app/data/models/faq_model.dart';

class RulesSection extends StatefulWidget {
  const RulesSection({super.key});

  @override
  State<RulesSection> createState() => _RulesSectionState();
}

class _RulesSectionState extends State<RulesSection> {
  final List<FAQModel> _faqs = AppConstants.faqData
      .map((faq) => FAQModel(
            question: faq['question']!,
            answer: faq['answer']!,
          ))
      .toList();
  
  final List<bool> _expandedStates = List.filled(AppConstants.faqData.length, false);

  @override
  Widget build(BuildContext context) {
    final isMobile = AppUtils.isMobile(context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 16 : 40,
        vertical: isMobile ? 40 : 80,
      ),
      color: const Color(0xFFF8F8F8),
      child: Column(
        children: [
          // Header
          Column(
            children: [
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: AppTheme.heading2.copyWith(
                    fontSize: isMobile ? 28 : 45,
                    color: const Color(0xFF1A1A1A),
                  ),
                  children: [
                    TextSpan(
                      text: 'Tournament Rules',
                      style: TextStyle(
                        foreground: Paint()
                          ..shader = AppTheme.accentGradient.createShader(
                            const Rect.fromLTWH(0, 0, 200, 70),
                          ),
                      ),
                    ),
                    const TextSpan(text: '\n'),
                    TextSpan(
                      text: 'Official BattleAsia Tournament Regulations',
                      style: AppTheme.bodyMedium.copyWith(
                        fontSize: 18,
                        color: const Color(0xFF1A1A1A),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Container(
                width: 200,
                height: 3,
                decoration: BoxDecoration(
                  color: AppTheme.accentColor,
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 32),
          
          // FAQ Accordion
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _faqs.length,
            itemBuilder: (context, index) {
              return _buildFAQItem(_faqs[index], index, isMobile);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFAQItem(FAQModel faq, int index, bool isMobile) {
    return Container(
      margin: const EdgeInsets.only(bottom: 1),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey.shade300,
            width: 1,
          ),
        ),
      ),
      child: ExpansionTile(
        tilePadding: EdgeInsets.symmetric(
          horizontal: isMobile ? 16 : 24,
          vertical: 8,
        ),
        childrenPadding: EdgeInsets.fromLTRB(
          isMobile ? 16 : 24,
          0,
          isMobile ? 16 : 24,
          16,
        ),
        title: Text(
          faq.question,
          style: AppTheme.heading3.copyWith(
            fontSize: isMobile ? 18 : 24,
            color: const Color(0xFF1A1A1A),
          ),
        ),
        trailing: Icon(
          _expandedStates[index]
              ? Icons.keyboard_arrow_up
              : Icons.keyboard_arrow_down,
          color: const Color(0xFF1A1A1A),
        ),
        onExpansionChanged: (expanded) {
          setState(() {
            _expandedStates[index] = expanded;
          });
        },
        children: [
          Text(
            faq.answer,
            style: AppTheme.bodyMedium.copyWith(
              fontSize: isMobile ? 14 : 18,
              color: const Color(0xFF666666),
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}
