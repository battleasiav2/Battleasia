import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';
import 'package:battleasia_app/core/theme/app_theme.dart';

/// Modern step indicator for multi-step auth forms.
class AuthStepProgress extends StatelessWidget {
  final List<String> labels;
  final int activeStep;

  const AuthStepProgress({
    super.key,
    required this.labels,
    required this.activeStep,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        children: [
          for (var i = 0; i < labels.length; i++) ...[
            _StepNode(
              index: i,
              label: labels[i],
              done: i < activeStep,
              active: i == activeStep,
            ),
            if (i < labels.length - 1)
              Expanded(
                child: Container(
                  height: 2,
                  margin: const EdgeInsets.only(bottom: 18, left: 6, right: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(1),
                  ),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: i < activeStep
                          ? 1
                          : i == activeStep
                              ? 0.5
                              : 0,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.gold,
                          borderRadius: BorderRadius.circular(1),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _StepNode extends StatelessWidget {
  final int index;
  final String label;
  final bool done;
  final bool active;

  const _StepNode({
    required this.index,
    required this.label,
    required this.done,
    required this.active,
  });

  @override
  Widget build(BuildContext context) {
    final filled = done || active;

    return Column(
      children: [
        Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: filled ? AppColors.gold : Colors.white.withValues(alpha: 0.08),
            border: Border.all(
              color: filled
                  ? AppColors.gold
                  : Colors.white.withValues(alpha: 0.18),
              width: 1.5,
            ),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: AppColors.gold.withValues(alpha: 0.35),
                      blurRadius: 14,
                    ),
                  ]
                : null,
          ),
          child: Text(
            done ? '✓' : '${index + 1}',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: filled ? const Color(0xFF111111) : Colors.white.withValues(alpha: 0.55),
            ),
          ),
        ),
        const SizedBox(height: 6),
        SizedBox(
          width: 88,
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTheme.bodySmall.copyWith(
              fontSize: 11,
              fontWeight: active ? FontWeight.w700 : FontWeight.w600,
              color: active ? Colors.white : Colors.white.withValues(alpha: 0.52),
              height: 1.25,
            ),
          ),
        ),
      ],
    );
  }
}
