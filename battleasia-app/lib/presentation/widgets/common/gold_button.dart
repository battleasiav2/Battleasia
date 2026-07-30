import 'package:flutter/material.dart';
import 'package:battleasia_app/core/theme/app_colors.dart';

/// Web-matched glass gold edge button (battleasia.gg userGoldButtonSx).
class GoldButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool expanded;
  final IconData? icon;
  final bool uppercase;

  const GoldButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.expanded = true,
    this.icon,
    this.uppercase = true,
  });

  @override
  State<GoldButton> createState() => _GoldButtonState();
}

class _GoldButtonState extends State<GoldButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null && !widget.loading;
    final accent = AppColors.gold;
    final accentLight = AppColors.goldLight;
    final text = widget.uppercase ? widget.label.toUpperCase() : widget.label;

    final button = AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      transform: Matrix4.translationValues(0, _pressed && enabled ? 0 : 0, 0),
      decoration: BoxDecoration(
        color: enabled
            ? (_pressed
                ? AppColors.gold.withValues(alpha: 0.14)
                : Colors.black.withValues(alpha: 0.52))
            : Colors.black.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(
          color: enabled
              ? accent.withValues(alpha: _pressed ? 1 : 0.58)
              : accent.withValues(alpha: 0.22),
        ),
        boxShadow: enabled
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.45),
                  blurRadius: 28,
                  offset: const Offset(0, 8),
                ),
                if (_pressed)
                  BoxShadow(
                    color: accent.withValues(alpha: 0.22),
                    blurRadius: 24,
                    spreadRadius: 0,
                  ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.loading ? null : widget.onPressed,
          onHighlightChanged: enabled
              ? (value) => setState(() => _pressed = value)
              : null,
          borderRadius: BorderRadius.circular(2),
          splashColor: accent.withValues(alpha: 0.12),
          highlightColor: accent.withValues(alpha: 0.08),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            child: Center(
              child: widget.loading
                  ? SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: accent.withValues(alpha: 0.85),
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (widget.icon != null) ...[
                          Icon(
                            widget.icon,
                            size: 20,
                            color: enabled ? accentLight : accent.withValues(alpha: 0.35),
                          ),
                          const SizedBox(width: 10),
                        ],
                        Text(
                          text,
                          style: TextStyle(
                            color: enabled
                                ? (_pressed ? accentLight : accent)
                                : accent.withValues(alpha: 0.35),
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            letterSpacing: 1,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );

    if (widget.expanded) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
